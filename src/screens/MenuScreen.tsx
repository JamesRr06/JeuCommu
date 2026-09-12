import { useState } from 'react'
import { ConfirmButton, Icon, TopBar } from '../components/UI'
import AppPreferences from '../components/AppPreferences'
import { OpenSettings } from '../components/settings-context'
import { useT } from '../i18n'
import { formatDate } from '../lib'
import { deleteSession, ranking, useSessions } from '../store'
import { GAMES, getGame } from '../games/registry'
import { MAX_PLAYERS, type GameId, type ID } from '../types'

/**
 * Écran d'accueil : on choisit un jeu, ou on reprend une session en cours.
 * L'engrenage n'ouvre que les préférences de l'application (langue, apparence) —
 * les réglages d'une partie se font dans la session, là où ils s'appliquent.
 */
export default function MenuScreen({
  onPick,
  onOpen,
}: {
  onPick: (gameId: GameId) => void
  onOpen: (id: ID) => void
}) {
  const t = useT()
  const sessions = useSessions()
  const [prefs, setPrefs] = useState(false)

  return (
    <OpenSettings.Provider value={() => setPrefs(true)}>
      <div className="app">
        <TopBar title={t.app.name} subtitle={t.app.tagline} large />

        <div className="content fade-step">
          <h2 className="section">{t.menu.pickGame}</h2>
          <div className="list">
            {GAMES.map((g) => (
              <button key={g.id} className="item game-card" onClick={() => onPick(g.id)}>
                <span className="game-tile">{g.emoji}</span>
                <span className="grow">
                  <span className="row between">
                    <span className="game-name">{g.name(t)}</span>
                    <span className="badge">{t.menu.playersRange(g.minPlayers, MAX_PLAYERS)}</span>
                  </span>
                  <span className="muted">{g.tagline(t)}</span>
                  <span className="highlights">{g.highlights(t).join(' · ')}</span>
                </span>
                <span className="chevron">
                  <Icon name="chevronRight" size={18} />
                </span>
              </button>
            ))}
          </div>
          <p className="muted center-text">{t.menu.morePlanned}</p>

          {sessions.length > 0 && (
            <>
              <h2 className="section">{t.menu.resume}</h2>
              <div className="list">
                {sessions.map((s) => {
                  const game = getGame(s.gameId)
                  const leader = ranking(s)[0]
                  return (
                    <div key={s.id} className="item">
                      <span className="game-emoji small">{game.emoji}</span>
                      <button className="grow link" onClick={() => onOpen(s.id)}>
                        <strong>{s.name}</strong>
                        <br />
                        <span className="muted">
                          {game.name(t)} · {formatDate(s.createdAt, t.intl)} · {t.common.players(s.players.length)} ·{' '}
                          {t.common.rounds(s.rounds.length)}
                          {leader && s.rounds.length > 0 && ` · 🥇 ${leader.player.name}`}
                        </span>
                      </button>
                      <ConfirmButton
                        icon="trash"
                        label={t.common.delete}
                        message={t.menu.deleteSession(s.name)}
                        onConfirm={() => deleteSession(s.id)}
                      />
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {prefs && <AppPreferences onClose={() => setPrefs(false)} />}
      </div>
    </OpenSettings.Provider>
  )
}
