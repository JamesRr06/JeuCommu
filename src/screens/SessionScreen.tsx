import { useState } from 'react'
import { ConfirmButton, Empty, TopBar } from '../components/UI'
import { formatDate, plural } from '../lib'
import {
  addPlayer,
  deleteRound,
  ranking,
  removePlayer,
  renamePlayer,
  renameSession,
  setScoring,
  useSession,
} from '../store'
import { CAMP_LABEL, MAX_PLAYERS, type GameId, type ID, type Scoring } from '../types'
import { GAMES, getGame } from '../games/registry'

type Tab = 'jouer' | 'joueurs' | 'classement' | 'historique' | 'reglages'

const TABS: { id: Tab; label: string }[] = [
  { id: 'jouer', label: 'Jouer' },
  { id: 'joueurs', label: 'Joueurs' },
  { id: 'classement', label: 'Classement' },
  { id: 'historique', label: 'Historique' },
  { id: 'reglages', label: 'Réglages' },
]

export default function SessionScreen({
  sessionId,
  onBack,
  onLaunch,
}: {
  sessionId: ID
  onBack: () => void
  onLaunch: (gameId: GameId) => void
}) {
  const session = useSession(sessionId)
  const [tab, setTab] = useState<Tab>('jouer')
  const [newPlayer, setNewPlayer] = useState('')

  if (!session) {
    return (
      <div className="app">
        <TopBar title="Session introuvable" onBack={onBack} />
      </div>
    )
  }

  const rows = ranking(session)

  function addCurrent() {
    if (addPlayer(sessionId, newPlayer)) setNewPlayer('')
  }

  function patchScoring(patch: (s: Scoring) => Scoring) {
    setScoring(sessionId, patch(structuredClone(session!.scoring)))
  }

  return (
    <div className="app">
      <TopBar
        title={session.name}
        subtitle={`${plural(session.players.length, 'joueur')} · ${plural(session.rounds.length, 'partie')}`}
        onBack={onBack}
      />
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="content">
        {tab === 'jouer' && (
          <>
            {GAMES.map((g) => {
              const ok = session.players.length >= g.minPlayers
              return (
                <div key={g.id} className="card">
                  <h2>
                    {g.emoji} {g.name}
                  </h2>
                  <p className="muted">{g.tagline}</p>
                  <button className="primary block" disabled={!ok} onClick={() => onLaunch(g.id)}>
                    {ok ? 'Lancer une partie' : `${g.minPlayers} joueurs minimum`}
                  </button>
                </div>
              )
            })}
            <p className="muted center-text">D’autres jeux arriveront ici.</p>
          </>
        )}

        {tab === 'joueurs' && (
          <div className="card">
            <h3>
              Joueurs ({session.players.length}/{MAX_PLAYERS})
            </h3>
            <div className="row">
              <input
                className="grow"
                type="text"
                value={newPlayer}
                placeholder="Prénom"
                maxLength={20}
                onChange={(e) => setNewPlayer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCurrent()}
              />
              <button className="primary" disabled={session.players.length >= MAX_PLAYERS} onClick={addCurrent}>
                +
              </button>
            </div>
            {session.players.length === 0 ? (
              <Empty>Ajoute les joueurs de la soirée.</Empty>
            ) : (
              <div className="list">
                {session.players.map((p) => (
                  <div key={p.id} className="item">
                    <span className="grow">{p.name}</span>
                    <button
                      className="small ghost"
                      onClick={() => {
                        const next = prompt('Nouveau prénom', p.name)
                        if (next) renamePlayer(sessionId, p.id, next)
                      }}
                    >
                      ✎
                    </button>
                    <ConfirmButton
                      label="✕"
                      message={`Retirer ${p.name} de la session ? Ses parties déjà jouées restent au classement.`}
                      onConfirm={() => removePlayer(sessionId, p.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'classement' && (
          <div className="card">
            <h3>Classement de la session</h3>
            {rows.length === 0 ? (
              <Empty>Ajoute des joueurs et lance une partie.</Empty>
            ) : (
              <div className="list">
                {rows.map((r) => (
                  <div key={r.player.id} className="item">
                    <span
                      className={`rank-num${r.rank === 1 ? ' gold' : r.rank === 2 ? ' silver' : r.rank === 3 ? ' bronze' : ''}`}
                    >
                      {r.rank}
                    </span>
                    <span className="grow">
                      {r.player.name}
                      <br />
                      <span className="muted">
                        {plural(r.wins, 'victoire')} / {plural(r.played, 'partie')}
                      </span>
                    </span>
                    <span className="badge accent">{r.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'historique' && (
          <div className="card">
            <h3>Parties jouées</h3>
            {session.rounds.length === 0 ? (
              <Empty>Aucune partie enregistrée.</Empty>
            ) : (
              <div className="list">
                {session.rounds.map((r) => (
                  <div key={r.id} className="item">
                    <span className="grow">
                      <strong>
                        {getGame(r.gameId).emoji} {getGame(r.gameId).name}
                      </strong>{' '}
                      <span className="badge success">{CAMP_LABEL[r.winnerCamp]}</span>
                      <br />
                      <span className="muted">
                        {formatDate(r.playedAt)} · {r.summary}
                      </span>
                    </span>
                    <ConfirmButton
                      label="✕"
                      message="Supprimer cette partie ? Les points correspondants seront retirés du classement."
                      onConfirm={() => deleteRound(sessionId, r.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reglages' && (
          <>
            <div className="card">
              <h3>Nom de la session</h3>
              <input
                type="text"
                value={session.name}
                onChange={(e) => renameSession(sessionId, e.target.value)}
              />
            </div>

            <div className="card">
              <h3>Points — Undercover</h3>
              {(
                [
                  ['civils', 'Civils'],
                  ['undercover', 'Undercover'],
                  ['mrwhite', 'Mr White'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="row between">
                  <span>{label}</span>
                  <input
                    style={{ width: 90 }}
                    type="number"
                    min={0}
                    value={session.scoring.undercover[key]}
                    onChange={(e) =>
                      patchScoring((s) => {
                        s.undercover[key] = Math.max(0, Number(e.target.value) || 0)
                        return s
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Points — Loup-Garou</h3>
              {(
                [
                  ['village', 'Village'],
                  ['loups', 'Loups-Garous'],
                  ['amoureux', 'Amoureux'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="row between">
                  <span>{label}</span>
                  <input
                    style={{ width: 90 }}
                    type="number"
                    min={0}
                    value={session.scoring.loupgarou[key]}
                    onChange={(e) =>
                      patchScoring((s) => {
                        s.loupgarou[key] = Math.max(0, Number(e.target.value) || 0)
                        return s
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <p className="muted center-text">
              Les points sont figés au moment où une partie est enregistrée : modifier le barème n’altère pas
              l’historique.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
