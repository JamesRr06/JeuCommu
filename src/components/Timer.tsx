import { useEffect, useRef, useState } from 'react'
import { haptic } from '../lib'
import { useT } from '../i18n'

/** Signal de fin de débat : vibration + trois bips, tout ce dont dispose une app hors ligne. */
function ringEnd() {
  haptic([220, 120, 220, 120, 450])
  try {
    const legacy = window as unknown as { webkitAudioContext?: typeof AudioContext }
    const Ctx = window.AudioContext ?? legacy.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    void ctx.resume()
    for (const at of [0, 0.35, 0.7]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + at
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    }
    setTimeout(() => void ctx.close(), 1600)
  } catch {
    /* audio indisponible : la vibration et l'écran suffisent */
  }
}

function format(ms: number): string {
  const total = Math.ceil(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * Minuteur de débat. Démarre seul, se met en pause et se relance.
 * Le monter avec une `key` qui change à chaque jour suffit à le réinitialiser.
 */
export default function DebateTimer({ minutes }: { minutes: number }) {
  const t = useT()
  const total = minutes * 60_000
  const [endAt, setEndAt] = useState(() => Date.now() + total)
  const [pausedMs, setPausedMs] = useState<number | null>(null)
  const [, tick] = useState(0)
  const rang = useRef(false)

  const running = pausedMs === null
  const remaining = pausedMs ?? Math.max(0, endAt - Date.now())
  const over = remaining === 0

  // Inutile de continuer à battre une fois en pause ou le temps écoulé.
  useEffect(() => {
    if (!running || over) return
    const id = setInterval(() => tick((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [running, over])

  useEffect(() => {
    if (over && !rang.current) {
      rang.current = true
      ringEnd()
    }
  }, [over])

  function restart() {
    rang.current = false
    setPausedMs(null)
    setEndAt(Date.now() + total)
  }

  return (
    <div className={`card timer-card${over ? ' over' : ''}`}>
      <h3>{over ? t.timer.over : t.timer.running}</h3>
      <div className="timer">{format(remaining)}</div>
      <div className="timer-bar">
        <i style={{ width: `${total ? (remaining / total) * 100 : 0}%` }} />
      </div>
      <div className="row">
        <button
          className="grow small"
          disabled={over}
          onClick={() => {
            if (running) setPausedMs(remaining)
            else {
              setEndAt(Date.now() + remaining)
              setPausedMs(null)
            }
          }}
        >
          {running ? t.timer.pause : t.timer.resume}
        </button>
        <button
          className="grow small"
          onClick={() => {
            rang.current = false
            const next = remaining + 60_000
            if (running) setEndAt(Date.now() + next)
            else setPausedMs(next)
          }}
        >
          {t.timer.addMinute}
        </button>
        <button className="grow small" onClick={restart}>
          {t.timer.restart}
        </button>
      </div>
    </div>
  )
}
