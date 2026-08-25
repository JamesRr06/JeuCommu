import { useSyncExternalStore } from 'react'
import { uid } from './lib'
import {
  DEFAULT_SCORING,
  MAX_PLAYERS,
  type GameConfig,
  type GameId,
  type ID,
  type Player,
  type RankRow,
  type Round,
  type Scoring,
  type Session,
} from './types'

const KEY = 'jeucommu.v1'

interface State {
  sessions: Session[]
  /** Barème proposé par défaut aux nouvelles sessions (modifiable depuis les réglages). */
  defaults: Scoring
}

function empty(): State {
  return { sessions: [], defaults: structuredClone(DEFAULT_SCORING) }
}

function mergeScoring(scoring: Partial<Scoring> | undefined): Scoring {
  const merged = structuredClone(DEFAULT_SCORING)
  for (const game of Object.keys(merged) as GameId[]) {
    Object.assign(merged[game], scoring?.[game] ?? {})
  }
  return merged
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as Partial<State>
    if (!parsed || !Array.isArray(parsed.sessions)) return empty()
    // Tolère les sessions écrites par une version antérieure du modèle.
    for (const s of parsed.sessions) {
      s.rounds ??= []
      s.players ??= []
      s.gameId ??= s.rounds[0]?.gameId ?? 'undercover'
      s.scoring = mergeScoring(s.scoring)
      s.config ??= { nbUndercover: 1, nbMrWhite: 0 }
    }
    return { sessions: parsed.sessions, defaults: mergeScoring(parsed.defaults) }
  } catch {
    return empty()
  }
}

let state: State = empty()
let loaded = false

const listeners = new Set<() => void>()

function ensureLoaded() {
  if (!loaded) {
    state = load()
    loaded = true
  }
}

function commit(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* stockage plein ou indisponible : on garde au moins l'état en mémoire */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  ensureLoaded()
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

function snapshot(): State {
  ensureLoaded()
  return state
}

export function useSessions(): Session[] {
  return useSyncExternalStore(subscribe, snapshot).sessions
}

export function useSession(id: ID | null): Session | undefined {
  const sessions = useSessions()
  return sessions.find((s) => s.id === id)
}

/** Barème par défaut des futures sessions. */
export function useDefaultScoring(): Scoring {
  return useSyncExternalStore(subscribe, snapshot).defaults
}

export function setDefaultScoring(scoring: Scoring) {
  ensureLoaded()
  commit({ ...state, defaults: scoring })
}

function updateSession(id: ID, fn: (s: Session) => Session) {
  ensureLoaded()
  commit({ ...state, sessions: state.sessions.map((s) => (s.id === id ? fn(s) : s)) })
}

/** Fabrique un joueur hors session (utilisé par l'assistant de création). */
export function newPlayer(name: string): Player {
  return { id: uid(), name: name.trim() }
}

export function createSession(input: {
  name: string
  gameId: GameId
  players: Player[]
  config: GameConfig
  scoring: Scoring
}): Session {
  ensureLoaded()
  const session: Session = {
    id: uid(),
    name: input.name.trim() || 'Session',
    gameId: input.gameId,
    createdAt: Date.now(),
    players: input.players.slice(0, MAX_PLAYERS),
    config: structuredClone(input.config),
    scoring: structuredClone(input.scoring),
    rounds: [],
  }
  commit({ ...state, sessions: [session, ...state.sessions] })
  return session
}

export function deleteSession(id: ID) {
  ensureLoaded()
  commit({ ...state, sessions: state.sessions.filter((s) => s.id !== id) })
}

export function renameSession(id: ID, name: string) {
  updateSession(id, (s) => ({ ...s, name: name.trim() || s.name }))
}

export function addPlayer(sessionId: ID, name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed) return false
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session || session.players.length >= MAX_PLAYERS) return false
  if (session.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return false
  updateSession(sessionId, (s) => ({ ...s, players: [...s.players, newPlayer(trimmed)] }))
  return true
}

export function renamePlayer(sessionId: ID, playerId: ID, name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  updateSession(sessionId, (s) => ({
    ...s,
    players: s.players.map((p) => (p.id === playerId ? { ...p, name: trimmed } : p)),
  }))
}

/** Retire un joueur de la liste. Les parties déjà jouées le gardent au classement. */
export function removePlayer(sessionId: ID, playerId: ID) {
  updateSession(sessionId, (s) => ({ ...s, players: s.players.filter((p) => p.id !== playerId) }))
}

export function setConfig(sessionId: ID, config: GameConfig) {
  updateSession(sessionId, (s) => ({ ...s, config }))
}

export function setScoring(sessionId: ID, scoring: Scoring) {
  updateSession(sessionId, (s) => ({ ...s, scoring }))
}

export function addRound(sessionId: ID, round: Round) {
  updateSession(sessionId, (s) => ({ ...s, rounds: [round, ...s.rounds] }))
}

export function deleteRound(sessionId: ID, roundId: ID) {
  updateSession(sessionId, (s) => ({ ...s, rounds: s.rounds.filter((r) => r.id !== roundId) }))
}

/**
 * Classement de la session : points cumulés, puis nombre de victoires,
 * puis nombre de parties jouées (moins de parties = mieux classé à égalité).
 * Les joueurs supprimés de la session mais présents dans l'historique restent listés.
 */
export function ranking(session: Session): RankRow[] {
  const rows = new Map<ID, RankRow>()
  const ensure = (player: Player): RankRow => {
    let row = rows.get(player.id)
    if (!row) {
      row = { player, points: 0, wins: 0, played: 0, rank: 0 }
      rows.set(player.id, row)
    }
    return row
  }

  session.players.forEach(ensure)

  for (const round of session.rounds) {
    for (const res of round.results) {
      const known = session.players.find((p) => p.id === res.playerId)
      const row = ensure(known ?? { id: res.playerId, name: '(joueur retiré)' })
      row.points += res.points
      row.played += 1
      if (res.won) row.wins += 1
    }
  }

  const sorted = [...rows.values()].sort(
    (a, b) => b.points - a.points || b.wins - a.wins || a.played - b.played || a.player.name.localeCompare(b.player.name),
  )

  let lastKey = ''
  let lastRank = 0
  sorted.forEach((row, i) => {
    const key = `${row.points}/${row.wins}/${row.played}`
    if (key !== lastKey) {
      lastRank = i + 1
      lastKey = key
    }
    row.rank = lastRank
  })
  return sorted
}
