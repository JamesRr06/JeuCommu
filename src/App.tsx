import { useEffect, useRef, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import MenuScreen from './screens/MenuScreen'
import SetupScreen, { type SetupStep } from './screens/SetupScreen'
import SessionScreen from './screens/SessionScreen'
import SessionSettings from './components/SessionSettings'
import { OpenSettings } from './components/settings-context'
import { addRound, useSession } from './store'
import { getGame } from './games/registry'
import type { GameId, ID, Round } from './types'

type View =
  | { name: 'menu' }
  | { name: 'setup'; gameId: GameId; step: SetupStep }
  | { name: 'session'; id: ID }
  | { name: 'game'; sessionId: ID }

/** Sens de la navigation : l'écran entre par la droite, ou revient par la gauche. */
function setDirection(dir: 'fwd' | 'back') {
  document.documentElement.dataset.nav = dir
}

export default function App() {
  const [view, setView] = useState<View>({ name: 'menu' })

  function go(next: View, dir: 'fwd' | 'back' = 'fwd') {
    setDirection(dir)
    setView(next)
  }

  useAndroidBackButton(view, go)

  if (view.name === 'menu') {
    return (
      <MenuScreen
        key="menu"
        onPick={(gameId) => go({ name: 'setup', gameId, step: 'players' })}
        onOpen={(id) => go({ name: 'session', id })}
      />
    )
  }

  if (view.name === 'setup') {
    return (
      <SetupScreen
        key={`setup-${view.gameId}`}
        gameId={view.gameId}
        step={view.step}
        onStep={(step) => go({ ...view, step }, step === 'players' ? 'back' : 'fwd')}
        onBack={() => go({ name: 'menu' }, 'back')}
        onCreated={(id) => go({ name: 'session', id })}
      />
    )
  }

  if (view.name === 'session') {
    return (
      <SessionScreen
        key={`session-${view.id}`}
        sessionId={view.id}
        onBack={() => go({ name: 'menu' }, 'back')}
        onLaunch={() => go({ name: 'game', sessionId: view.id })}
        onDeleted={() => go({ name: 'menu' }, 'back')}
      />
    )
  }

  return (
    <GameHost
      key={`game-${view.sessionId}`}
      sessionId={view.sessionId}
      onExit={() => go({ name: 'session', id: view.sessionId }, 'back')}
      onDeleted={() => go({ name: 'menu' }, 'back')}
    />
  )
}

/** Bouton retour Android : remonte d'un écran, et confirme avant d'abandonner une partie. */
function useAndroidBackButton(view: View, go: (v: View, dir?: 'fwd' | 'back') => void) {
  const current = useRef(view)
  current.current = view
  const navigate = useRef(go)
  navigate.current = go

  useEffect(() => {
    const handle = CapApp.addListener('backButton', () => {
      const v = current.current
      const back = (next: View) => navigate.current(next, 'back')
      if (v.name === 'menu') {
        CapApp.exitApp()
      } else if (v.name === 'setup') {
        if (v.step === 'config') back({ ...v, step: 'players' })
        else back({ name: 'menu' })
      } else if (v.name === 'session') {
        back({ name: 'menu' })
      } else if (confirm('Quitter la partie en cours ?')) {
        back({ name: 'session', id: v.sessionId })
      }
    })
    return () => {
      handle.then((h) => h.remove())
    }
  }, [])
}

/** Héberge le jeu de la session et garde les réglages accessibles pendant la partie. */
function GameHost({
  sessionId,
  onExit,
  onDeleted,
}: {
  sessionId: ID
  onExit: () => void
  onDeleted: () => void
}) {
  const session = useSession(sessionId)
  const [settings, setSettings] = useState(false)
  if (!session) return null

  const Game = getGame(session.gameId).component

  function finish(round: Round) {
    addRound(sessionId, round)
    onExit()
  }

  return (
    <OpenSettings.Provider value={() => setSettings(true)}>
      <Game session={session} onFinish={finish} onQuit={onExit} />
      {settings && (
        <SessionSettings sessionId={sessionId} onClose={() => setSettings(false)} onDeleted={onDeleted} />
      )}
    </OpenSettings.Provider>
  )
}
