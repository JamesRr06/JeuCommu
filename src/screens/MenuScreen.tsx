import { ConfirmButton, TopBar } from '../components/UI'
import { formatDate, plural } from '../lib'
import { deleteSession, ranking, useSessions } from '../store'
import { GAMES, getGame } from '../games/registry'
import { MAX_PLAYERS, type GameId, type ID } from '../types'

/**
 * Écran d'accueil : on choisit un jeu, ou on reprend une session en cours.
 * Pas de réglages ici — tout se règle dans la session, là où ça s'applique.
 */
export default function MenuScreen({
  onPick,
  onOpen,
}: {
  onPick: (gameId: GameId) => void
  onOpen: (id: ID) => void
}) {
  const sessions = useSessions()

  return (
    <div className="app">
      <TopBar title="JeuCommu" subtitle="Jeux d’ambiance hors ligne" />

      <div className="content fade-step">
        <h2 className="section">Choisis un jeu</h2>
        {GAMES.map((g) => (
          <button key={g.id} className="game-card" onClick={() => onPick(g.id)}>
            <span className="game-emoji">{g.emoji}</span>
            <span className="grow">
              <span className="game-name">{g.name}</span>
              <span className="muted">{g.tagline}</span>
              <span className="row wrap chips">
                <span className="badge">
                  {g.minPlayers}–{MAX_PLAYERS} joueurs
                </span>
                {g.highlights.map((h) => (
                  <span key={h} className="badge">
                    {h}
                  </span>
                ))}
              </span>
            </span>
            <span className="chevron">›</span>
          </button>
        ))}
        <p className="muted center-text">D’autres jeux arriveront ici.</p>

        {sessions.length > 0 && (
          <>
            <h2 className="section">Reprendre une session</h2>
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
                        {game.name} · {formatDate(s.createdAt)} · {plural(s.players.length, 'joueur')} ·{' '}
                        {plural(s.rounds.length, 'partie')}
                        {leader && s.rounds.length > 0 && ` · 🥇 ${leader.player.name}`}
                      </span>
                    </button>
                    <ConfirmButton
                      label="✕"
                      message={`Supprimer la session « ${s.name} » et son classement ?`}
                      onConfirm={() => deleteSession(s.id)}
                    />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
