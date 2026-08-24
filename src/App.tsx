import { useEffect, useRef, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import HomeScreen from './screens/HomeScreen'
import SessionScreen from './screens/SessionScreen'
import { addRound, useSession } from './store'
import { getGame } from './games/registry'
import type { GameId, ID, Round } from './types'

type View =
  | { name: 'home' }
  | { name: 'session'; id: ID }
  | { name: 'game'; sessionId: ID; gameId: GameId }

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  useAndroidBackButton(view, setView)

  if (view.name === 'home') {
    return <HomeScreen onOpen={(id) => setView({ name: 'session', id })} />
  }

  if (view.name === 'session') {
    return (
      <SessionScreen
        sessionId={view.id}
        onBack={() => setView({ name: 'home' })}
        onLaunch={(gameId) => setView({ name: 'game', sessionId: view.id, gameId })}
      />
    )
  }

  return <GameHost view={view} onExit={() => setView({ name: 'session', id: view.sessionId })} />
}

/** Bouton retour Android : remonte d'un écran, et confirme avant d'abandonner une partie. */
function useAndroidBackButton(view: View, setView: (v: View) => void) {
  const current = useRef(view)
  current.current = view

  useEffect(() => {
    const handle = CapApp.addListener('backButton', () => {
      const v = current.current
      if (v.name === 'home') {
        CapApp.exitApp()
      } else if (v.name === 'session') {
        setView({ name: 'home' })
      } else if (confirm('Quitter la partie en cours ?')) {
        setView({ name: 'session', id: v.sessionId })
      }
    })
    return () => {
      handle.then((h) => h.remove())
    }
  }, [setView])
}

function GameHost({
  view,
  onExit,
}: {
  view: { sessionId: ID; gameId: GameId }
  onExit: () => void
}) {
  const session = useSession(view.sessionId)
  if (!session) return null

  const Game = getGame(view.gameId).component

  function finish(round: Round) {
    addRound(view.sessionId, round)
    onExit()
  }

  return <Game session={session} onFinish={finish} onQuit={onExit} />
}
