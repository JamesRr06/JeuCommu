import type { GameConfig } from '../types'
import type { GameDef } from '../games/registry'

/** Empreinte d'une composition, tolérante à l'ordre des listes (les rôles spéciaux notamment). */
function signature(config: GameConfig): string {
  const entries = Object.entries(config as unknown as Record<string, unknown>)
    .map(([k, v]) => [k, Array.isArray(v) ? [...v].sort() : v] as const)
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(entries)
}

/**
 * Composition conseillée pour l'effectif courant. Purement indicative :
 * le narrateur l'applique d'un bouton ou l'ignore complètement.
 */
export default function ConfigSuggestion({
  game,
  playerCount,
  config,
  onApply,
}: {
  game: GameDef
  playerCount: number
  config: GameConfig
  onApply: (config: GameConfig) => void
}) {
  if (playerCount < game.minPlayers) return null
  const suggested = game.suggest(playerCount)
  const applied = signature(config) === signature(suggested)

  return (
    <div className="card suggestion">
      <h3>Conseillé à {playerCount} joueurs</h3>
      <div className="row wrap chips">
        {game.describe(playerCount, suggested).map((d, i) => (
          <span key={i} className="badge accent">
            {d}
          </span>
        ))}
      </div>
      {applied ? (
        <p className="muted">✓ C’est exactement ta composition actuelle.</p>
      ) : (
        <button className="small block" onClick={() => onApply(suggested)}>
          Appliquer cette composition
        </button>
      )}
      <p className="muted">
        Un repère pour équilibrer la partie, rien de plus : compose comme tu veux, l’app ne t’impose rien.
      </p>
    </div>
  )
}
