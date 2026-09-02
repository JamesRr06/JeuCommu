import { useState } from 'react'
import { ConfirmButton, Empty, TopBar } from '../components/UI'
import SessionSettings from '../components/SessionSettings'
import { OpenSettings } from '../components/settings-context'
import { formatDate, plural } from '../lib'
import { deleteRound, ranking, useSession } from '../store'
import { CAMP_LABEL, type ID } from '../types'
import { getGame } from '../games/registry'

type Tab = 'partie' | 'classement' | 'historique'

/** Habillage des trois premières places du classement. */
const PODIUM: Record<number, string> = { 1: ' gold', 2: ' silver', 3: ' bronze' }
const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const TABS: { id: Tab; label: string }[] = [
  { id: 'partie', label: 'Partie' },
  { id: 'classement', label: 'Classement' },
  { id: 'historique', label: 'Historique' },
]

export default function SessionScreen({
  sessionId,
  onBack,
  onLaunch,
  onDeleted,
}: {
  sessionId: ID
  onBack: () => void
  onLaunch: () => void
  onDeleted: () => void
}) {
  const session = useSession(sessionId)
  const [tab, setTab] = useState<Tab>('partie')
  const [settings, setSettings] = useState(false)

  if (!session) {
    return (
      <div className="app">
        <TopBar title="Session introuvable" onBack={onBack} />
      </div>
    )
  }

  const game = getGame(session.gameId)
  const rows = ranking(session)
  const blocking = game.validate(session.players.length, session.config)
  const last = session.rounds[0]

  return (
    <OpenSettings.Provider value={() => setSettings(true)}>
      <div className="app">
        <TopBar
          title={session.name}
          subtitle={`${game.emoji} ${game.name} · ${plural(session.players.length, 'joueur')} · ${plural(
            session.rounds.length,
            'partie',
          )}`}
          onBack={onBack}
        />

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="content fade-step" key={tab}>
          {tab === 'partie' && (
            <>
              <div className="card hero">
                <span className="game-emoji big">{game.emoji}</span>
                <h2>{game.name}</h2>
                <p className="muted">{game.tagline}</p>
                <div className="row wrap chips center">
                  {game.describe(session.players.length, session.config).map((d, i) => (
                    <span key={i} className="badge accent">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Où en est la soirée</h3>
                <div className="row between">
                  <span className="muted">Parties jouées</span>
                  <strong>{session.rounds.length}</strong>
                </div>
                <div className="row between">
                  <span className="muted">En tête</span>
                  <strong>
                    {session.rounds.length > 0 && rows[0]
                      ? `${rows[0].player.name} · ${plural(rows[0].points, 'pt')}`
                      : '—'}
                  </strong>
                </div>
                {last && (
                  <>
                    <div className="sep" />
                    <p className="muted">
                      Dernière partie · {formatDate(last.playedAt)}
                      <br />
                      <span className="badge success">{CAMP_LABEL[last.winnerCamp]}</span> {last.summary}
                    </p>
                  </>
                )}
              </div>

              {blocking && <p className="error center-text">{blocking}</p>}
            </>
          )}

          {tab === 'classement' && (
            <div className="card">
              <h3>Classement de la session</h3>
              {rows.length === 0 ? (
                <Empty>Ajoute des joueurs et lance une partie.</Empty>
              ) : (
                <div className="list">
                  {rows.map((r) => (
                    <div key={r.player.id} className="item">
                      <span className={`num-badge${PODIUM[r.rank] ?? ''}`}>
                        {r.rank}
                      </span>
                      <span className="grow">
                        {MEDALS[r.rank] && <span className="medal">{MEDALS[r.rank]} </span>}
                        {r.player.name}
                        <br />
                        <span className="muted">
                          {plural(r.wins, 'victoire')} / {plural(r.played, 'partie')}
                        </span>
                      </span>
                      <span className="badge accent">{plural(r.points, 'pt')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'historique' && (
            <div className="card">
              <h3>Parties jouées</h3>
              {session.rounds.length === 0 ? (
                <Empty>Aucune partie enregistrée.</Empty>
              ) : (
                <div className="list">
                  {session.rounds.map((r) => (
                    <div key={r.id} className="item">
                      <span className="grow">
                        <strong>{getGame(r.gameId).name}</strong>{' '}
                        <span className="badge success">{CAMP_LABEL[r.winnerCamp]}</span>
                        <br />
                        <span className="muted">
                          {formatDate(r.playedAt)} · {r.summary}
                        </span>
                      </span>
                      <ConfirmButton
                        label="✕"
                        message="Supprimer cette partie ? Les points correspondants seront retirés du classement."
                        onConfirm={() => deleteRound(sessionId, r.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {tab === 'partie' && (
          <div className="footer-actions">
            <button className="primary big block" disabled={!!blocking} onClick={onLaunch}>
              {session.rounds.length === 0 ? 'Lancer la première partie' : 'Lancer une partie'}
            </button>
          </div>
        )}

        {settings && (
          <SessionSettings sessionId={sessionId} onClose={() => setSettings(false)} onDeleted={onDeleted} />
        )}
      </div>
    </OpenSettings.Provider>
  )
}
