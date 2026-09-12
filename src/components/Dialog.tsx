import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useT } from '../i18n'

/**
 * Alertes façon iOS, en remplacement de confirm()/prompt() : le style natif du
 * navigateur détonnait, et son texte n'est pas traduisible.
 *
 * Le store vit au niveau du module pour rester appelable hors composant
 * (écouteur du bouton retour Android, notamment).
 */

interface ConfirmRequest {
  kind: 'confirm'
  title: string
  message?: string
  confirmLabel?: string
  destructive?: boolean
  resolve: (ok: boolean) => void
}

interface PromptRequest {
  kind: 'prompt'
  title: string
  value: string
  placeholder?: string
  maxLength?: number
  resolve: (value: string | null) => void
}

type Request = ConfirmRequest | PromptRequest

let current: Request | null = null
const listeners = new Set<() => void>()

function emit(next: Request | null) {
  current = next
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/** Referme l'alerte en cours comme si elle avait été annulée. */
function cancelPending() {
  if (!current) return
  if (current.kind === 'confirm') current.resolve(false)
  else current.resolve(null)
  current = null
}

/** Demande une confirmation. Une seule alerte à la fois : la précédente est annulée. */
export function askConfirm(opts: Omit<ConfirmRequest, 'kind' | 'resolve'>): Promise<boolean> {
  cancelPending()
  return new Promise((resolve) => emit({ kind: 'confirm', ...opts, resolve }))
}

/** Demande une saisie courte. Résout sur null si l'utilisateur annule. */
export function askPrompt(opts: Omit<PromptRequest, 'kind' | 'resolve'>): Promise<string | null> {
  cancelPending()
  return new Promise((resolve) => emit({ kind: 'prompt', ...opts, resolve }))
}

/** Hôte des alertes, monté une seule fois à la racine de l'application. */
export default function Dialogs() {
  const request = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  )
  const t = useT()
  const [draft, setDraft] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (request?.kind === 'prompt') {
      setDraft(request.value)
      // Le focus doit attendre que l'alerte soit peinte, sinon le clavier ne s'ouvre pas.
      const id = setTimeout(() => input.current?.select(), 60)
      return () => clearTimeout(id)
    }
  }, [request])

  if (!request) return null

  function close(result: boolean | string | null) {
    const pending = request
    emit(null)
    if (!pending) return
    if (pending.kind === 'confirm') pending.resolve(result === true)
    else pending.resolve(typeof result === 'string' ? result : null)
  }

  const isPrompt = request.kind === 'prompt'

  return (
    <div className="alert-backdrop" onClick={() => close(null)}>
      <div className="alert" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="alert-body">
          <h2>{request.title}</h2>
          {request.kind === 'confirm' && request.message && <p>{request.message}</p>}
          {isPrompt && (
            <input
              ref={input}
              type="text"
              value={draft}
              maxLength={request.maxLength}
              placeholder={request.placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && draft.trim() && close(draft)}
            />
          )}
        </div>
        <div className="alert-actions">
          <button className="alert-action" onClick={() => close(null)}>
            {t.common.cancel}
          </button>
          {isPrompt ? (
            <button className="alert-action strong" disabled={!draft.trim()} onClick={() => close(draft)}>
              {t.common.validate}
            </button>
          ) : (
            <button
              className={`alert-action strong${request.destructive ? ' destructive' : ''}`}
              onClick={() => close(true)}
            >
              {request.confirmLabel ?? t.common.confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
