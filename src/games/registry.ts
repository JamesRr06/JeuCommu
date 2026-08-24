import type { ComponentType } from 'react'
import type { GameId, Round, Session } from '../types'
import UndercoverGame from './undercover/UndercoverGame'
import LoupGarouGame from './loupgarou/LoupGarouGame'

export interface GameProps {
  session: Session
  onFinish: (round: Round) => void
  onQuit: () => void
}

export interface GameDef {
  id: GameId
  name: string
  emoji: string
  tagline: string
  minPlayers: number
  component: ComponentType<GameProps>
}

/** Ajouter un jeu = ajouter une entrée ici (et son GameId dans types.ts). */
export const GAMES: GameDef[] = [
  {
    id: 'undercover',
    name: 'Undercover',
    emoji: '🕵️',
    tagline: 'Un mot pour les civils, un autre pour l’infiltré. Décris sans te faire démasquer.',
    minPlayers: 3,
    component: UndercoverGame,
  },
  {
    id: 'loupgarou',
    name: 'Loup-Garou',
    emoji: '🐺',
    tagline: 'Nuits, pouvoirs et votes : le village contre la meute, guidé par l’app.',
    minPlayers: 4,
    component: LoupGarouGame,
  },
]

export function getGame(id: GameId): GameDef {
  return GAMES.find((g) => g.id === id)!
}
