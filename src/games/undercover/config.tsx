import { Counter, InfoTip } from '../../components/UI'
import { plural } from '../../lib'
import type { GameConfig, UndercoverConfig } from '../../types'
import type { ConfigEditorProps } from '../registry'

/** Nombre maximum d'infiltrés : le camp des civils doit rester majoritaire. */
export function maxInfiltres(playerCount: number): number {
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

export function defaultConfig(playerCount: number): UndercoverConfig {
  return suggest(playerCount)
}

export function validate(playerCount: number, config: GameConfig): string | null {
  const c = config as UndercoverConfig
  const max = maxInfiltres(playerCount)
  if (playerCount < 3) return 'Il faut au moins 3 joueurs.'
  if (c.nbUndercover < 1) return 'Il faut au moins 1 undercover.'
  if (c.nbUndercover + c.nbMrWhite > max) {
    return `Trop d'infiltrés : ${max} maximum pour ${playerCount} joueurs.`
  }
  return null
}

export function describe(playerCount: number, config: GameConfig): string[] {
  const c = config as UndercoverConfig
  return [
    plural(Math.max(0, playerCount - c.nbUndercover - c.nbMrWhite), 'civil'),
    plural(c.nbUndercover, 'undercover'),
    plural(c.nbMrWhite, 'Mr White', 'Mr White'),
  ]
}

export function ConfigEditor({ playerCount, config, onChange }: ConfigEditorProps) {
  const c = config as UndercoverConfig
  const max = maxInfiltres(playerCount)
  const civils = playerCount - c.nbUndercover - c.nbMrWhite

  return (
    <div className="card">
      <h3>Composition</h3>
      <div className="row between">
        <span className="grow">
          Undercover
          <InfoTip label="Undercover">
            Il reçoit un mot voisin de celui des civils, sans savoir qu’il est l’infiltré au premier coup d’œil.
            Il doit décrire son mot assez juste pour passer inaperçu. Les infiltrés gagnent dès qu’ils sont
            aussi nombreux que les civils.
          </InfoTip>
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
          Mr White
          <InfoTip label="Mr White">
            Aucun mot : il bluffe uniquement à partir de ce qu’il entend. S’il est éliminé, l’app lui offre une
            dernière chance de deviner le mot des civils — réussi, il vole la victoire à lui tout seul.
          </InfoTip>
        </span>
        <Counter
          value={c.nbMrWhite}
          min={0}
          max={Math.max(0, max - c.nbUndercover)}
          onChange={(nbMrWhite) => onChange({ ...c, nbMrWhite })}
        />
      </div>
      <div className="sep" />
      <p className="muted">
        {plural(Math.max(0, civils), 'civil')} · Mr White ne reçoit aucun mot et doit bluffer.
      </p>
    </div>
  )
}
