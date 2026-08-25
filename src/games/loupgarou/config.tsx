import { Counter } from '../../components/UI'
import { plural } from '../../lib'
import type { GameConfig, LoupGarouConfig } from '../../types'
import type { ConfigEditorProps } from '../registry'
import { OPTIONAL_ROLES, ROLES, type RoleId } from './roles'

export function defaultConfig(playerCount: number): LoupGarouConfig {
  return {
    nbLoups: Math.max(1, Math.round(playerCount / 4)),
    specials: playerCount >= 6 ? ['voyante', 'sorciere', 'chasseur'] : ['voyante'],
  }
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
        <h3>Rôles spéciaux</h3>
        <div className="list">
          {OPTIONAL_ROLES.map((r) => (
            <button key={r} className={`item${c.specials.includes(r) ? ' selected' : ''}`} onClick={() => toggle(r)}>
              <span className="grow">
                {ROLES[r].label}
                <br />
                <span className="muted">{ROLES[r].description}</span>
              </span>
              <span className="badge">{c.specials.includes(r) ? 'Inclus' : '—'}</span>
            </button>
          ))}
        </div>
        <div className="sep" />
        <p className="muted">
          Simples villageois : {villageois} · Total {c.nbLoups + c.specials.length + villageois}/{playerCount}
        </p>
      </div>
    </>
  )
}
