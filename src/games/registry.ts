import type { ComponentType } from 'react'
import type { GameConfig, GameId, Round, Session } from '../types'
import UndercoverGame from './undercover/UndercoverGame'
import LoupGarouGame from './loupgarou/LoupGarouGame'
import * as undercoverConfig from './undercover/config'
import * as loupgarouConfig from './loupgarou/config'

export interface GameProps {
  session: Session
  onFinish: (round: Round) => void
  onQuit: () => void
}

/** Éditeur des réglages du jeu, réutilisé par l'assistant de création et par les réglages. */
export interface ConfigEditorProps {
  playerCount: number
  config: GameConfig
  onChange: (config: GameConfig) => void
}

export interface GameDef {
  id: GameId
  name: string
  emoji: string
  tagline: string
  /** Quelques points clés affichés sur la carte du menu. */
  highlights: string[]
  minPlayers: number
  /** Camps rétribués, dans l'ordre d'affichage du barème. */
  camps: { key: string; label: string }[]
  /** Composition conseillée pour cet effectif, proposée au narrateur sans être imposée. */
  suggest: (playerCount: number) => GameConfig
  validate: (playerCount: number, config: GameConfig) => string | null
  /** Résumé court des réglages, affiché sur l'écran de session. */
  describe: (playerCount: number, config: GameConfig) => string[]
  ConfigEditor: ComponentType<ConfigEditorProps>
  component: ComponentType<GameProps>
}

/** Ajouter un jeu = ajouter une entrée ici (et son GameId dans types.ts). */
export const GAMES: GameDef[] = [
  {
    id: 'undercover',
    name: 'Undercover',
    emoji: '🕵️',
    tagline: 'Un mot pour les civils, un autre pour l’infiltré. Décris sans te faire démasquer.',
    highlights: ['Distribution des mots en privé', 'Vote et élimination', 'Mr White peut voler la victoire'],
    minPlayers: 3,
    camps: [
      { key: 'civils', label: 'Civils' },
      { key: 'undercover', label: 'Undercover' },
      { key: 'mrwhite', label: 'Mr White' },
    ],
    suggest: undercoverConfig.suggest,
    validate: undercoverConfig.validate,
    describe: undercoverConfig.describe,
    ConfigEditor: undercoverConfig.ConfigEditor,
    component: UndercoverGame,
  },
  {
    id: 'loupgarou',
    name: 'Loup-Garou',
    emoji: '🐺',
    tagline: 'Nuits, pouvoirs et votes : le village contre la meute, guidé par l’app.',
    highlights: ['Narrateur guidé étape par étape', '24 rôles au choix', 'Morts et victoires calculées'],
    minPlayers: 4,
    camps: [
      { key: 'village', label: 'Village' },
      { key: 'loups', label: 'Loups-Garous' },
      { key: 'amoureux', label: 'Amoureux' },
      { key: 'solitaire', label: 'Loup-Garou Blanc' },
    ],
    suggest: loupgarouConfig.suggest,
    validate: loupgarouConfig.validate,
    describe: loupgarouConfig.describe,
    ConfigEditor: loupgarouConfig.ConfigEditor,
    component: LoupGarouGame,
  },
]

export function getGame(id: GameId): GameDef {
  return GAMES.find((g) => g.id === id)!
}
