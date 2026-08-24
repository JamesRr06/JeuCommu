import { useMemo, useState } from 'react'
import { TopBar } from '../../components/UI'
import { Counter } from '../../components/UI'
import { normalize, pick, plural, shuffle, uid } from '../../lib'
import type { Camp, ID, PlayerResult, Round, Session } from '../../types'
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

interface Assignment {
  playerId: ID
  name: string
  role: UndercoverRole
  /** Mot reçu ; null pour Mr White. */
  word: string | null
  alive: boolean
}

type Phase =
  | { name: 'setup' }
  | { name: 'deal'; index: number; revealed: boolean }
  | { name: 'play' }
  | { name: 'eliminated'; playerId: ID }
  | { name: 'guess'; playerId: ID }
  | { name: 'result'; winner: Camp; reason: string }

export default function UndercoverGame({
  session,
  onFinish,
  onQuit,
}: {
  session: Session
  onFinish: (round: Round) => void
  onQuit: () => void
}) {
  const [selected, setSelected] = useState<ID[]>(session.players.map((p) => p.id))
  const [nbUndercover, setNbUndercover] = useState(1)
  const [nbMrWhite, setNbMrWhite] = useState(0)
  const [words, setWords] = useState<{ civil: string; undercover: string }>(() => {
    const [a, b] = pick(WORD_PAIRS)
    return { civil: a, undercover: b }
  })
  const [swapWords, setSwapWords] = useState(false)

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [target, setTarget] = useState<ID | null>(null)
  const [guess, setGuess] = useState('')
  const [starter, setStarter] = useState<string>('')

  const nbPlayers = selected.length
  const maxInfiltres = Math.max(1, Math.floor((nbPlayers - 1) / 2))
  const nbInfiltres = nbUndercover + nbMrWhite
  const setupError =
    nbPlayers < 3
      ? 'Il faut au moins 3 joueurs.'
      : nbInfiltres > maxInfiltres
        ? `Trop d'infiltrés : ${maxInfiltres} maximum pour ${nbPlayers} joueurs.`
        : nbUndercover < 1
          ? 'Il faut au moins 1 undercover.'
          : null

  const alive = useMemo(() => assignments.filter((a) => a.alive), [assignments])

  const civilWord = swapWords ? words.undercover : words.civil
  const undercoverWord = swapWords ? words.civil : words.undercover

  function togglePlayer(id: ID) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  function start() {
    const roles: UndercoverRole[] = []
    for (let i = 0; i < nbUndercover; i++) roles.push('undercover')
    for (let i = 0; i < nbMrWhite; i++) roles.push('mrwhite')
    while (roles.length < nbPlayers) roles.push('civil')

    const players = shuffle(session.players.filter((p) => selected.includes(p.id)))
    const shuffledRoles = shuffle(roles)
    const next: Assignment[] = players.map((p, i) => {
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
    setPhase({ name: 'play' })
  }

  /** Vérifie les conditions de victoire après une élimination. */
  function checkEnd(list: Assignment[]): { winner: Camp; reason: string } | null {
    const aliveList = list.filter((a) => a.alive)
    const infiltres = aliveList.filter((a) => a.role !== 'civil')
    const civils = aliveList.filter((a) => a.role === 'civil')
    if (infiltres.length === 0) {
      return { winner: 'civils', reason: 'Tous les infiltrés ont été démasqués.' }
    }
    if (infiltres.length >= civils.length) {
      const hasUndercover = infiltres.some((a) => a.role === 'undercover')
      return {
        winner: hasUndercover ? 'undercover' : 'mrwhite',
        reason: 'Les infiltrés sont aussi nombreux que les civils.',
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

  function resume(list: Assignment[] = assignments) {
    const end = checkEnd(list)
    if (end) setPhase({ name: 'result', ...end })
    else {
      setStarter(pick(list.filter((a) => a.alive)).name)
      setPhase({ name: 'play' })
    }
  }

  function submitGuess(correct: boolean) {
    if (correct) {
      setPhase({ name: 'result', winner: 'mrwhite', reason: `Mr White a deviné le mot : ${civilWord}.` })
    } else {
      resume()
    }
  }

  function save(winner: Camp, reason: string) {
    const scoring = session.scoring.undercover
    const results: PlayerResult[] = assignments.map((a) => {
      const camp = ROLE_CAMP[a.role]
      const won = camp === winner
      const points = won ? scoring[a.role === 'civil' ? 'civils' : a.role === 'undercover' ? 'undercover' : 'mrwhite'] : 0
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

  // ---------- Écrans ----------

  if (phase.name === 'setup') {
    return (
      <div className="app">
        <TopBar title="Undercover" subtitle="Réglages de la partie" onBack={onQuit} />
        <div className="content">
          <div className="card">
            <h3>Joueurs ({nbPlayers})</h3>
            <div className="list">
              {session.players.map((p) => (
                <button
                  key={p.id}
                  className={`item${selected.includes(p.id) ? ' selected' : ''}`}
                  onClick={() => togglePlayer(p.id)}
                >
                  <span className="grow">{p.name}</span>
                  <span className="badge">{selected.includes(p.id) ? 'Joue' : 'Absent'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Rôles</h3>
            <div className="row between">
              <span>Undercover</span>
              <Counter value={nbUndercover} min={1} max={Math.max(1, maxInfiltres)} onChange={setNbUndercover} />
            </div>
            <div className="row between">
              <span>Mr White</span>
              <Counter value={nbMrWhite} min={0} max={Math.max(0, maxInfiltres - 1)} onChange={setNbMrWhite} />
            </div>
            <p className="muted">
              {plural(Math.max(0, nbPlayers - nbInfiltres), 'civil')} · Mr White ne reçoit aucun mot et doit bluffer.
            </p>
          </div>

          <div className="card">
            <h3>Mots</h3>
            <div className="row between">
              <span className="muted">Civils</span>
              <strong>{civilWord}</strong>
            </div>
            <div className="row between">
              <span className="muted">Undercover</span>
              <strong>{undercoverWord}</strong>
            </div>
            <div className="row">
              <button
                className="grow small"
                onClick={() => {
                  const [a, b] = pick(WORD_PAIRS)
                  setWords({ civil: a, undercover: b })
                }}
              >
                Autres mots
              </button>
              <button className="grow small" onClick={() => setSwapWords((s) => !s)}>
                Inverser
              </button>
            </div>
          </div>

          {setupError && <p className="muted center-text">{setupError}</p>}
        </div>
        <div className="footer-actions">
          <button className="primary big block" disabled={!!setupError} onClick={start}>
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
        <div className="content">
          {!phase.revealed ? (
            <>
              <p className="muted center-text">Passe le téléphone à</p>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <span className="muted">Personne d’autre ne doit regarder l’écran.</span>
              </div>
              <button
                className="primary big block"
                onClick={() => setPhase({ name: 'deal', index: phase.index, revealed: true })}
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
          title="Undercover"
          subtitle={`${plural(alive.length, 'joueur')} en vie`}
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
        <div className="content">
          <div className="card">
            <h3>Tour de description</h3>
            <p>
              <strong>{starter}</strong> commence, puis on tourne. Un mot par joueur, sans dire son mot.
            </p>
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
          <button className="primary big block" disabled={!target} onClick={eliminate}>
            Éliminer
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'eliminated') {
    const a = assignments.find((x) => x.playerId === phase.playerId)!
    return (
      <div className="app">
        <TopBar title="Élimination" />
        <div className="content">
          <p className="big-name">{a.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{ROLE_LABEL[a.role]}</div>
              <div className="muted">{a.word ? `Son mot : ${a.word}` : 'Aucun mot'}</div>
            </div>
          </div>
          <button className="primary big block" onClick={() => afterElimination(phase.playerId)}>
            Continuer
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
        <div className="content">
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
      <div className="content">
        <div className="card">
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
              const won = camp === phase.winner
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
        <button className="primary big grow" onClick={() => save(phase.winner, phase.reason)}>
          Enregistrer au classement
        </button>
      </div>
    </div>
  )
}
