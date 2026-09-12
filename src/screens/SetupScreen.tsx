import { useState } from 'react'
import { PlayerEditor, Stepper, TopBar } from '../components/UI'
import { OpenSettings } from '../components/settings-context'
import ConfigSuggestion from '../components/ConfigSuggestion'
import ScoringEditor from '../components/ScoringEditor'
import SettingsSheet from '../components/SettingsSheet'
import { useT } from '../i18n'
import { createSession, newPlayer } from '../store'
import { getGame } from '../games/registry'
import {
  DEFAULT_SCORING,
  MAX_PLAYERS,
  type GameConfig,
  type GameId,
  type ID,
  type Player,
  type Scoring,
} from '../types'

export type SetupStep = 'players' | 'config'

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
  const t = useT()
  const game = getGame(gameId)

  const [name, setName] = useState(() =>
    t.setup.defaultName(game.name(t), new Date().toLocaleDateString(t.intl)),
  )
  const [players, setPlayers] = useState<Player[]>([])
  const [config, setConfig] = useState<GameConfig>(() => game.suggest(0))
  /** Tant que l'utilisateur n'a rien touché, les réglages suivent l'effectif saisi. */
  const [configTouched, setConfigTouched] = useState(false)
  const [scoring, setScoring] = useState<Scoring>(() => structuredClone(DEFAULT_SCORING))
  const [settings, setSettings] = useState(false)

  const missing = Math.max(0, game.minPlayers - players.length)
  const configError = game.validate(players.length, config, t)

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
    if (!configTouched || game.validate(players.length, config, t)) setConfig(game.suggest(players.length))
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
          <TopBar title={`${game.emoji} ${game.name(t)}`} subtitle={t.setup.who} onBack={onBack} />
          <Stepper steps={t.setup.steps} current={1} />
          <div className="content fade-step" key={step}>
            <div className="card">
              <h3>{t.setup.sessionName}</h3>
              <input type="text" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="card">
              <h3>{t.setup.playersCount(players.length, MAX_PLAYERS)}</h3>
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
              {missing > 0 ? t.setup.missing(missing) : t.setup.toConfig}
            </button>
          </div>
          {settings && (
            <SettingsSheet
              onClose={() => setSettings(false)}
              subtitle={t.setup.inPreparation}
              scoring={{ value: scoring, onChange: setScoring }}
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
          title={`${game.emoji} ${game.name(t)}`}
          subtitle={t.setup.configSubtitle(players.length)}
          onBack={() => onStep('players')}
        />
        <Stepper steps={t.setup.steps} current={2} />
        <div className="content fade-step" key={step}>
          <ConfigSuggestion game={game} playerCount={players.length} config={config} onApply={editConfig} />
          <game.ConfigEditor playerCount={players.length} config={config} onChange={editConfig} />

          <ScoringEditor games={[game]} label={t.scoring.perWin} scoring={scoring} onChange={setScoring} />

          {configError && <p className="error center-text">{configError}</p>}
        </div>
        <div className="footer-actions">
          <button className="primary big block" disabled={!!configError} onClick={launch}>
            {t.setup.launch}
          </button>
        </div>
        {settings && (
          <SettingsSheet
            onClose={() => setSettings(false)}
            subtitle={t.setup.inPreparation}
            name={{ value: name, onChange: setName }}
            players={{
              list: players,
              onAdd: addDraft,
              onRename: (id, next) => setPlayers(players.map((p) => (p.id === id ? { ...p, name: next.trim() } : p))),
              onRemove: (id) => setPlayers(players.filter((p) => p.id !== id)),
            }}
            scoring={{ value: scoring, onChange: setScoring }}
            game={game}
            config={{ value: config, onChange: editConfig, playerCount: players.length }}
          />
        )}
      </div>
    </OpenSettings.Provider>
  )
}
