import { useMemo, useState } from 'react'
import { TopBar } from '../../components/UI'
import { plural, shuffle, uid } from '../../lib'
import type { Camp, ID, LoupGarouConfig, PlayerResult, Round, Session } from '../../types'
import { ROLES, type RoleId } from './roles'

interface LP {
  playerId: ID
  name: string
  role: RoleId
  alive: boolean
  lover: boolean
  /** Le chasseur n'a droit qu'à un seul tir. */
  hasShot: boolean
}

type StepId = 'cupidon' | 'salvateur' | 'voyante' | 'loups' | 'sorciere'

const STEP_TITLE: Record<StepId, string> = {
  cupidon: 'Cupidon',
  salvateur: 'Salvateur',
  voyante: 'Voyante',
  loups: 'Les Loups-Garous',
  sorciere: 'La Sorcière',
}

type Phase =
  | { name: 'intro' }
  | { name: 'deal'; index: number; revealed: boolean }
  | { name: 'night-intro' }
  | { name: 'step'; idx: number }
  | { name: 'voyante-reveal'; idx: number; targetId: ID }
  | { name: 'sorciere-kill'; idx: number }
  | { name: 'lovers'; resumeIdx: number; index: number; revealed: boolean }
  | { name: 'deaths'; ids: ID[]; context: 'dawn' | 'vote' | 'hunter'; next: 'day' | 'night' }
  | { name: 'hunter'; playerId: ID; next: 'day' | 'night' }
  | { name: 'day' }
  | { name: 'result'; winner: Camp; reason: string }

export default function LoupGarouGame({
  session,
  onFinish,
  onQuit,
}: {
  session: Session
  onFinish: (round: Round) => void
  onQuit: () => void
}) {
  // --- Composition : définie dans les réglages de la session ---
  const config = session.config as LoupGarouConfig
  const nbPlayers = session.players.length
  const nbLoups = config.nbLoups
  const specials = config.specials as RoleId[]

  // --- Partie ---
  const [players, setPlayers] = useState<LP[]>([])
  const [phase, setPhase] = useState<Phase>({ name: 'intro' })
  const [steps, setSteps] = useState<StepId[]>([])
  const [nightNo, setNightNo] = useState(0)
  const [target, setTarget] = useState<ID | null>(null)
  const [pair, setPair] = useState<ID[]>([])

  const [victimId, setVictimId] = useState<ID | null>(null)
  const [protectedId, setProtectedId] = useState<ID | null>(null)
  const [lastProtectedId, setLastProtectedId] = useState<ID | null>(null)
  const [witchKillId, setWitchKillId] = useState<ID | null>(null)
  const [witchSaved, setWitchSaved] = useState(false)
  const [healUsed, setHealUsed] = useState(false)
  const [poisonUsed, setPoisonUsed] = useState(false)

  const alive = useMemo(() => players.filter((p) => p.alive), [players])
  const nbVillageois = Math.max(0, nbPlayers - nbLoups - specials.length)

  const byId = (id: ID | null) => players.find((p) => p.playerId === id)

  function start() {
    const roles: RoleId[] = []
    for (let i = 0; i < nbLoups; i++) roles.push('loup')
    roles.push(...specials)
    while (roles.length < nbPlayers) roles.push('villageois')

    const chosen = shuffle(session.players)
    const shuffled = shuffle(roles)
    setPlayers(
      chosen.map((p, i) => ({
        playerId: p.id,
        name: p.name,
        role: shuffled[i],
        alive: true,
        lover: false,
        hasShot: false,
      })),
    )
    setPhase({ name: 'deal', index: 0, revealed: false })
  }

  // --- Déroulé de la nuit ---

  function startNight(list: LP[] = players) {
    const n = nightNo + 1
    setNightNo(n)
    setVictimId(null)
    setWitchKillId(null)
    setWitchSaved(false)
    setLastProtectedId(protectedId)
    setProtectedId(null)
    setTarget(null)

    const s: StepId[] = []
    const hasAlive = (role: RoleId) => list.some((p) => p.alive && p.role === role)
    if (n === 1 && hasAlive('cupidon')) s.push('cupidon')
    if (hasAlive('salvateur')) s.push('salvateur')
    if (hasAlive('voyante')) s.push('voyante')
    s.push('loups')
    if (hasAlive('sorciere')) s.push('sorciere')
    setSteps(s)
    setPhase({ name: 'night-intro' })
  }

  /** `victim` permet de passer la victime des loups sans attendre le commit du state. */
  function goToStep(idx: number, victim: ID | null = victimId) {
    setTarget(null)
    if (idx >= steps.length) {
      dawn(victim)
      return
    }
    setPhase({ name: 'step', idx })
  }

  function dawn(victim: ID | null = victimId) {
    const dying: ID[] = []
    if (victim && !witchSaved && victim !== protectedId) dying.push(victim)
    if (witchKillId && !dying.includes(witchKillId)) dying.push(witchKillId)
    const { list, died } = kill(players, dying)
    setPlayers(list)
    setPhase({ name: 'deaths', ids: died, context: 'dawn', next: 'day' })
  }

  /** Applique des morts en propageant le chagrin des amoureux. */
  function kill(list: LP[], ids: ID[]): { list: LP[]; died: ID[] } {
    const dying = new Set<ID>()
    const queue = [...ids]
    while (queue.length) {
      const id = queue.pop()!
      const p = list.find((x) => x.playerId === id)
      if (!p || !p.alive || dying.has(id)) continue
      dying.add(id)
      if (p.lover) {
        for (const other of list) {
          if (other.lover && other.alive && other.playerId !== id && !dying.has(other.playerId)) {
            queue.push(other.playerId)
          }
        }
      }
    }
    return {
      list: list.map((p) => (dying.has(p.playerId) ? { ...p, alive: false } : p)),
      died: [...dying],
    }
  }

  function checkVictory(list: LP[]): { winner: Camp; reason: string } | null {
    const aliveList = list.filter((p) => p.alive)
    const wolves = aliveList.filter((p) => ROLES[p.role].camp === 'loups')
    const others = aliveList.length - wolves.length
    if (aliveList.length === 0) {
      return { winner: 'loups', reason: 'Le village entier a été décimé.' }
    }
    if (aliveList.length === 2 && aliveList.every((p) => p.lover)) {
      const camps = new Set(aliveList.map((p) => ROLES[p.role].camp))
      if (camps.size === 2) {
        return { winner: 'amoureux', reason: 'Les amoureux sont les derniers survivants.' }
      }
    }
    if (wolves.length === 0) {
      return { winner: 'village', reason: 'Tous les loups-garous ont été éliminés.' }
    }
    if (wolves.length >= others) {
      return { winner: 'loups', reason: 'Les loups sont aussi nombreux que les villageois.' }
    }
    return null
  }

  /** Après une vague de morts : tir du chasseur, victoire, puis phase suivante. */
  function afterDeaths(died: ID[], next: 'day' | 'night') {
    const hunter = players.find((p) => died.includes(p.playerId) && p.role === 'chasseur' && !p.hasShot)
    if (hunter) {
      setPlayers((list) => list.map((p) => (p.playerId === hunter.playerId ? { ...p, hasShot: true } : p)))
      setTarget(null)
      setPhase({ name: 'hunter', playerId: hunter.playerId, next })
      return
    }
    const victory = checkVictory(players)
    if (victory) {
      setPhase({ name: 'result', ...victory })
      return
    }
    if (next === 'day') {
      setTarget(null)
      setPhase({ name: 'day' })
    } else {
      startNight(players)
    }
  }

  function voteOut(playerId: ID | null) {
    if (!playerId) {
      const victory = checkVictory(players)
      if (victory) setPhase({ name: 'result', ...victory })
      else startNight(players)
      return
    }
    const { list, died } = kill(players, [playerId])
    setPlayers(list)
    setPhase({ name: 'deaths', ids: died, context: 'vote', next: 'night' })
  }

  function hunterShoot(shooterNext: 'day' | 'night') {
    if (!target) return
    const { list, died } = kill(players, [target])
    setPlayers(list)
    setPhase({ name: 'deaths', ids: died, context: 'hunter', next: shooterNext })
  }

  function save(winner: Camp, reason: string) {
    const scoring = session.scoring.loupgarou
    const results: PlayerResult[] = players.map((p) => {
      const camp = ROLES[p.role].camp
      const won = winner === 'amoureux' ? p.lover : camp === winner
      const points = won ? (winner === 'amoureux' ? scoring.amoureux : scoring[winner as 'village' | 'loups']) : 0
      return { playerId: p.playerId, role: ROLES[p.role].label, camp, won, points }
    })
    const round: Round = {
      id: uid(),
      gameId: 'loupgarou',
      playedAt: Date.now(),
      summary: `${plural(nightNo, 'nuit')} — ${reason}`,
      winnerCamp: winner,
      results,
    }
    onFinish(round)
  }

  const quitButton = (
    <button
      className="icon"
      onClick={() => {
        if (confirm('Abandonner la partie en cours ?')) onQuit()
      }}
    >
      ✕
    </button>
  )

  function AliveList({
    disabledIds = [],
    onlyIds,
  }: {
    disabledIds?: ID[]
    onlyIds?: ID[]
  }) {
    const list = players.filter((p) => (onlyIds ? onlyIds.includes(p.playerId) : true))
    return (
      <div className="list">
        {list.map((p) => (
          <button
            key={p.playerId}
            className={`item${target === p.playerId ? ' selected' : ''}${p.alive ? '' : ' dead'}`}
            disabled={!p.alive || disabledIds.includes(p.playerId)}
            onClick={() => setTarget(p.playerId)}
          >
            <span className="grow">{p.name}</span>
            {!p.alive && <span className="badge danger">mort</span>}
          </button>
        ))}
      </div>
    )
  }

  // ---------- Écrans ----------

  if (phase.name === 'intro') {
    return (
      <div className="app">
        <TopBar title="Loup-Garou" subtitle={`${plural(nbPlayers, 'joueur')} · prêt ?`} onBack={onQuit} />
        <div className="content">
          <div className="card">
            <h3>Le village ce soir</h3>
            <div className="row wrap chips">
              <span className="badge accent">{plural(nbLoups, 'loup')}</span>
              <span className="badge accent">{nbVillageois} villageois</span>
              {specials.map((r) => (
                <span key={r} className="badge">
                  {ROLES[r].label}
                </span>
              ))}
            </div>
            <p className="muted">Modifiable à tout moment depuis l’engrenage.</p>
          </div>

          <div className="card">
            <h3>Rôles en jeu</h3>
            <div className="list">
              {specials.map((r) => (
                <div key={r} className="item">
                  <span className="grow">
                    {ROLES[r].label}
                    <br />
                    <span className="muted">{ROLES[r].description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={start}>
            Distribuer les rôles
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'deal') {
    const current = players[phase.index]
    const last = phase.index === players.length - 1
    const def = ROLES[current.role]
    const packmates = players.filter((p) => p.role === 'loup' && p.playerId !== current.playerId).map((p) => p.name)
    return (
      <div className="app">
        <TopBar title="Distribution" subtitle={`${phase.index + 1} / ${players.length}`} />
        <div className="content">
          {!phase.revealed ? (
            <>
              <p className="muted center-text">Passe le téléphone à</p>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <span className="muted">Personne d’autre ne doit regarder l’écran.</span>
              </div>
              <button
                className="primary big block"
                onClick={() => setPhase({ name: 'deal', index: phase.index, revealed: true })}
              >
                Voir mon rôle
              </button>
            </>
          ) : (
            <>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <div>
                  <div className="role">{def.label}</div>
                  <div className="muted">{def.description}</div>
                  {current.role === 'loup' && packmates.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <span className="badge accent">Ta meute : {packmates.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="primary big block"
                onClick={() =>
                  last ? startNight() : setPhase({ name: 'deal', index: phase.index + 1, revealed: false })
                }
              >
                {last ? 'Commencer la nuit' : 'Suivant'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase.name === 'night-intro') {
    return (
      <div className="app night">
        <TopBar title={`Nuit ${nightNo}`} right={quitButton} />
        <div className="content">
          <div className="card">
            <h2>Le village s’endort</h2>
            <p className="muted">
              Narrateur : demande à tout le monde de fermer les yeux, puis suis les étapes une par une.
            </p>
          </div>
          <div className="card">
            <h3>Encore en vie ({alive.length})</h3>
            <div className="row wrap">
              {alive.map((p) => (
                <span key={p.playerId} className="badge">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={() => goToStep(0)}>
            Démarrer la nuit
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'step') {
    const step = steps[phase.idx]
    const wolves = players.filter((p) => p.role === 'loup')

    if (step === 'cupidon') {
      const toggle = (id: ID) =>
        setPair((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 2 ? [...cur, id] : cur))
      return (
        <div className="app night">
          <TopBar title={STEP_TITLE.cupidon} subtitle={`Nuit ${nightNo}`} right={quitButton} />
          <div className="content">
            <p className="step-title">Cupidon désigne les deux amoureux</p>
            <p className="muted">Il peut se choisir lui-même. Si l’un meurt, l’autre meurt aussitôt.</p>
            <div className="list">
              {alive.map((p) => (
                <button
                  key={p.playerId}
                  className={`item${pair.includes(p.playerId) ? ' selected' : ''}`}
                  onClick={() => toggle(p.playerId)}
                >
                  <span className="grow">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={pair.length !== 2}
              onClick={() => {
                setPlayers((list) =>
                  list.map((p) => (pair.includes(p.playerId) ? { ...p, lover: true } : p)),
                )
                setPhase({ name: 'lovers', resumeIdx: phase.idx + 1, index: 0, revealed: false })
              }}
            >
              Valider le couple
            </button>
          </div>
        </div>
      )
    }

    if (step === 'salvateur') {
      return (
        <div className="app night">
          <TopBar title={STEP_TITLE.salvateur} subtitle={`Nuit ${nightNo}`} right={quitButton} />
          <div className="content">
            <p className="step-title">Le Salvateur protège un joueur</p>
            {lastProtectedId && (
              <p className="muted">Interdit cette nuit : {byId(lastProtectedId)?.name} (protégé la nuit dernière).</p>
            )}
            <AliveList disabledIds={lastProtectedId ? [lastProtectedId] : []} />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => {
                setProtectedId(target)
                goToStep(phase.idx + 1)
              }}
            >
              Protéger
            </button>
          </div>
        </div>
      )
    }

    if (step === 'voyante') {
      return (
        <div className="app night">
          <TopBar title={STEP_TITLE.voyante} subtitle={`Nuit ${nightNo}`} right={quitButton} />
          <div className="content">
            <p className="step-title">La Voyante sonde un joueur</p>
            <p className="muted">Passe-lui le téléphone : elle choisit, découvre le rôle, puis rend l’appareil.</p>
            <AliveList />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => setPhase({ name: 'voyante-reveal', idx: phase.idx, targetId: target! })}
            >
              Révéler le rôle
            </button>
          </div>
        </div>
      )
    }

    if (step === 'loups') {
      const wolfNames = wolves.filter((p) => p.alive).map((p) => p.name).join(', ')
      const wolfIds = wolves.map((p) => p.playerId)
      return (
        <div className="app night">
          <TopBar title={STEP_TITLE.loups} subtitle={`Nuit ${nightNo}`} right={quitButton} />
          <div className="content">
            <p className="step-title">Les loups choisissent leur victime</p>
            <p className="muted">Meute réveillée : {wolfNames || 'aucun loup en vie'}</p>
            <AliveList disabledIds={wolfIds} />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => {
                setVictimId(target)
                goToStep(phase.idx + 1, target)
              }}
            >
              Dévorer
            </button>
          </div>
        </div>
      )
    }

    // sorciere
    const victim = byId(victimId)
    const victimSurvives = witchSaved || (protectedId !== null && protectedId === victimId)
    return (
      <div className="app night">
        <TopBar title={STEP_TITLE.sorciere} subtitle={`Nuit ${nightNo}`} right={quitButton} />
        <div className="content">
          <p className="step-title">La Sorcière ouvre les yeux</p>
          <div className="card">
            <h3>Victime des loups</h3>
            <p className="big-name">{victim ? victim.name : 'personne'}</p>
            {victimSurvives && <p className="muted center-text">Cette victime est déjà sauvée cette nuit.</p>}
          </div>
          <div className="stack">
            <button
              className="block"
              disabled={healUsed || !victim || victimSurvives}
              onClick={() => {
                setWitchSaved(true)
                setHealUsed(true)
              }}
            >
              Potion de vie {healUsed ? '(utilisée)' : witchSaved ? '✓ appliquée' : ''}
            </button>
            <button
              className="block"
              disabled={poisonUsed}
              onClick={() => {
                setTarget(null)
                setPhase({ name: 'sorciere-kill', idx: phase.idx })
              }}
            >
              Potion de mort {poisonUsed ? '(utilisée)' : witchKillId ? `→ ${byId(witchKillId)?.name}` : ''}
            </button>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={() => goToStep(phase.idx + 1)}>
            Terminer la nuit
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'voyante-reveal') {
    const t = byId(phase.targetId)!
    return (
      <div className="app night">
        <TopBar title="Vision" />
        <div className="content">
          <p className="big-name">{t.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{ROLES[t.role].label}</div>
              <div className="muted">{ROLES[t.role].camp === 'loups' ? 'Camp des loups' : 'Camp du village'}</div>
            </div>
          </div>
          <button className="primary big block" onClick={() => goToStep(phase.idx + 1)}>
            La Voyante referme les yeux
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'sorciere-kill') {
    return (
      <div className="app night">
        <TopBar title="Potion de mort" />
        <div className="content">
          <p className="step-title">Qui la Sorcière empoisonne-t-elle ?</p>
          <AliveList />
        </div>
        <div className="footer-actions">
          <button className="ghost" onClick={() => setPhase({ name: 'step', idx: phase.idx })}>
            Annuler
          </button>
          <button
            className="primary big grow"
            disabled={!target}
            onClick={() => {
              setWitchKillId(target)
              setPoisonUsed(true)
              setTarget(null)
              setPhase({ name: 'step', idx: phase.idx })
            }}
          >
            Empoisonner
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'lovers') {
    const lovers = players.filter((p) => p.lover)
    const current = lovers[phase.index]
    const other = lovers.find((p) => p.playerId !== current.playerId)!
    const last = phase.index === lovers.length - 1
    return (
      <div className="app night">
        <TopBar title="Les amoureux" subtitle={`${phase.index + 1} / ${lovers.length}`} />
        <div className="content">
          {!phase.revealed ? (
            <>
              <p className="muted center-text">Passe discrètement le téléphone à</p>
              <p className="big-name">{current.name}</p>
              <button
                className="primary big block"
                onClick={() => setPhase({ ...phase, revealed: true })}
              >
                Voir mon amoureux
              </button>
            </>
          ) : (
            <>
              <div className="reveal">
                <div>
                  <div className="muted">Tu es amoureux de</div>
                  <div className="word">{other.name}</div>
                  <div className="muted">Si l’un de vous meurt, l’autre meurt de chagrin.</div>
                </div>
              </div>
              <button
                className="primary big block"
                onClick={() =>
                  last
                    ? goToStep(phase.resumeIdx)
                    : setPhase({ ...phase, index: phase.index + 1, revealed: false })
                }
              >
                {last ? 'La nuit continue' : 'Suivant'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase.name === 'deaths') {
    const dead = phase.ids.map((id) => byId(id)!).filter(Boolean)
    const title =
      phase.context === 'dawn' ? `Aube du jour ${nightNo}` : phase.context === 'vote' ? 'Verdict du village' : 'Le Chasseur tire'
    return (
      <div className={`app ${phase.context === 'dawn' || phase.context === 'vote' ? 'day' : ''}`}>
        <TopBar title={title} right={quitButton} />
        <div className="content">
          {dead.length === 0 ? (
            <div className="card">
              <h2>Personne n’est mort</h2>
              <p className="muted">Le village se réveille intact.</p>
            </div>
          ) : (
            <div className="card">
              <h2>{dead.length > 1 ? 'Ils nous quittent' : 'Il/elle nous quitte'}</h2>
              <div className="list">
                {dead.map((p) => (
                  <div key={p.playerId} className="item">
                    <span className="grow">{p.name}</span>
                    <span className="badge danger">{ROLES[p.role].label}</span>
                    {p.lover && <span className="badge warn">amoureux</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={() => afterDeaths(phase.ids, phase.next)}>
            Continuer
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'hunter') {
    const hunter = byId(phase.playerId)!
    return (
      <div className="app">
        <TopBar title="Dernier souffle" />
        <div className="content">
          <p className="step-title">{hunter.name} était le Chasseur</p>
          <p className="muted">Il emporte un joueur de son choix dans la tombe.</p>
          <AliveList />
        </div>
        <div className="footer-actions">
          <button className="primary big block" disabled={!target} onClick={() => hunterShoot(phase.next)}>
            Tirer
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'day') {
    return (
      <div className="app day">
        <TopBar title={`Jour ${nightNo}`} subtitle={`${plural(alive.length, 'survivant')}`} right={quitButton} />
        <div className="content">
          <div className="card">
            <h2>Débat et vote</h2>
            <p className="muted">Le village débat, puis désigne un joueur à éliminer.</p>
          </div>
          <AliveList />
        </div>
        <div className="footer-actions">
          <button className="ghost" onClick={() => voteOut(null)}>
            Personne
          </button>
          <button className="primary big grow" disabled={!target} onClick={() => voteOut(target)}>
            Éliminer
          </button>
        </div>
      </div>
    )
  }

  // result
  const scoring = session.scoring.loupgarou
  return (
    <div className="app">
      <TopBar title="Fin de la partie" />
      <div className="content">
        <div className="card">
          <h2>
            Victoire :{' '}
            {phase.winner === 'village' ? 'le Village' : phase.winner === 'loups' ? 'les Loups-Garous' : 'les Amoureux'}
          </h2>
          <p className="muted">{phase.reason}</p>
        </div>
        <div className="card">
          <h3>Points</h3>
          <div className="list">
            {players.map((p) => {
              const won = phase.winner === 'amoureux' ? p.lover : ROLES[p.role].camp === phase.winner
              const pts = won
                ? phase.winner === 'amoureux'
                  ? scoring.amoureux
                  : scoring[phase.winner as 'village' | 'loups']
                : 0
              return (
                <div key={p.playerId} className="item">
                  <span className="grow">{p.name}</span>
                  <span className="badge">{ROLES[p.role].label}</span>
                  <span className={`badge ${won ? 'success' : ''}`}>+{pts}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="footer-actions">
        <button className="ghost" onClick={onQuit}>
          Ignorer
        </button>
        <button className="primary big grow" onClick={() => save(phase.winner, phase.reason)}>
          Enregistrer au classement
        </button>
      </div>
    </div>
  )
}
