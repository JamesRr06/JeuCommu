import { useMemo, useState } from 'react'
import { QuitButton, TopBar } from '../../components/UI'
import { useT } from '../../i18n'
import { getPrefs } from '../../prefs'
import { haptic, normalize, pick, shuffle, uid } from '../../lib'
import type { Camp, ID, PlayerResult, Round, UndercoverConfig } from '../../types'
import type { GameProps } from '../registry'
import { WORD_PAIRS } from './words'

type UndercoverRole = 'civil' | 'undercover' | 'mrwhite'

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

/** Tire une paire de mots au hasard dans la langue courante, dans un sens ou dans l'autre. */
function drawWords(): { civil: string; undercover: string } {
  const [a, b] = pick(WORD_PAIRS[getPrefs().locale])
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
  const t = useT()
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

  const roleLabel: Record<UndercoverRole, string> = t.uc.roles

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
      return { winner: 'civils', reason: t.uc.reasonAllFound, scored: ['civils'] }
    }
    if (infiltres.length >= civils.length) {
      const hasUndercover = infiltres.some((a) => a.role === 'undercover')
      return {
        winner: hasUndercover ? 'undercover' : 'mrwhite',
        reason: t.uc.reasonParity,
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
        reason: t.uc.reasonGuessed(civilWord),
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
      return { playerId: a.playerId, role: roleLabel[a.role], camp, won, points }
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
        <TopBar title={t.games.undercover.name} subtitle={t.uc.ready(nbPlayers)} onBack={onQuit} />
        <div className="content fade-step" key={phaseKey}>
          <div className="card">
            <h3>{t.games.undercover.composition}</h3>
            <div className="row wrap chips">
              <span className="badge accent">
                {t.games.undercover.civilians(nbPlayers - config.nbUndercover - config.nbMrWhite)}
              </span>
              <span className="badge accent">{t.games.undercover.undercovers(config.nbUndercover)}</span>
              <span className="badge accent">{t.games.undercover.mrWhites(config.nbMrWhite)}</span>
            </div>
            <p className="muted">{t.uc.settingsHint}</p>
          </div>

          <div className="card">
            <h3>{t.uc.words}</h3>
            <div className="reveal short">
              <span className="muted">{t.uc.wordsHidden}</span>
            </div>
            <p className="muted">{t.uc.wordsNote}</p>
            <button className="tinted block" onClick={() => setWords(drawWords())}>
              {t.uc.redraw}
            </button>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={start}>
            {t.uc.deal}
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
        <TopBar title={t.uc.dealing} subtitle={`${phase.index + 1} / ${assignments.length}`} />
        <div className="content fade-step" key={phaseKey}>
          {!phase.revealed ? (
            <>
              <p className="muted center-text">{t.uc.passTo}</p>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <span className="muted">{t.uc.noPeeking}</span>
              </div>
              <button
                className="primary big block"
                onClick={() => {
                  haptic()
                  setPhase({ name: 'deal', index: phase.index, revealed: true })
                }}
              >
                {t.uc.seeMyWord}
              </button>
            </>
          ) : (
            <>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                {current.word ? (
                  <div>
                    <div className="muted">{t.uc.myWord}</div>
                    <div className="word">{current.word}</div>
                  </div>
                ) : (
                  <div>
                    <div className="role">{t.camps.mrwhite}</div>
                    <div className="muted">{t.uc.noWord}</div>
                  </div>
                )}
              </div>
              <button
                className="primary big block"
                onClick={() =>
                  last ? endOfDeal() : setPhase({ name: 'deal', index: phase.index + 1, revealed: false })
                }
              >
                {last ? t.uc.everyoneSaw : t.common.next}
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
          title={t.uc.turn(phase.turn)}
          subtitle={t.uc.turnSub(alive.length)}
          right={<QuitButton onQuit={onQuit} />}
        />
        <div className="content fade-step" key={phaseKey}>
          <div className="card hero">
            <span className="game-emoji big">🗣️</span>
            <h2>{t.uc.turn(phase.turn)}</h2>
            <p className="muted">{t.uc.starter(starter)}</p>
            <div className="row wrap chips center">
              <span className="badge accent">{t.uc.aliveBadge(alive.length)}</span>
              {assignments.length > alive.length && (
                <span className="badge">{t.common.eliminated(assignments.length - alive.length)}</span>
              )}
            </div>
          </div>
          <div className="card">
            <h3>{t.uc.voteTitle}</h3>
            <div className="list">
              {assignments.map((a) => (
                <button
                  key={a.playerId}
                  className={`item${target === a.playerId ? ' selected' : ''}${a.alive ? '' : ' dead'}`}
                  disabled={!a.alive}
                  onClick={() => setTarget(a.playerId)}
                >
                  <span className="grow">{a.name}</span>
                  {!a.alive && <span className="badge danger">{roleLabel[a.role]}</span>}
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
            {t.uc.eliminate}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'eliminated') {
    const a = assignments.find((x) => x.playerId === phase.playerId)!
    const suite =
      a.role === 'mrwhite'
        ? t.uc.nextMrWhite
        : checkEnd(assignments)
          ? t.uc.seeResult
          : t.uc.startTurn(turnOf(assignments))
    return (
      <div className="app">
        <TopBar title={t.uc.elimination} subtitle={t.uc.turnDone(turnOf(assignments) - 1)} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{a.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{roleLabel[a.role]}</div>
              <div className="muted">{a.word ? t.uc.hisWord(a.word) : t.uc.noWordShort}</div>
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
        <TopBar title={t.uc.lastChance} subtitle={t.uc.lastChanceSub} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{a.name}</p>
          <div className="card">
            <h3>{t.uc.guessAsk}</h3>
            <input
              type="text"
              value={guess}
              autoFocus
              placeholder={t.uc.guessPlaceholder}
              onChange={(e) => setGuess(e.target.value)}
            />
            <button className="primary block" disabled={!guess.trim()} onClick={() => submitGuess(auto)}>
              {t.common.validate}
            </button>
            <div className="sep" />
            <p className="muted">{t.uc.narratorDecides}</p>
            <div className="row">
              <button className="grow small" onClick={() => submitGuess(true)}>
                {t.uc.wasRight}
              </button>
              <button className="grow small" onClick={() => submitGuess(false)}>
                {t.uc.wasWrong}
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
      <TopBar title={t.result.title} />
      <div className="content fade-step" key={phaseKey}>
        <div className="card victory">
          <span className="trophy">🏆</span>
          <h2>
            {t.result.victory(
              phase.winner === 'civils'
                ? t.uc.winners.civils
                : phase.winner === 'undercover'
                  ? t.uc.winners.undercover
                  : t.uc.winners.mrwhite,
            )}
          </h2>
          <p className="muted">{phase.reason}</p>
          <div className="row wrap chips center">
            <span className="badge accent">{t.uc.civilWord(civilWord)}</span>
            <span className="badge accent">{t.uc.undercoverWord(undercoverWord)}</span>
          </div>
        </div>
        <div className="card">
          <h3>{t.result.points}</h3>
          <div className="list">
            {assignments.map((a) => {
              const camp = ROLE_CAMP[a.role]
              const won = phase.scored.includes(camp)
              return (
                <div key={a.playerId} className="item">
                  <span className="grow">{a.name}</span>
                  <span className="badge">{roleLabel[a.role]}</span>
                  <span className={`badge ${won ? 'success' : ''}`}>+{won ? campPoints[camp] : 0}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="footer-actions">
        <button className="ghost" onClick={onQuit}>
          {t.common.ignore}
        </button>
        <button className="primary big grow" onClick={() => save(phase)}>
          {t.result.save}
        </button>
      </div>
    </div>
  )
}
