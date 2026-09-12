import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyPrefs, watchSystemTheme } from './prefs'
import './styles.css'

// Thème et langue avant le premier rendu : pas de clignotement au démarrage.
applyPrefs()
watchSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
