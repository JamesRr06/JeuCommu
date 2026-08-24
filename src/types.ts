export type ID = string

export interface Player {
  id: ID
  name: string
}

/** Camps possibles, tous jeux confondus. */
export type Camp = 'civils' | 'undercover' | 'mrwhite' | 'village' | 'loups' | 'amoureux'

export const CAMP_LABEL: Record<Camp, string> = {
  civils: 'Civils',
  undercover: 'Undercover',
  mrwhite: 'Mr White',
  village: 'Village',
  loups: 'Loups-Garous',
  amoureux: 'Amoureux',
}

export type GameId = 'undercover' | 'loupgarou'

export interface PlayerResult {
  playerId: ID
  /** Libellé du rôle tenu pendant la partie (ex. "Voyante", "Undercover"). */
  role: string
  camp: Camp
  won: boolean
  points: number
}

export interface Round {
  id: ID
  gameId: GameId
  playedAt: number
  /** Résumé lisible affiché dans l'historique. */
  summary: string
  winnerCamp: Camp
  results: PlayerResult[]
}

/** Points attribués à chaque membre du camp gagnant. */
export interface Scoring {
  undercover: { civils: number; undercover: number; mrwhite: number }
  loupgarou: { village: number; loups: number; amoureux: number }
}

export const DEFAULT_SCORING: Scoring = {
  undercover: { civils: 1, undercover: 3, mrwhite: 4 },
  loupgarou: { village: 1, loups: 2, amoureux: 3 },
}

export interface Session {
  id: ID
  name: string
  createdAt: number
  players: Player[]
  scoring: Scoring
  rounds: Round[]
}

export const MAX_PLAYERS = 15

export interface RankRow {
  player: Player
  points: number
  wins: number
  played: number
  rank: number
}
