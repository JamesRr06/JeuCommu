import { Counter, InfoTip } from '../../components/UI'
import { useT, type Dict } from '../../i18n'
import type { GameConfig, UndercoverConfig } from '../../types'
import type { ConfigEditorProps } from '../registry'

/** Nombre maximum d'infiltrés : le camp des civils doit rester majoritaire. */
function maxInfiltres(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2))
}

/**
 * Un infiltré pour environ quatre joueurs, et un Mr White dès que la table est
 * assez fournie pour absorber son bluff. Proposé, jamais imposé.
 */
export function suggest(playerCount: number): UndercoverConfig {
  const max = maxInfiltres(playerCount)
  const nbMrWhite = playerCount >= 6 ? (playerCount >= 14 ? 2 : 1) : 0
  const nbUndercover = Math.min(Math.max(1, Math.round(playerCount / 4)), Math.max(1, max - nbMrWhite))
  return { nbUndercover, nbMrWhite: Math.min(nbMrWhite, Math.max(0, max - nbUndercover)) }
}

export function validate(playerCount: number, config: GameConfig, t: Dict): string | null {
  const c = config as UndercoverConfig
  const max = maxInfiltres(playerCount)
  if (playerCount < 3) return t.games.undercover.errMinPlayers
  if (c.nbUndercover < 1) return t.games.undercover.errMinUndercover
  if (c.nbUndercover + c.nbMrWhite > max) return t.games.undercover.errTooMany(max, playerCount)
  return null
}

export function describe(playerCount: number, config: GameConfig, t: Dict): string[] {
  const c = config as UndercoverConfig
  return [
    t.games.undercover.civilians(Math.max(0, playerCount - c.nbUndercover - c.nbMrWhite)),
    t.games.undercover.undercovers(c.nbUndercover),
    t.games.undercover.mrWhites(c.nbMrWhite),
  ]
}

export function ConfigEditor({ playerCount, config, onChange }: ConfigEditorProps) {
  const t = useT()
  const c = config as UndercoverConfig
  const max = maxInfiltres(playerCount)
  const civils = playerCount - c.nbUndercover - c.nbMrWhite

  return (
    <div className="card">
      <h3>{t.games.undercover.composition}</h3>
      <div className="row between">
        <span className="grow">
          {t.camps.undercover}
          <InfoTip label={t.camps.undercover}>{t.games.undercover.undercoverTip}</InfoTip>
        </span>
        <Counter
          value={c.nbUndercover}
          min={1}
          max={Math.max(1, max - c.nbMrWhite)}
          onChange={(nbUndercover) => onChange({ ...c, nbUndercover })}
        />
      </div>
      <div className="row between">
        <span className="grow">
          {t.camps.mrwhite}
          <InfoTip label={t.camps.mrwhite}>{t.games.undercover.mrWhiteTip}</InfoTip>
        </span>
        <Counter
          value={c.nbMrWhite}
          min={0}
          max={Math.max(0, max - c.nbUndercover)}
          onChange={(nbMrWhite) => onChange({ ...c, nbMrWhite })}
        />
      </div>
      <div className="sep" />
      <p className="muted">{t.games.undercover.compositionNote(t.games.undercover.civilians(Math.max(0, civils)))}</p>
    </div>
  )
}
