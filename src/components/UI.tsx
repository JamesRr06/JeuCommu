import { useContext, useState, type ReactNode } from 'react'
import { OpenSettings } from './settings-context'
import { MAX_PLAYERS, type Player } from '../types'

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
}) {
  const openSettings = useContext(OpenSettings)
  return (
    <div className="topbar">
      {onBack && (
        <button className="icon" onClick={onBack} aria-label="Retour">
          ←
        </button>
      )}
      <h1>
        {title}
        {subtitle && (
          <>
            <br />
            <span className="sub">{subtitle}</span>
          </>
        )}
      </h1>
      {right}
      {openSettings && <GearButton onClick={openSettings} />}
    </div>
  )
}

/** Engrenage d'accès aux réglages, présent dans la barre de titre de tous les écrans. */
export function GearButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon gear" onClick={onClick} aria-label="Réglages">
      ⚙
    </button>
  )
}

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
  return (
    <div className="counter">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Moins">
        −
      </button>
      <span className="value">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Plus">
        +
      </button>
    </div>
  )
}

export function ConfirmButton({
  label,
  message,
  onConfirm,
  className = 'danger small',
}: {
  label: string
  message: string
  onConfirm: () => void
  className?: string
}) {
  return (
    <button
      className={className}
      onClick={() => {
        if (confirm(message)) onConfirm()
      }}
    >
      {label}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}

/**
 * Infobulle de détail. S'ouvre au survol à la souris et reste épinglée au clic
 * (seul mode disponible au doigt, où le survol n'existe pas).
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const open = pinned || hovered

  return (
    <span className="infotip">
      <button
        className="info"
        aria-label={`Détail : ${label}`}
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
          <span className="dot">{i < current ? '✓' : i + 1}</span>
          <span className="label">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** Panneau glissant depuis le bas, utilisé pour les réglages. */
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
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>
            {title}
            {subtitle && <span className="sub">{subtitle}</span>}
          </h2>
          <button className="icon" onClick={onClose} aria-label="Fermer">
            ✕
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
  const [draft, setDraft] = useState('')
  const full = players.length >= MAX_PLAYERS

  function add() {
    if (onAdd(draft)) setDraft('')
  }

  return (
    <>
      <div className="row">
        <input
          className="grow"
          type="text"
          value={draft}
          placeholder="Prénom"
          maxLength={20}
          disabled={full}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="primary" disabled={full || !draft.trim()} onClick={add} aria-label="Ajouter">
          +
        </button>
      </div>
      {players.length === 0 ? (
        <Empty>Ajoute les joueurs de la soirée.</Empty>
      ) : (
        <div className="list">
          {players.map((p, i) => (
            <div key={p.id} className="item">
              <span className="rank-num">{i + 1}</span>
              <span className="grow">{p.name}</span>
              <button
                className="small ghost"
                aria-label={`Renommer ${p.name}`}
                onClick={() => {
                  const next = prompt('Nouveau prénom', p.name)
                  if (next) onRename(p.id, next)
                }}
              >
                ✎
              </button>
              {removeMessage ? (
                <ConfirmButton label="✕" message={removeMessage(p)} onConfirm={() => onRemove(p.id)} />
              ) : (
                <button className="danger small" aria-label={`Retirer ${p.name}`} onClick={() => onRemove(p.id)}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {full && <p className="muted center-text">Maximum atteint : {MAX_PLAYERS} joueurs.</p>}
    </>
  )
}
