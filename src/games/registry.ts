import type { ComponentType } from 'react'
import type { Dict } from '../i18n'
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

/**
 * Définition d'un jeu. Tout ce qui s'affiche reçoit le dictionnaire courant en
 * argument : la langue peut changer sans recharger l'application.
 */
export interface GameDef {
  id: GameId
  emoji: string
  minPlayers: number
  name: (t: Dict) => string
  tagline: (t: Dict) => string
  /** Quelques points clés affichés sur la carte du menu. */
  highlights: (t: Dict) => string[]
  /** Camps rétribués, dans l'ordre d'affichage du barème. */
  camps: (t: Dict) => { key: string; label: string }[]
  /** Composition conseillée pour cet effectif, proposée au narrateur sans être imposée. */
  suggest: (playerCount: number) => GameConfig
  validate: (playerCount: number, config: GameConfig, t: Dict) => string | null
  /** Résumé court des réglages, affiché sur l'écran de session. */
  describe: (playerCount: number, config: GameConfig, t: Dict) => string[]
  ConfigEditor: ComponentType<ConfigEditorProps>
  component: ComponentType<GameProps>
}

/** Ajouter un jeu = ajouter une entrée ici (et son GameId dans types.ts). */
export const GAMES: GameDef[] = [
  {
    id: 'undercover',
    emoji: '🕵️',
    minPlayers: 3,
    name: (t) => t.games.undercover.name,
    tagline: (t) => t.games.undercover.tagline,
    highlights: (t) => t.games.undercover.highlights,
    camps: (t) => [
      { key: 'civils', label: t.camps.civils },
      { key: 'undercover', label: t.camps.undercover },
      { key: 'mrwhite', label: t.camps.mrwhite },
    ],
    suggest: undercoverConfig.suggest,
    validate: undercoverConfig.validate,
    describe: undercoverConfig.describe,
    ConfigEditor: undercoverConfig.ConfigEditor,
    component: UndercoverGame,
  },
  {
    id: 'loupgarou',
    emoji: '🐺',
    minPlayers: 4,
    name: (t) => t.games.loupgarou.name,
    tagline: (t) => t.games.loupgarou.tagline,
    highlights: (t) => t.games.loupgarou.highlights,
    camps: (t) => [
      { key: 'village', label: t.camps.village },
      { key: 'loups', label: t.camps.loups },
      { key: 'amoureux', label: t.camps.amoureux },
      { key: 'solitaire', label: t.camps.solitaire },
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
