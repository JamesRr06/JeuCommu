export type ID = string

export interface Player {
  id: ID
  name: string
}

/** Camps possibles, tous jeux confondus. */
export type Camp = 'civils' | 'undercover' | 'mrwhite' | 'village' | 'loups' | 'amoureux' | 'solitaire'

export const CAMP_LABEL: Record<Camp, string> = {
  civils: 'Civils',
  undercover: 'Undercover',
  mrwhite: 'Mr White',
  village: 'Village',
  loups: 'Loups-Garous',
  amoureux: 'Amoureux',
  solitaire: 'Loup-Garou Blanc',
}

export type GameId = 'undercover' | 'loupgarou'

// ---------- Réglages propres à chaque jeu ----------

export interface UndercoverConfig {
  nbUndercover: number
  nbMrWhite: number
}

export interface LoupGarouConfig {
  nbLoups: number
  /** Identifiants des rôles spéciaux retenus (voir games/loupgarou/roles.ts). */
  specials: string[]
  /** Durée du débat du jour, en minutes. 0 = pas de minuteur. */
  debateMinutes: number
}

export const DEFAULT_DEBATE_MINUTES = 5

/** Chaque jeu lit la variante qui le concerne (cast en tête de son composant). */
export type GameConfig = UndercoverConfig | LoupGarouConfig

// ---------- Parties et classement ----------

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

/** Points attribués à chaque membre du camp gagnant, par jeu puis par camp. */
export type Scoring = Record<GameId, Record<string, number>>

export const DEFAULT_SCORING: Scoring = {
  undercover: { civils: 1, undercover: 3, mrwhite: 4 },
  loupgarou: { village: 1, loups: 2, amoureux: 3, solitaire: 5 },
}

/** Une session = un jeu, une liste de joueurs, des réglages, et les parties jouées. */
export interface Session {
  id: ID
  name: string
  gameId: GameId
  createdAt: number
  players: Player[]
  config: GameConfig
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
