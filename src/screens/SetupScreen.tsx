import { useState } from 'react'
import { PlayerEditor, Stepper, TopBar } from '../components/UI'
import { OpenSettings } from '../components/settings-context'
import ConfigSuggestion from '../components/ConfigSuggestion'
import SettingsSheet from '../components/SettingsSheet'
import { createSession, newPlayer, useDefaultScoring } from '../store'
import { getGame } from '../games/registry'
import { MAX_PLAYERS, type GameConfig, type GameId, type ID, type Player, type Scoring } from '../types'

export type SetupStep = 'players' | 'config'

const STEPS = ['Jeu', 'Joueurs', 'Réglages']

/** Assistant de création : le jeu est déjà choisi, on saisit les joueurs puis les réglages. */
export default function SetupScreen({
  gameId,
  step,
  onStep,
  onBack,
  onCreated,
}: {
  gameId: GameId
  step: SetupStep
  onStep: (step: SetupStep) => void
  onBack: () => void
  onCreated: (id: ID) => void
}) {
  const game = getGame(gameId)
  const defaults = useDefaultScoring()

  const [name, setName] = useState(`${game.name} du ${new Date().toLocaleDateString('fr-FR')}`)
  const [players, setPlayers] = useState<Player[]>([])
  const [config, setConfig] = useState<GameConfig>(() => game.defaultConfig(0))
  /** Tant que l'utilisateur n'a rien touché, les réglages suivent l'effectif saisi. */
  const [configTouched, setConfigTouched] = useState(false)
  const [scoring, setScoring] = useState<Scoring>(() => structuredClone(defaults))
  const [settings, setSettings] = useState(false)

  const missing = Math.max(0, game.minPlayers - players.length)
  const configError = game.validate(players.length, config)

  function addDraft(raw: string): boolean {
    const trimmed = raw.trim()
    if (!trimmed || players.length >= MAX_PLAYERS) return false
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return false
    setPlayers([...players, newPlayer(trimmed)])
    return true
  }

  function editConfig(next: GameConfig) {
    setConfigTouched(true)
    setConfig(next)
  }

  /** Les réglages par défaut dépendent de l'effectif : on les recalcule tant qu'ils n'ont pas été édités. */
  function goToConfig() {
    if (!configTouched || game.validate(players.length, config)) setConfig(game.defaultConfig(players.length))
    onStep('config')
  }

  function launch() {
    const session = createSession({ name, gameId, players, config, scoring })
    onCreated(session.id)
  }

  if (step === 'players') {
    return (
      <OpenSettings.Provider value={() => setSettings(true)}>
      <div className="app">
        <TopBar title={`${game.emoji} ${game.name}`} subtitle="Qui joue ?" onBack={onBack} />
        <Stepper steps={STEPS} current={1} />
        <div className="content">
          <div className="card">
            <h3>Nom de la session</h3>
            <input type="text" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="card">
            <h3>
              Joueurs ({players.length}/{MAX_PLAYERS})
            </h3>
            <PlayerEditor
              players={players}
              onAdd={addDraft}
              onRename={(id, next) => setPlayers(players.map((p) => (p.id === id ? { ...p, name: next.trim() } : p)))}
              onRemove={(id) => setPlayers(players.filter((p) => p.id !== id))}
            />
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" disabled={missing > 0} onClick={goToConfig}>
            {missing > 0 ? `Encore ${missing} joueur${missing > 1 ? 's' : ''}` : 'Réglages de la partie'}
          </button>
        </div>
        {settings && (
          <SettingsSheet
            onClose={() => setSettings(false)}
            subtitle="Session en préparation"
            scoring={{ value: scoring, onChange: setScoring, label: 'Points' }}
            game={game}
          />
        )}
      </div>
      </OpenSettings.Provider>
    )
  }

  return (
    <OpenSettings.Provider value={() => setSettings(true)}>
    <div className="app">
      <TopBar
        title={`${game.emoji} ${game.name}`}
        subtitle={`${players.length} joueurs · réglages`}
        onBack={() => onStep('players')}
      />
      <Stepper steps={STEPS} current={2} />
      <div className="content">
        <ConfigSuggestion game={game} playerCount={players.length} config={config} onApply={editConfig} />
        <game.ConfigEditor playerCount={players.length} config={config} onChange={editConfig} />

        <div className="card">
          <h3>Points par victoire</h3>
          {game.camps.map((camp) => (
            <div key={camp.key} className="row between">
              <span>{camp.label}</span>
              <input
                className="num"
                type="number"
                min={0}
                inputMode="numeric"
                value={scoring[gameId][camp.key] ?? 0}
                onChange={(e) => {
                  const next = structuredClone(scoring)
                  next[gameId][camp.key] = Math.max(0, Number(e.target.value) || 0)
                  setScoring(next)
                }}
              />
            </div>
          ))}
        </div>

        {configError && <p className="error center-text">{configError}</p>}
      </div>
      <div className="footer-actions">
        <button className="primary big block" disabled={!!configError} onClick={launch}>
          Lancer la session
        </button>
      </div>
      {settings && (
        <SettingsSheet
          onClose={() => setSettings(false)}
          subtitle="Session en préparation"
          name={{ value: name, onChange: setName }}
          players={{
            list: players,
            onAdd: addDraft,
            onRename: (id, next) => setPlayers(players.map((p) => (p.id === id ? { ...p, name: next.trim() } : p))),
            onRemove: (id) => setPlayers(players.filter((p) => p.id !== id)),
          }}
          scoring={{ value: scoring, onChange: setScoring, label: 'Points' }}
          game={game}
          config={{ value: config, onChange: editConfig, playerCount: players.length }}
        />
      )}
    </div>
    </OpenSettings.Provider>
  )
}
