import type { ReactNode } from 'react'
import { PlayerEditor, Sheet } from './UI'
import ConfigSuggestion from './ConfigSuggestion'
import ScoringEditor from './ScoringEditor'
import { useT } from '../i18n'
import type { GameDef } from '../games/registry'
import type { GameConfig, Player, Scoring } from '../types'

interface SettingsSheetProps {
  onClose: () => void
  subtitle?: string
  /** Nom de la session, quand il y en a une. */
  name?: { value: string; onChange: (v: string) => void }
  players?: {
    list: Player[]
    onAdd: (name: string) => boolean
    onRename: (id: string, name: string) => void
    onRemove: (id: string) => void
    removeMessage?: (p: Player) => string
    note?: string
  }
  game: GameDef
  /** Absent tant que l'effectif n'est pas arrêté (première étape de l'assistant). */
  config?: { value: GameConfig; onChange: (c: GameConfig) => void; playerCount: number }
  scoring: { value: Scoring; onChange: (s: Scoring) => void }
  footer?: ReactNode
}

/** Panneau de réglages, atteignable depuis l'engrenage de n'importe quel écran. */
export default function SettingsSheet({
  onClose,
  subtitle,
  name,
  players,
  game,
  config,
  scoring,
  footer,
}: SettingsSheetProps) {
  const t = useT()

  return (
    <Sheet title={t.settings.title} subtitle={subtitle} onClose={onClose}>
      {name && (
        <div className="card">
          <h3>{t.settings.sessionName}</h3>
          <input type="text" value={name.value} maxLength={40} onChange={(e) => name.onChange(e.target.value)} />
        </div>
      )}

      {players && (
        <div className="card">
          <h3>{t.settings.playersCount(players.list.length)}</h3>
          <PlayerEditor
            players={players.list}
            onAdd={players.onAdd}
            onRename={players.onRename}
            onRemove={players.onRemove}
            removeMessage={players.removeMessage}
          />
          {players.note && <p className="muted">{players.note}</p>}
        </div>
      )}

      {config && (
        <>
          <ConfigSuggestion
            game={game}
            playerCount={config.playerCount}
            config={config.value}
            onApply={config.onChange}
          />
          <game.ConfigEditor playerCount={config.playerCount} config={config.value} onChange={config.onChange} />
        </>
      )}

      <ScoringEditor games={[game]} label={t.scoring.short} scoring={scoring.value} onChange={scoring.onChange} />

      {footer}
    </Sheet>
  )
}
