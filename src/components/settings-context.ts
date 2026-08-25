import { createContext } from 'react'

/**
 * Ouvre le panneau de réglages de l'écran courant.
 * Chaque écran fournit sa propre implémentation ; la barre de titre affiche
 * automatiquement l'engrenage dès qu'une valeur est présente.
 */
export const OpenSettings = createContext<(() => void) | null>(null)
