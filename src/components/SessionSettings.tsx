import { ConfirmButton } from './UI'
import SettingsSheet from './SettingsSheet'
import {
  addPlayer,
  deleteSession,
  removePlayer,
  renamePlayer,
  renameSession,
  setConfig,
  setScoring,
  useSession,
} from '../store'
import { getGame } from '../games/registry'
import type { ID } from '../types'

/** Réglages d'une session existante — identiques depuis l'écran de session ou en pleine partie. */
export default function SessionSettings({
  sessionId,
  onClose,
  onDeleted,
}: {
  sessionId: ID
  onClose: () => void
  onDeleted: () => void
}) {
  const session = useSession(sessionId)
  if (!session) return null
  const game = getGame(session.gameId)

  return (
    <SettingsSheet
      onClose={onClose}
      subtitle={`${game.emoji} ${session.name}`}
      name={{ value: session.name, onChange: (v) => renameSession(sessionId, v) }}
      players={{
        list: session.players,
        onAdd: (n) => addPlayer(sessionId, n),
        onRename: (id, n) => renamePlayer(sessionId, id, n),
        onRemove: (id) => removePlayer(sessionId, id),
        removeMessage: (p) => `Retirer ${p.name} ? Ses parties déjà jouées restent au classement.`,
        note: 'Les changements s’appliquent à la prochaine partie.',
      }}
      game={game}
      config={{
        value: session.config,
        onChange: (c) => setConfig(sessionId, c),
        playerCount: session.players.length,
      }}
      scoring={{ value: session.scoring, onChange: (s) => setScoring(sessionId, s) }}
      footer={
        <div className="card">
          <h3>Zone rouge</h3>
          <ConfirmButton
            className="danger block"
            label="Supprimer la session"
            message={`Supprimer « ${session.name} » et tout son classement ?`}
            onConfirm={() => {
              onClose()
              deleteSession(sessionId)
              onDeleted()
            }}
          />
        </div>
      }
    />
  )
}
