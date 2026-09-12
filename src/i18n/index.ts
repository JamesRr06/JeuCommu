import { getPrefs, usePrefs, type Locale } from '../prefs'
import { fr, type Dict } from './fr'
import { en } from './en'

export type { Dict }

const DICTS: Record<Locale, Dict> = { fr, en }

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'fr', label: fr.label },
  { code: 'en', label: en.label },
]

/**
 * Textes de la langue courante. Version hook : le composant se redessine
 * dès que la langue change.
 */
export function useT(): Dict {
  return DICTS[usePrefs().locale]
}

/** Même chose hors composant (store, écouteurs Capacitor, dialogues impératifs). */
export function t(): Dict {
  return DICTS[getPrefs().locale]
}
