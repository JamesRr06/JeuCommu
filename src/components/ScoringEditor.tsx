import { useT } from '../i18n'
import type { GameDef } from '../games/registry'
import type { GameId, Scoring } from '../types'

/**
 * Barème de points, partagé par l'assistant de création (un seul jeu) et par les
 * réglages généraux du menu (tous les jeux).
 */
export default function ScoringEditor({
  games,
  label,
  scoring,
  onChange,
}: {
  games: GameDef[]
  label: string
  scoring: Scoring
  onChange: (scoring: Scoring) => void
}) {
  const t = useT()

  function setPoints(gameId: GameId, camp: string, value: number) {
    const next = structuredClone(scoring)
    next[gameId][camp] = Math.max(0, value)
    onChange(next)
  }

  return (
    <>
      {games.map((game) => (
        <div key={game.id} className="card">
          <h3>{t.scoring.heading(label, game.name(t))}</h3>
          <div className="list">
            {game.camps(t).map((camp) => (
              <div key={camp.key} className="item">
                <span className="grow">{camp.label}</span>
                <input
                  className="num"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  aria-label={camp.label}
                  value={scoring[game.id][camp.key] ?? 0}
                  onChange={(e) => setPoints(game.id, camp.key, Number(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="muted center-text">{t.scoring.note}</p>
    </>
  )
}
