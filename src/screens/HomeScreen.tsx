import { useState } from 'react'
import { ConfirmButton, Empty, TopBar } from '../components/UI'
import { formatDate, plural } from '../lib'
import { createSession, deleteSession, ranking, useSessions } from '../store'
import type { ID } from '../types'

export default function HomeScreen({ onOpen }: { onOpen: (id: ID) => void }) {
  const sessions = useSessions()
  const [name, setName] = useState('')

  function create() {
    const s = createSession(name || `Soirée du ${new Date().toLocaleDateString('fr-FR')}`)
    setName('')
    onOpen(s.id)
  }

  return (
    <div className="app">
      <TopBar title="Soirée Jeux" subtitle="Jeux d’ambiance hors ligne" />
      <div className="content">
        <div className="card">
          <h3>Nouvelle session</h3>
          <input
            type="text"
            value={name}
            placeholder="Nom de la session (ex. Chalet du 12)"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
          <button className="primary block" onClick={create}>
            Créer la session
          </button>
        </div>

        <div className="card">
          <h3>Mes sessions</h3>
          {sessions.length === 0 ? (
            <Empty>Aucune session pour l’instant.</Empty>
          ) : (
            <div className="list">
              {sessions.map((s) => {
                const leader = ranking(s)[0]
                return (
                  <div key={s.id} className="item">
                    <button className="grow ghost" style={{ textAlign: 'left', border: 0, padding: 0 }} onClick={() => onOpen(s.id)}>
                      <strong>{s.name}</strong>
                      <br />
                      <span className="muted">
                        {formatDate(s.createdAt)} · {plural(s.players.length, 'joueur')} ·{' '}
                        {plural(s.rounds.length, 'partie')}
                        {leader && s.rounds.length > 0 && ` · 🥇 ${leader.player.name}`}
                      </span>
                    </button>
                    <ConfirmButton
                      label="Suppr."
                      message={`Supprimer la session « ${s.name} » et son classement ?`}
                      onConfirm={() => deleteSession(s.id)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
