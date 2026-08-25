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

export default function App() {
  const [view, setView] = useState<View>({ name: 'menu' })
  useAndroidBackButton(view, setView)

  if (view.name === 'menu') {
    return (
      <MenuScreen
        onPick={(gameId) => setView({ name: 'setup', gameId, step: 'players' })}
        onOpen={(id) => setView({ name: 'session', id })}
      />
    )
  }

  if (view.name === 'setup') {
    return (
      <SetupScreen
        gameId={view.gameId}
        step={view.step}
        onStep={(step) => setView({ ...view, step })}
        onBack={() => setView({ name: 'menu' })}
        onCreated={(id) => setView({ name: 'session', id })}
      />
    )
  }

  if (view.name === 'session') {
    return (
      <SessionScreen
        sessionId={view.id}
        onBack={() => setView({ name: 'menu' })}
        onLaunch={() => setView({ name: 'game', sessionId: view.id })}
        onDeleted={() => setView({ name: 'menu' })}
      />
    )
  }

  return (
    <GameHost
      sessionId={view.sessionId}
      onExit={() => setView({ name: 'session', id: view.sessionId })}
      onDeleted={() => setView({ name: 'menu' })}
    />
  )
}

/** Bouton retour Android : remonte d'un écran, et confirme avant d'abandonner une partie. */
function useAndroidBackButton(view: View, setView: (v: View) => void) {
  const current = useRef(view)
  current.current = view

  useEffect(() => {
    const handle = CapApp.addListener('backButton', () => {
      const v = current.current
      if (v.name === 'menu') {
        CapApp.exitApp()
      } else if (v.name === 'setup') {
        if (v.step === 'config') setView({ ...v, step: 'players' })
        else setView({ name: 'menu' })
      } else if (v.name === 'session') {
        setView({ name: 'menu' })
      } else if (confirm('Quitter la partie en cours ?')) {
        setView({ name: 'session', id: v.sessionId })
      }
    })
    return () => {
      handle.then((h) => h.remove())
    }
  }, [setView])
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
