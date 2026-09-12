import { useState } from 'react'
import { ConfirmButton, Empty, Segmented, TopBar } from '../components/UI'
import SessionSettings from '../components/SessionSettings'
import { OpenSettings } from '../components/settings-context'
import { useT } from '../i18n'
import { formatDate } from '../lib'
import { deleteRound, ranking, useSession } from '../store'
import type { ID } from '../types'
import { getGame } from '../games/registry'

type Tab = 'partie' | 'classement' | 'historique'

/** Habillage des trois premières places du classement. */
const PODIUM: Record<number, string> = { 1: ' gold', 2: ' silver', 3: ' bronze' }
const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

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
  const t = useT()
  const session = useSession(sessionId)
  const [tab, setTab] = useState<Tab>('partie')
  const [settings, setSettings] = useState(false)

  if (!session) {
    return (
      <div className="app">
        <TopBar title={t.session.notFound} onBack={onBack} />
      </div>
    )
  }

  const game = getGame(session.gameId)
  const rows = ranking(session)
  const blocking = game.validate(session.players.length, session.config, t)
  const last = session.rounds[0]

  const tabs: { value: Tab; label: string }[] = [
    { value: 'partie', label: t.session.tabs.round },
    { value: 'classement', label: t.session.tabs.ranking },
    { value: 'historique', label: t.session.tabs.history },
  ]

  return (
    <OpenSettings.Provider value={() => setSettings(true)}>
      <div className="app">
        <TopBar
          title={session.name}
          subtitle={`${game.emoji} ${game.name(t)} · ${t.common.players(session.players.length)} · ${t.common.rounds(
            session.rounds.length,
          )}`}
          onBack={onBack}
        />

        <div className="tabs">
          <Segmented options={tabs} value={tab} onChange={setTab} />
        </div>

        <div className="content fade-step" key={tab}>
          {tab === 'partie' && (
            <>
              <div className="card hero">
                <span className="game-emoji big">{game.emoji}</span>
                <h2>{game.name(t)}</h2>
                <p className="muted">{game.tagline(t)}</p>
                <div className="row wrap chips center">
                  {game.describe(session.players.length, session.config, t).map((d, i) => (
                    <span key={i} className="badge accent">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>{t.session.where}</h3>
                <div className="row between">
                  <span className="muted">{t.session.roundsPlayed}</span>
                  <strong>{session.rounds.length}</strong>
                </div>
                <div className="row between">
                  <span className="muted">{t.session.leading}</span>
                  <strong>
                    {session.rounds.length > 0 && rows[0]
                      ? `${rows[0].player.name} · ${t.common.points(rows[0].points)}`
                      : t.common.dash}
                  </strong>
                </div>
                {last && (
                  <>
                    <div className="sep" />
                    <p className="muted">
                      {t.session.lastRound(formatDate(last.playedAt, t.intl))}
                      <br />
                      <span className="badge success">{t.camps[last.winnerCamp]}</span> {last.summary}
                    </p>
                  </>
                )}
              </div>

              {blocking && <p className="error center-text">{blocking}</p>}
            </>
          )}

          {tab === 'classement' && (
            <div className="card">
              <h3>{t.session.ranking}</h3>
              {rows.length === 0 ? (
                <Empty>{t.session.rankingEmpty}</Empty>
              ) : (
                <div className="list">
                  {rows.map((r) => (
                    <div key={r.player.id} className="item">
                      <span className={`num-badge${PODIUM[r.rank] ?? ''}`}>{r.rank}</span>
                      <span className="grow">
                        {MEDALS[r.rank] && <span className="medal">{MEDALS[r.rank]} </span>}
                        {r.player.name}
                        <br />
                        <span className="muted">{t.session.record(r.wins, r.played)}</span>
                      </span>
                      <span className="badge accent">{t.common.points(r.points)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'historique' && (
            <div className="card">
              <h3>{t.session.history}</h3>
              {session.rounds.length === 0 ? (
                <Empty>{t.session.historyEmpty}</Empty>
              ) : (
                <div className="list">
                  {session.rounds.map((r) => (
                    <div key={r.id} className="item">
                      <span className="grow">
                        <strong>{getGame(r.gameId).name(t)}</strong>{' '}
                        <span className="badge success">{t.camps[r.winnerCamp]}</span>
                        <br />
                        <span className="muted">
                          {formatDate(r.playedAt, t.intl)} · {r.summary}
                        </span>
                      </span>
                      <ConfirmButton
                        icon="trash"
                        label={t.common.delete}
                        message={t.session.deleteRound}
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
              {session.rounds.length === 0 ? t.session.launchFirst : t.session.launch}
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
