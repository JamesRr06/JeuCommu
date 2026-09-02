import { useMemo, useState } from 'react'
import { TopBar } from '../../components/UI'
import { haptic, normalize, pick, plural, shuffle, uid } from '../../lib'
import type { Camp, ID, PlayerResult, Round, UndercoverConfig } from '../../types'
import type { GameProps } from '../registry'
import { WORD_PAIRS } from './words'

type UndercoverRole = 'civil' | 'undercover' | 'mrwhite'

const ROLE_LABEL: Record<UndercoverRole, string> = {
  civil: 'Civil',
  undercover: 'Undercover',
  mrwhite: 'Mr White',
}

const ROLE_CAMP: Record<UndercoverRole, Camp> = {
  civil: 'civils',
  undercover: 'undercover',
  mrwhite: 'mrwhite',
}

/** Issue d'une partie : le camp affiché, et tous ceux qui marquent des points. */
interface Victory {
  winner: Camp
  reason: string
  scored: Camp[]
}

interface Assignment {
  playerId: ID
  name: string
  role: UndercoverRole
  /** Mot reçu ; null pour Mr White. */
  word: string | null
  alive: boolean
}

/** Tire une paire de mots au hasard, dans un sens ou dans l'autre. */
function drawWords(): { civil: string; undercover: string } {
  const [a, b] = pick(WORD_PAIRS)
  return Math.random() < 0.5 ? { civil: a, undercover: b } : { civil: b, undercover: a }
}

type Phase =
  | { name: 'intro' }
  | { name: 'deal'; index: number; revealed: boolean }
  | { name: 'play'; turn: number }
  | { name: 'eliminated'; playerId: ID }
  | { name: 'guess'; playerId: ID }
  | { name: 'result'; winner: Camp; reason: string; scored: Camp[] }

export default function UndercoverGame({ session, onFinish, onQuit }: GameProps) {
  // Composition et effectif viennent des réglages de la session.
  const config = session.config as UndercoverConfig
  const nbPlayers = session.players.length

  // Les mots ne sont jamais montrés avant la distribution : celui qui lance la partie ne doit pas les connaître.
  const [words, setWords] = useState(drawWords)

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [phase, setPhase] = useState<Phase>({ name: 'intro' })
  const [target, setTarget] = useState<ID | null>(null)
  const [guess, setGuess] = useState('')
  const [starter, setStarter] = useState<string>('')

  const alive = useMemo(() => assignments.filter((a) => a.alive), [assignments])

  /** Le tour en cours se déduit du nombre d'éliminés : un tour par élimination. */
  const turnOf = (list: Assignment[]) => list.filter((a) => !a.alive).length + 1

  const civilWord = words.civil
  const undercoverWord = words.undercover

  function start() {
    const roles: UndercoverRole[] = []
    for (let i = 0; i < config.nbUndercover; i++) roles.push('undercover')
    for (let i = 0; i < config.nbMrWhite; i++) roles.push('mrwhite')
    while (roles.length < nbPlayers) roles.push('civil')

    // Seuls les rôles sont mélangés : le téléphone tourne dans l'ordre de la table.
    const shuffledRoles = shuffle(roles)
    const next: Assignment[] = session.players.map((p, i) => {
      const role = shuffledRoles[i]
      return {
        playerId: p.id,
        name: p.name,
        role,
        word: role === 'civil' ? civilWord : role === 'undercover' ? undercoverWord : null,
        alive: true,
      }
    })
    setAssignments(next)
    setPhase({ name: 'deal', index: 0, revealed: false })
  }

  function endOfDeal() {
    setStarter(pick(assignments).name)
    setPhase({ name: 'play', turn: 1 })
  }

  /**
   * Vérifie les conditions de victoire après une élimination.
   * `scored` liste les camps qui marquent : à la parité les infiltrés l'emportent
   * ensemble, Undercover et Mr White compris, chacun à son propre barème.
   */
  function checkEnd(list: Assignment[]): Victory | null {
    const aliveList = list.filter((a) => a.alive)
    const infiltres = aliveList.filter((a) => a.role !== 'civil')
    const civils = aliveList.filter((a) => a.role === 'civil')
    if (infiltres.length === 0) {
      return { winner: 'civils', reason: 'Tous les infiltrés ont été démasqués.', scored: ['civils'] }
    }
    if (infiltres.length >= civils.length) {
      const hasUndercover = infiltres.some((a) => a.role === 'undercover')
      return {
        winner: hasUndercover ? 'undercover' : 'mrwhite',
        reason: 'Les infiltrés sont aussi nombreux que les civils.',
        scored: ['undercover', 'mrwhite'],
      }
    }
    return null
  }

  function eliminate() {
    if (!target) return
    const next = assignments.map((a) => (a.playerId === target ? { ...a, alive: false } : a))
    setAssignments(next)
    setPhase({ name: 'eliminated', playerId: target })
    setTarget(null)
  }

  function afterElimination(playerId: ID) {
    const eliminated = assignments.find((a) => a.playerId === playerId)!
    if (eliminated.role === 'mrwhite') {
      setGuess('')
      setPhase({ name: 'guess', playerId })
      return
    }
    resume()
  }

  /** Retour au débat après une élimination : un tour de plus, les mêmes mots. */
  function resume(list: Assignment[] = assignments) {
    const end = checkEnd(list)
    if (end) {
      setPhase({ name: 'result', ...end })
      return
    }
    setStarter(pick(list.filter((a) => a.alive)).name)
    setPhase({ name: 'play', turn: turnOf(list) })
  }

  function submitGuess(correct: boolean) {
    if (correct) {
      setPhase({
        name: 'result',
        winner: 'mrwhite',
        reason: `Mr White a deviné le mot : ${civilWord}.`,
        scored: ['mrwhite'],
      })
    } else {
      resume()
    }
  }

  function save({ winner, reason, scored }: Victory) {
    const scoring = session.scoring.undercover
    const results: PlayerResult[] = assignments.map((a) => {
      const camp = ROLE_CAMP[a.role]
      const won = scored.includes(camp)
      const points = won ? (scoring[camp] ?? 0) : 0
      return { playerId: a.playerId, role: ROLE_LABEL[a.role], camp, won, points }
    })
    const round: Round = {
      id: uid(),
      gameId: 'undercover',
      playedAt: Date.now(),
      summary: `${civilWord} / ${undercoverWord} — ${reason}`,
      winnerCamp: winner,
      results,
    }
    onFinish(round)
  }

  // Change à chaque écran : remonte le contenu et rejoue l'animation d'entrée.
  const phaseKey = JSON.stringify(phase)

  // ---------- Écrans ----------

  if (phase.name === 'intro') {
    return (
      <div className="app">
        <TopBar title="Undercover" subtitle={`${plural(nbPlayers, 'joueur')} · prêt ?`} onBack={onQuit} />
        <div className="content fade-step" key={phaseKey}>
          <div className="card">
            <h3>Composition</h3>
            <div className="row wrap chips">
              <span className="badge accent">{plural(nbPlayers - config.nbUndercover - config.nbMrWhite, 'civil')}</span>
              <span className="badge accent">{plural(config.nbUndercover, 'undercover')}</span>
              <span className="badge accent">{config.nbMrWhite} Mr White</span>
            </div>
            <p className="muted">Modifiable à tout moment depuis l’engrenage.</p>
          </div>

          <div className="card">
            <h3>Les mots</h3>
            <div className="reveal" style={{ minHeight: 96 }}>
              <span className="muted">
                Cachés — celui qui lance la partie ne doit pas les connaître.
              </span>
            </div>
            <p className="muted">
              Chaque joueur découvrira le sien pendant la distribution, à l’abri des regards.
            </p>
            <button className="small block" onClick={() => setWords(drawWords())}>
              Tirer une autre paire, sans la voir
            </button>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={start}>
            Distribuer les mots
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'deal') {
    const current = assignments[phase.index]
    const last = phase.index === assignments.length - 1
    return (
      <div className="app">
        <TopBar title="Distribution" subtitle={`${phase.index + 1} / ${assignments.length}`} />
        <div className="content fade-step" key={phaseKey}>
          {!phase.revealed ? (
            <>
              <p className="muted center-text">Passe le téléphone à</p>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <span className="muted">Personne d’autre ne doit regarder l’écran.</span>
              </div>
              <button
                className="primary big block"
                onClick={() => {
                  haptic()
                  setPhase({ name: 'deal', index: phase.index, revealed: true })
                }}
              >
                Voir mon mot
              </button>
            </>
          ) : (
            <>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                {current.word ? (
                  <div>
                    <div className="muted">Ton mot</div>
                    <div className="word">{current.word}</div>
                  </div>
                ) : (
                  <div>
                    <div className="role">Mr White</div>
                    <div className="muted">Tu n’as pas de mot : écoute et bluffe.</div>
                  </div>
                )}
              </div>
              <button
                className="primary big block"
                onClick={() =>
                  last ? endOfDeal() : setPhase({ name: 'deal', index: phase.index + 1, revealed: false })
                }
              >
                {last ? 'Tout le monde a vu' : 'Suivant'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase.name === 'play') {
    return (
      <div className="app">
        <TopBar
          title={`Tour ${phase.turn}`}
          subtitle={`${plural(alive.length, 'joueur')} en vie · mêmes mots`}
          right={
            <button
              className="icon"
              onClick={() => {
                if (confirm('Abandonner la partie en cours ?')) onQuit()
              }}
            >
              ✕
            </button>
          }
        />
        <div className="content fade-step" key={phaseKey}>
          <div className="card hero">
            <span className="game-emoji big">🗣️</span>
            <h2>Tour {phase.turn}</h2>
            <p className="muted">
              <strong>{starter}</strong> commence, puis on tourne. Un mot par joueur, sans dire son mot.
            </p>
            <div className="row wrap chips center">
              <span className="badge accent">{plural(alive.length, 'joueur')} en vie</span>
              {assignments.length > alive.length && (
                <span className="badge">{plural(assignments.length - alive.length, 'éliminé')}</span>
              )}
            </div>
          </div>
          <div className="card">
            <h3>Vote : qui est éliminé ?</h3>
            <div className="list">
              {assignments.map((a) => (
                <button
                  key={a.playerId}
                  className={`item${target === a.playerId ? ' selected' : ''}${a.alive ? '' : ' dead'}`}
                  disabled={!a.alive}
                  onClick={() => setTarget(a.playerId)}
                >
                  <span className="grow">{a.name}</span>
                  {!a.alive && <span className="badge danger">{ROLE_LABEL[a.role]}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <button
            className="primary big block"
            disabled={!target}
            onClick={() => {
              haptic([18, 40, 18])
              eliminate()
            }}
          >
            Éliminer
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'eliminated') {
    const a = assignments.find((x) => x.playerId === phase.playerId)!
    const suite =
      a.role === 'mrwhite'
        ? 'Dernière chance de Mr White'
        : checkEnd(assignments)
          ? 'Voir le résultat'
          : `Lancer le tour ${turnOf(assignments)}`
    return (
      <div className="app">
        <TopBar title="Élimination" subtitle={`Tour ${turnOf(assignments) - 1} terminé`} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{a.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{ROLE_LABEL[a.role]}</div>
              <div className="muted">{a.word ? `Son mot : ${a.word}` : 'Aucun mot'}</div>
            </div>
          </div>
          <button className="primary big block" onClick={() => afterElimination(phase.playerId)}>
            {suite}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'guess') {
    const a = assignments.find((x) => x.playerId === phase.playerId)!
    const auto = normalize(guess) === normalize(civilWord)
    return (
      <div className="app">
        <TopBar title="Dernière chance" subtitle="Mr White devine le mot" />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{a.name}</p>
          <div className="card">
            <h3>Quel est le mot des civils ?</h3>
            <input
              type="text"
              value={guess}
              autoFocus
              placeholder="Ta proposition"
              onChange={(e) => setGuess(e.target.value)}
            />
            <button className="primary block" disabled={!guess.trim()} onClick={() => submitGuess(auto)}>
              Valider
            </button>
            <div className="sep" />
            <p className="muted">Le narrateur peut aussi trancher directement :</p>
            <div className="row">
              <button className="grow small" onClick={() => submitGuess(true)}>
                C’était juste
              </button>
              <button className="grow small" onClick={() => submitGuess(false)}>
                C’était faux
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // phase.name === 'result'
  const scoring = session.scoring.undercover
  const campPoints: Record<string, number> = {
    civils: scoring.civils,
    undercover: scoring.undercover,
    mrwhite: scoring.mrwhite,
  }
  return (
    <div className="app">
      <TopBar title="Fin de la partie" />
      <div className="content fade-step" key={phaseKey}>
        <div className="card victory">
          <span className="trophy">🏆</span>
          <h2>
            Victoire :{' '}
            {phase.winner === 'civils' ? 'les Civils' : phase.winner === 'undercover' ? 'les Undercover' : 'Mr White'}
          </h2>
          <p className="muted">{phase.reason}</p>
          <div className="row wrap">
            <span className="badge accent">Civils : {civilWord}</span>
            <span className="badge accent">Undercover : {undercoverWord}</span>
          </div>
        </div>
        <div className="card">
          <h3>Points</h3>
          <div className="list">
            {assignments.map((a) => {
              const camp = ROLE_CAMP[a.role]
              const won = phase.scored.includes(camp)
              return (
                <div key={a.playerId} className="item">
                  <span className="grow">{a.name}</span>
                  <span className="badge">{ROLE_LABEL[a.role]}</span>
                  <span className={`badge ${won ? 'success' : ''}`}>
                    +{won ? campPoints[camp] : 0}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="footer-actions">
        <button className="ghost" onClick={onQuit}>
          Ignorer
        </button>
        <button className="primary big grow" onClick={() => save(phase)}>
          Enregistrer au classement
        </button>
      </div>
    </div>
  )
}
