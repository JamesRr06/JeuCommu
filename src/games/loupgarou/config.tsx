import { Counter, InfoTip } from '../../components/UI'
import { plural } from '../../lib'
import type { GameConfig, LoupGarouConfig } from '../../types'
import type { ConfigEditorProps } from '../registry'
import { OPTIONAL_ROLES, ROLES, type RoleId } from './roles'

export const DEFAULT_DEBATE_MINUTES = 5

/**
 * Compositions conseillées par effectif, dans l'esprit des parties équilibrées :
 * la meute grossit d'un loup tous les quatre joueurs, et les pouvoirs arrivent
 * progressivement. Ce n'est qu'un point de départ proposé au narrateur.
 */
const SUGGESTIONS: { upTo: number; nbLoups: number; specials: string[] }[] = [
  { upTo: 5, nbLoups: 1, specials: ['voyante'] },
  { upTo: 7, nbLoups: 2, specials: ['voyante', 'sorciere'] },
  { upTo: 9, nbLoups: 2, specials: ['voyante', 'sorciere', 'chasseur'] },
  { upTo: 11, nbLoups: 3, specials: ['voyante', 'sorciere', 'chasseur', 'cupidon'] },
  { upTo: 13, nbLoups: 3, specials: ['voyante', 'sorciere', 'chasseur', 'cupidon', 'salvateur'] },
  { upTo: 99, nbLoups: 4, specials: ['voyante', 'sorciere', 'chasseur', 'cupidon', 'salvateur', 'corbeau'] },
]

export function suggest(playerCount: number): LoupGarouConfig {
  const row = SUGGESTIONS.find((r) => playerCount <= r.upTo) ?? SUGGESTIONS[SUGGESTIONS.length - 1]
  // On ne propose jamais plus de rôles qu'il n'y a de joueurs.
  const specials = row.specials.slice(0, Math.max(0, playerCount - row.nbLoups - 1))
  return { nbLoups: Math.max(1, row.nbLoups), specials, debateMinutes: DEFAULT_DEBATE_MINUTES }
}

export function defaultConfig(playerCount: number): LoupGarouConfig {
  return suggest(playerCount)
}

export function validate(playerCount: number, config: GameConfig): string | null {
  const c = config as LoupGarouConfig
  if (playerCount < 4) return 'Il faut au moins 4 joueurs.'
  if (c.nbLoups < 1) return 'Il faut au moins 1 loup-garou.'
  if (playerCount - c.nbLoups - c.specials.length < 0) return 'Trop de rôles spéciaux pour le nombre de joueurs.'
  if (c.nbLoups >= playerCount - c.nbLoups) return 'Trop de loups : le village doit être majoritaire.'
  return null
}

export function describe(playerCount: number, config: GameConfig): string[] {
  const c = config as LoupGarouConfig
  return [
    plural(c.nbLoups, 'loup'),
    plural(Math.max(0, playerCount - c.nbLoups - c.specials.length), 'villageois', 'villageois'),
    ...c.specials.map((r) => ROLES[r as RoleId].label),
    c.debateMinutes > 0 ? `débat ${c.debateMinutes} min` : 'débat libre',
  ]
}

export function ConfigEditor({ playerCount, config, onChange }: ConfigEditorProps) {
  const c = config as LoupGarouConfig
  const villageois = Math.max(0, playerCount - c.nbLoups - c.specials.length)

  function toggle(role: RoleId) {
    const specials = c.specials.includes(role) ? c.specials.filter((r) => r !== role) : [...c.specials, role]
    onChange({ ...c, specials })
  }

  return (
    <>
      <div className="card">
        <h3>La meute</h3>
        <div className="row between">
          <span>Loups-Garous</span>
          <Counter
            value={c.nbLoups}
            min={1}
            max={Math.max(1, Math.floor((playerCount - 1) / 2))}
            onChange={(nbLoups) => onChange({ ...c, nbLoups })}
          />
        </div>
      </div>

      <div className="card">
        <h3>Débat du jour</h3>
        <div className="row between">
          <span>Minuteur</span>
          <Counter
            value={c.debateMinutes}
            min={0}
            max={20}
            onChange={(debateMinutes) => onChange({ ...c, debateMinutes })}
          />
        </div>
        <p className="muted">
          {c.debateMinutes > 0
            ? `${c.debateMinutes} min de débat avant le vote — le minuteur démarre tout seul au lever du jour.`
            : 'Aucun minuteur : le village débat aussi longtemps qu’il veut.'}
        </p>
      </div>

      <div className="card">
        <h3>Rôles spéciaux</h3>
<div className="list">
          {OPTIONAL_ROLES.map((r) => {
            const included = c.specials.includes(r)
            return (
              <div key={r} className={`item${included ? ' selected' : ''}`}>
                <button className="grow link" onClick={() => toggle(r)}>
                  {ROLES[r].label}
                  <br />
                  <span className="muted">{ROLES[r].description}</span>
                </button>
                <span className="badge">{included ? 'Inclus' : '—'}</span>
                <InfoTip label={ROLES[r].label}>{ROLES[r].details}</InfoTip>
              </div>
            )
          })}
        </div>
        <div className="sep" />
        <p className="muted">
          Simples villageois : {villageois} · Total {c.nbLoups + c.specials.length + villageois}/{playerCount}
        </p>
      </div>
    </>
  )
}
