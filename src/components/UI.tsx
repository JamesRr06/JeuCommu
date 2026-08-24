import type { ReactNode } from 'react'

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
    </div>
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

/** Liste de joueurs sélectionnables (un seul choix). */
export function PickList<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  render,
  disabledIds = [],
}: {
  items: T[]
  selectedId: string | null
  onSelect: (id: string) => void
  render: (item: T) => ReactNode
  disabledIds?: string[]
}) {
  return (
    <div className="list">
      {items.map((item) => {
        const disabled = disabledIds.includes(item.id)
        return (
          <button
            key={item.id}
            className={`item${selectedId === item.id ? ' selected' : ''}${disabled ? ' dead' : ''}`}
            disabled={disabled}
            onClick={() => onSelect(item.id)}
          >
            {render(item)}
          </button>
        )
      })}
    </div>
  )
}
