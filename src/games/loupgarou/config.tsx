import { Counter, InfoTip } from '../../components/UI'
import { useT, type Dict } from '../../i18n'
import { DEFAULT_DEBATE_MINUTES, type GameConfig, type LoupGarouConfig } from '../../types'
import type { ConfigEditorProps } from '../registry'
import { OPTIONAL_ROLES, type RoleId } from './roles'

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

export function validate(playerCount: number, config: GameConfig, t: Dict): string | null {
  const c = config as LoupGarouConfig
  if (playerCount < 4) return t.games.loupgarou.errMinPlayers
  if (c.nbLoups < 1) return t.games.loupgarou.errMinWolves
  if (playerCount - c.nbLoups - c.specials.length < 0) return t.games.loupgarou.errTooManySpecials
  if (c.nbLoups >= playerCount - c.nbLoups) return t.games.loupgarou.errWolfMajority
  return null
}

export function describe(playerCount: number, config: GameConfig, t: Dict): string[] {
  const c = config as LoupGarouConfig
  return [
    t.games.loupgarou.wolves(c.nbLoups),
    t.games.loupgarou.villagers(Math.max(0, playerCount - c.nbLoups - c.specials.length)),
    ...c.specials.map((r) => t.roles[r as RoleId].label),
    c.debateMinutes > 0 ? t.games.loupgarou.debateMinutes(c.debateMinutes) : t.games.loupgarou.freeDebate,
  ]
}

export function ConfigEditor({ playerCount, config, onChange }: ConfigEditorProps) {
  const t = useT()
  const c = config as LoupGarouConfig
  const villageois = Math.max(0, playerCount - c.nbLoups - c.specials.length)

  function toggle(role: RoleId) {
    const specials = c.specials.includes(role) ? c.specials.filter((r) => r !== role) : [...c.specials, role]
    onChange({ ...c, specials })
  }

  return (
    <>
      <div className="card">
        <h3>{t.games.loupgarou.pack}</h3>
        <div className="row between">
          <span>{t.games.loupgarou.wolvesLabel}</span>
          <Counter
            value={c.nbLoups}
            min={1}
            max={Math.max(1, Math.floor((playerCount - 1) / 2))}
            onChange={(nbLoups) => onChange({ ...c, nbLoups })}
          />
        </div>
      </div>

      <div className="card">
        <h3>{t.games.loupgarou.debate}</h3>
        <div className="row between">
          <span>{t.games.loupgarou.timerLabel}</span>
          <Counter
            value={c.debateMinutes}
            min={0}
            max={20}
            onChange={(debateMinutes) => onChange({ ...c, debateMinutes })}
          />
        </div>
        <p className="muted">
          {c.debateMinutes > 0 ? t.games.loupgarou.timerOn(c.debateMinutes) : t.games.loupgarou.timerOff}
        </p>
      </div>

      <div className="card">
        <h3>{t.games.loupgarou.specialRoles}</h3>
        <div className="list">
          {OPTIONAL_ROLES.map((r) => {
            const included = c.specials.includes(r)
            return (
              <div key={r} className={`item${included ? ' selected' : ''}`}>
                <button className="grow link" onClick={() => toggle(r)}>
                  {t.roles[r].label}
                  <br />
                  <span className="muted">{t.roles[r].description}</span>
                </button>
                <span className={`badge${included ? ' accent' : ''}`}>
                  {included ? t.games.loupgarou.included : t.common.dash}
                </span>
                <InfoTip label={t.roles[r].label}>{t.roles[r].details}</InfoTip>
              </div>
            )
          })}
        </div>
        <div className="sep" />
        <p className="muted">
          {t.games.loupgarou.tally(villageois, c.nbLoups + c.specials.length + villageois, playerCount)}
        </p>
      </div>
    </>
  )
}
