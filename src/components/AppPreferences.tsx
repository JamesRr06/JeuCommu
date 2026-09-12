import { Segmented, Sheet } from './UI'
import { LOCALES, useT } from '../i18n'
import { setLocale, setTheme, usePrefs, type Theme } from '../prefs'

/**
 * Préférences de l'application — langue et apparence. Elles ne dépendent
 * d'aucune session : leur place est l'écran d'accueil, pas les réglages d'une partie.
 */
export default function AppPreferences({ onClose }: { onClose: () => void }) {
  const t = useT()
  const prefs = usePrefs()

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: t.prefs.system },
    { value: 'light', label: t.prefs.light },
    { value: 'dark', label: t.prefs.dark },
  ]

  return (
    <Sheet title={t.prefs.title} subtitle={t.prefs.subtitle} onClose={onClose}>
      <div className="card">
        <h3>{t.prefs.language}</h3>
        <Segmented
          label={t.prefs.language}
          options={LOCALES.map((l) => ({ value: l.code, label: l.label }))}
          value={prefs.locale}
          onChange={setLocale}
        />
      </div>

      <div className="card">
        <h3>{t.prefs.appearance}</h3>
        <Segmented label={t.prefs.appearance} options={themes} value={prefs.theme} onChange={setTheme} />
        <p className="muted">{t.prefs.note}</p>
      </div>
    </Sheet>
  )
}
