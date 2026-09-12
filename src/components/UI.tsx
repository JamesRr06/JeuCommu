import { useContext, useState, type ReactNode } from 'react'
import { OpenSettings } from './settings-context'
import { askConfirm, askPrompt } from './Dialog'
import { useT } from '../i18n'
import { MAX_PLAYERS, type Player } from '../types'

/** Pictogrammes au trait, dans l'esprit des symboles système d'iOS. */
const PATHS = {
  chevronLeft: 'M15 4.5 7.5 12 15 19.5',
  chevronRight: 'M9 4.5 16.5 12 9 19.5',
  close: 'M6 6l12 12M18 6L6 18',
  gear: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.4-1.9-3.3-2.2.9a7.7 7.7 0 0 0-2.6-1.5L14.2 2H9.8l-.4 2.2c-1 .3-1.8.8-2.6 1.5l-2.2-.9-1.9 3.3 1.9 1.4a7.6 7.6 0 0 0 0 3l-1.9 1.4 1.9 3.3 2.2-.9c.8.7 1.6 1.2 2.6 1.5l.4 2.2h4.4l.4-2.2c1-.3 1.8-.8 2.6-1.5l2.2.9 1.9-3.3-1.9-1.4z',
  pencil: 'M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 13l4.5 4.5L19 7',
} as const

export function Icon({ name, size = 20 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg
      className="icon-svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'gear' ? 1.6 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

/**
 * Barre de navigation. Titre centré comme sur iOS, retour à gauche,
 * engrenage à droite dès qu'un écran expose ses réglages.
 */
export function TopBar({
  title,
  subtitle,
  onBack,
  right,
  large,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
  /** Grand titre sous la barre, réservé à l'écran d'accueil. */
  large?: boolean
}) {
  const t = useT()
  const openSettings = useContext(OpenSettings)

  return (
    <header className={`navbar${large ? ' with-large' : ''}`}>
      <div className="nav-row">
        <div className="nav-side">
          {onBack && (
            <button className="nav-back" onClick={onBack} aria-label={t.common.back}>
              <Icon name="chevronLeft" size={22} />
              <span>{t.common.back}</span>
            </button>
          )}
        </div>
        <div className="nav-title">
          {!large && <h1>{title}</h1>}
          {subtitle && <span className="sub">{subtitle}</span>}
        </div>
        <div className="nav-side end">
          {right}
          {openSettings && (
            <button className="nav-icon" onClick={openSettings} aria-label={t.common.settings}>
              <Icon name="gear" size={22} />
            </button>
          )}
        </div>
      </div>
      {large && <h1 className="large-title">{title}</h1>}
    </header>
  )
}

/** Bouton de fermeture d'une partie en cours, posé à droite de la barre. */
export function QuitButton({ onQuit }: { onQuit: () => void }) {
  const t = useT()
  return (
    <button
      className="nav-icon"
      aria-label={t.common.close}
      onClick={async () => {
        if (await askConfirm({ title: t.app.abandonRound, confirmLabel: t.app.abandon, destructive: true })) {
          onQuit()
        }
      }}
    >
      <Icon name="close" size={20} />
    </button>
  )
}

/** Pas-à-pas − / +, d'un seul tenant comme le stepper iOS. */
export function Counter({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const t = useT()
  return (
    <div className="counter">
      <span className="value">{value}</span>
      <div className="stepper-pad">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={t.common.minus}>
          <Icon name="minus" size={18} />
        </button>
        <span className="stepper-sep" />
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={t.common.plus}>
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  )
}

export function ConfirmButton({
  label,
  message,
  onConfirm,
  className = 'row-action danger',
  icon,
}: {
  label: string
  message: string
  onConfirm: () => void
  className?: string
  icon?: keyof typeof PATHS
}) {
  const t = useT()
  return (
    <button
      className={className}
      aria-label={icon ? label : undefined}
      onClick={async () => {
        if (await askConfirm({ title: message, confirmLabel: t.common.delete, destructive: true })) onConfirm()
      }}
    >
      {icon ? <Icon name={icon} size={18} /> : label}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}

/** Segment de choix, façon UISegmentedControl. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Infobulle de détail. S'ouvre au survol à la souris et reste épinglée au clic
 * (seul mode disponible au doigt, où le survol n'existe pas).
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const t = useT()
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const open = pinned || hovered

  return (
    <span className="infotip">
      <button
        className="info"
        aria-label={t.common.detailOf(label)}
        aria-expanded={open}
        onClick={() => setPinned((p) => !p)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      >
        i
      </button>
      {open && (
        <span className="tip" role="tooltip">
          <strong>{label}</strong>
          {children}
        </span>
      )}
    </span>
  )
}

/** Fil d'étapes de l'assistant de création (Jeu → Joueurs → Réglages). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => (
        <div key={label} className={`step${i === current ? ' current' : i < current ? ' done' : ''}`}>
          <span className="dot">{i < current ? <Icon name="check" size={13} /> : i + 1}</span>
          <span className="label">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** Panneau glissant depuis le bas, avec la poignée des feuilles iOS. */
export function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  const t = useT()
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <span className="grabber" />
        <div className="sheet-head">
          <h2>
            {title}
            {subtitle && <span className="sub">{subtitle}</span>}
          </h2>
          <button className="nav-icon" onClick={onClose} aria-label={t.common.close}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

/**
 * Liste de joueurs éditable, partagée par l'assistant de création et les réglages.
 * `onRemove` reçoit l'identifiant ; l'appelant décide de confirmer ou non.
 */
export function PlayerEditor({
  players,
  onAdd,
  onRename,
  onRemove,
  removeMessage,
}: {
  players: Player[]
  onAdd: (name: string) => boolean
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
  removeMessage?: (p: Player) => string
}) {
  const t = useT()
  const [draft, setDraft] = useState('')
  const full = players.length >= MAX_PLAYERS

  function add() {
    if (onAdd(draft)) setDraft('')
  }

  async function rename(p: Player) {
    const next = await askPrompt({ title: t.setup.newName, value: p.name, maxLength: 20 })
    if (next) onRename(p.id, next)
  }

  return (
    <>
      <div className="row">
        <input
          className="grow"
          type="text"
          value={draft}
          placeholder={t.setup.firstName}
          maxLength={20}
          disabled={full}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="primary round" disabled={full || !draft.trim()} onClick={add} aria-label={t.common.add}>
          <Icon name="plus" size={20} />
        </button>
      </div>
      {players.length === 0 ? (
        <Empty>{t.setup.addPlayers}</Empty>
      ) : (
        <div className="list">
          {players.map((p, i) => (
            <div key={p.id} className="item">
              <span className="num-badge">{i + 1}</span>
              <span className="grow">{p.name}</span>
              <button className="row-action" aria-label={t.common.renamePlayer(p.name)} onClick={() => rename(p)}>
                <Icon name="pencil" size={18} />
              </button>
              {removeMessage ? (
                <ConfirmButton
                  icon="trash"
                  label={t.common.removePlayer(p.name)}
                  message={removeMessage(p)}
                  onConfirm={() => onRemove(p.id)}
                />
              ) : (
                <button
                  className="row-action danger"
                  aria-label={t.common.removePlayer(p.name)}
                  onClick={() => onRemove(p.id)}
                >
                  <Icon name="trash" size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {full && <p className="muted center-text">{t.setup.maxReached(MAX_PLAYERS)}</p>}
    </>
  )
}
