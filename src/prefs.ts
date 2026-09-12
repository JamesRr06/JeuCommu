import { useSyncExternalStore } from 'react'

export type Locale = 'fr' | 'en'
export type Theme = 'system' | 'light' | 'dark'

export interface Prefs {
  locale: Locale
  theme: Theme
}

const KEY = 'jeucommu.prefs'

/** Première visite : on suit la langue du téléphone, puis le choix explicite prime. */
function detectLocale(): Locale {
  try {
    return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
  } catch {
    return 'fr'
  }
}

function load(): Prefs {
  const fallback: Prefs = { locale: detectLocale(), theme: 'system' }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      locale: parsed.locale === 'en' || parsed.locale === 'fr' ? parsed.locale : fallback.locale,
      theme:
        parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system'
          ? parsed.theme
          : 'system',
    }
  } catch {
    return fallback
  }
}

let prefs: Prefs = load()
const listeners = new Set<() => void>()

/** Couleur de la barre système d'Android/iOS, alignée sur le fond réel de l'app. */
const THEME_COLOR: Record<'light' | 'dark', string> = { light: '#f2f2f7', dark: '#000000' }

function resolved(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/** Reporte les préférences sur le document : thème, langue, couleur de barre système. */
export function applyPrefs() {
  const root = document.documentElement
  if (prefs.theme === 'system') delete root.dataset.theme
  else root.dataset.theme = prefs.theme
  root.lang = prefs.locale
  root.style.colorScheme = resolved(prefs.theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved(prefs.theme)])
}

function commit(next: Prefs) {
  prefs = next
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {
    /* stockage indisponible : la préférence vaut au moins pour cette session */
  }
  applyPrefs()
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    subscribe,
    () => prefs,
    () => prefs,
  )
}

export function getPrefs(): Prefs {
  return prefs
}

export function setLocale(locale: Locale) {
  commit({ ...prefs, locale })
}

export function setTheme(theme: Theme) {
  commit({ ...prefs, theme })
}

/** Le thème « Système » doit suivre l'appareil en direct, écran allumé. */
export function watchSystemTheme() {
  try {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    media.addEventListener('change', () => {
      if (prefs.theme === 'system') applyPrefs()
    })
  } catch {
    /* matchMedia indisponible : le thème reste celui du premier rendu */
  }
}
