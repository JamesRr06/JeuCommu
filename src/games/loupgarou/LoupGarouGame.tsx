import { useMemo, useState, type ReactNode } from 'react'
import { QuitButton, TopBar } from '../../components/UI'
import DebateTimer from '../../components/Timer'
import { useT } from '../../i18n'
import { haptic, shuffle, uid } from '../../lib'
import {
  DEFAULT_DEBATE_MINUTES,
  type Camp,
  type ID,
  type LoupGarouConfig,
  type PlayerResult,
  type Round,
} from '../../types'
import { ROLES, type RoleId } from './roles'
import type { GameProps } from '../registry'

interface LP {
  playerId: ID
  name: string
  role: RoleId
  alive: boolean
  lover: boolean
  /** Peut emporter quelqu'un en mourant (Chasseur, ou carte de Chasseur héritée). */
  canShoot: boolean
  hasShot: boolean
  /** Marionnettiste ayant perdu sa marionnette : il survit, mais ne parle plus. */
  mute: boolean
  /** Compte comme loup : Chien-Loup rallié, Enfant Sauvage transformé. */
  wolf: boolean
  /** Chien-Loup ayant déjà choisi son camp à la distribution. */
  decided: boolean
  /** Ancien : encaisse la première morsure. */
  shield: boolean
  /** Villageois-Villageois : sa carte est publique dès le départ. */
  publicCard: boolean
  /** Idiot du Village démasqué : plus de droit de vote. */
  noVote: boolean
}

type StepId =
  | 'voleur'
  | 'cupidon'
  | 'sauvage'
  | 'sauvage-turn'
  | 'salvateur'
  | 'voyante'
  | 'renard'
  | 'comedien'
  | 'singe'
  | 'loups'
  | 'loupblanc'
  | 'sorciere'
  | 'corbeau'

/** Emblème animé affiché au narrateur pendant l'étape, pour repérer d'un coup d'œil qui se réveille. */
const STEP_ICON: Record<StepId, string> = {
  voleur: '🃏',
  cupidon: '💘',
  sauvage: '🧒',
  'sauvage-turn': '🌘',
  salvateur: '🛡️',
  voyante: '🔮',
  renard: '🦊',
  comedien: '🎭',
  singe: '🐒',
  loups: '🐺',
  loupblanc: '🌕',
  sorciere: '🧪',
  corbeau: '🐦‍⬛',
}

/** Pouvoirs que le Comédien peut piocher : ceux que l'app sait lui faire jouer telle quelle. */
const ACTOR_POOL: RoleId[] = ['voyante', 'salvateur', 'renard', 'corbeau', 'chasseur']

/** Cartes du Comédien qui ouvrent une étape de nuit ; les autres sont des pouvoirs passifs. */
const ACTOR_STEPS: Partial<Record<RoleId, StepId>> = {
  voyante: 'voyante',
  salvateur: 'salvateur',
  renard: 'renard',
  corbeau: 'corbeau',
}

function Emblem({ icon, label }: { icon: string; label?: string }) {
  return (
    <div className="emblem">
      <span className="emblem-icon">{icon}</span>
      {label && <span className="emblem-label">{label}</span>}
    </div>
  )
}

type DeathContext = 'dawn' | 'vote' | 'hunter'
type NextPhase = 'day' | 'night'

type Phase =
  | { name: 'intro' }
  | { name: 'deal'; index: number; revealed: boolean }
  | { name: 'night-intro' }
  | { name: 'step'; idx: number }
  | { name: 'voleur-cards'; idx: number }
  | { name: 'voyante-reveal'; idx: number; targetId: ID }
  | { name: 'renard-reveal'; idx: number; targetId: ID; found: boolean }
  | { name: 'comedien-cards'; idx: number }
  | { name: 'singe-pick'; idx: number; seen: ID[] }
  | { name: 'singe-reveal'; idx: number; seen: ID[]; targetId: ID }
  | { name: 'sorciere-kill'; idx: number }
  | { name: 'shielded'; playerId: ID; pending: ID[] }
  | { name: 'colosse'; playerId: ID; pending: ID[]; revealed: boolean }
  | { name: 'lovers'; resumeIdx: number; index: number; revealed: boolean }
  | { name: 'servante'; ids: ID[]; context: DeathContext; next: NextPhase }
  | { name: 'servante-reveal'; ids: ID[]; context: DeathContext; next: NextPhase; role: RoleId }
  | { name: 'deaths'; ids: ID[]; context: DeathContext; next: NextPhase }
  | { name: 'hunter'; playerId: ID; next: NextPhase }
  | { name: 'idiot'; playerId: ID }
  | { name: 'bouc'; playerId: ID }
  | { name: 'judge' }
  | { name: 'day' }
  | { name: 'result'; winner: Camp; reason: string }

/** Un joueur compte comme loup s'il a la carte, ou s'il a rallié la meute en cours de partie. */
function isWolf(p: LP): boolean {
  return p.wolf || ROLES[p.role].camp === 'loups'
}

function campOf(p: LP): Extract<Camp, 'village' | 'loups'> {
  return isWolf(p) ? 'loups' : 'village'
}

/**
 * Liste des joueurs, avec sélection. Définie au niveau du module : déclarée dans le
 * composant, React la verrait comme un type différent à chaque rendu, remonterait
 * toutes les lignes et rejouerait leur animation d'entrée à chaque sélection.
 */
function AliveList({
  players,
  target,
  onSelect,
  disabledIds = [],
  onlyIds,
  extra,
}: {
  players: LP[]
  target: ID | null
  onSelect: (id: ID) => void
  disabledIds?: ID[]
  onlyIds?: ID[]
  extra?: (p: LP) => ReactNode
}) {
  const t = useT()
  const list = players.filter((p) => (onlyIds ? onlyIds.includes(p.playerId) : true))
  return (
    <div className="list">
      {list.map((p) => (
        <button
          key={p.playerId}
          className={`item${target === p.playerId ? ' selected' : ''}${p.alive ? '' : ' dead'}`}
          disabled={!p.alive || disabledIds.includes(p.playerId)}
          onClick={() => onSelect(p.playerId)}
        >
          <span className="grow">{p.name}</span>
          {p.alive && extra?.(p)}
          {p.alive && p.publicCard && <span className="badge success">{t.lg.badges.innocent}</span>}
          {p.alive && p.mute && <span className="badge warn">{t.lg.badges.mute}</span>}
          {p.alive && p.noVote && <span className="badge warn">{t.lg.badges.noVote}</span>}
          {!p.alive && <span className="badge danger">{t.lg.badges.dead}</span>}
        </button>
      ))}
    </div>
  )
}

/** La cible et ses deux voisins vivants, dans l'ordre de la table. */
function foxGroup(players: LP[], targetId: ID): LP[] {
  const order = players.filter((p) => p.alive)
  const i = order.findIndex((p) => p.playerId === targetId)
  if (i < 0) return []
  const n = order.length
  const group = [order[(i - 1 + n) % n], order[i], order[(i + 1) % n]]
  return group.filter((p, idx) => group.findIndex((x) => x.playerId === p.playerId) === idx)
}

export default function LoupGarouGame({ session, onFinish, onQuit }: GameProps) {
  const t = useT()
  // --- Composition : définie dans les réglages de la session ---
  const config = session.config as LoupGarouConfig
  const nbPlayers = session.players.length
  const nbLoups = config.nbLoups
  const specials = config.specials as RoleId[]
  const debateMinutes = config.debateMinutes ?? DEFAULT_DEBATE_MINUTES

  // --- Partie ---
  const [players, setPlayers] = useState<LP[]>([])
  const [phase, setPhase] = useState<Phase>({ name: 'intro' })
  const [steps, setSteps] = useState<StepId[]>([])
  const [nightNo, setNightNo] = useState(0)
  const [target, setTarget] = useState<ID | null>(null)
  /** Sélection multiple partagée par Cupidon et par le Bouc Émissaire. */
  const [selection, setSelection] = useState<ID[]>([])

  const [victimId, setVictimId] = useState<ID | null>(null)
  const [protectedId, setProtectedId] = useState<ID | null>(null)
  const [lastProtectedId, setLastProtectedId] = useState<ID | null>(null)
  const [witchKillId, setWitchKillId] = useState<ID | null>(null)
  const [witchSaved, setWitchSaved] = useState(false)
  const [healUsed, setHealUsed] = useState(false)
  const [poisonUsed, setPoisonUsed] = useState(false)
  /** Le Singe Savant n'ouvre les cartes qu'une seule fois dans la partie. */
  const [singeUsed, setSingeUsed] = useState(false)
  /** Singe démasqué par une carte de loup : sa mort est annoncée à l'aube. */
  const [singeDeadId, setSingeDeadId] = useState<ID | null>(null)
  /** Victime du Loup-Garou Blanc, une nuit sur deux. */
  const [whiteVictimId, setWhiteVictimId] = useState<ID | null>(null)
  /** Les deux cartes laissées au milieu quand le Voleur est en jeu. */
  const [thiefCards, setThiefCards] = useState<RoleId[]>([])
  /** Les cartes encore disponibles pour le Comédien. */
  const [actorCards, setActorCards] = useState<RoleId[]>([])
  /** Le Renard perd son flair dès qu'il ne trouve aucun loup. */
  const [foxLost, setFoxLost] = useState(false)
  /** Désigné du Corbeau, valable pour la journée qui suit. */
  const [crowId, setCrowId] = useState<ID | null>(null)
  /** Modèle de l'Enfant Sauvage, et sa transformation à annoncer en privé. */
  const [modelId, setModelId] = useState<ID | null>(null)
  const [turnedId, setTurnedId] = useState<ID | null>(null)
  const [judgeUsed, setJudgeUsed] = useState(false)
  const [servanteUsed, setServanteUsed] = useState(false)
  /** Cartes reprises par la Servante : elles ne sont jamais révélées. */
  const [hiddenRoles, setHiddenRoles] = useState<ID[]>([])
  /** Le village a brûlé l'Ancien : plus aucun pouvoir villageois. */
  const [powersLost, setPowersLost] = useState(false)
  /** Joueurs privés de vote par le Bouc Émissaire, pour un seul jour. */
  const [banned, setBanned] = useState<{ day: number; ids: ID[] }>({ day: 0, ids: [] })
  const [boucTie, setBoucTie] = useState(false)

  const alive = useMemo(() => players.filter((p) => p.alive), [players])
  const nbVillageois = Math.max(0, nbPlayers - nbLoups - specials.length)

  const byId = (id: ID | null) => players.find((p) => p.playerId === id)
  const packNames = (exceptId?: ID) =>
    players.filter((p) => p.alive && isWolf(p) && p.playerId !== exceptId).map((p) => p.name)

  /** Applique à un joueur les attributs liés à une carte fraîchement acquise. */
  function withRole(p: LP, role: RoleId): LP {
    return {
      ...p,
      role,
      canShoot: p.canShoot || role === 'chasseur',
      mute: false,
      decided: role !== 'chienloup',
      shield: role === 'ancien',
      publicCard: role === 'villageois2',
    }
  }

  function start() {
    const roles: RoleId[] = []
    for (let i = 0; i < nbLoups; i++) roles.push('loup')
    roles.push(...specials)
    while (roles.length < nbPlayers) roles.push('villageois')

    let dealt: RoleId[]
    if (specials.includes('voleur')) {
      // Deux villageois s'ajoutent au paquet, puis deux cartes au hasard restent au milieu :
      // la meute ne peut donc jamais dépasser l'effectif annoncé. Le Voleur, lui, est toujours distribué.
      const pool = shuffle([...roles.filter((r) => r !== 'voleur'), 'villageois' as RoleId, 'villageois' as RoleId])
      setThiefCards(pool.slice(0, 2))
      dealt = shuffle([...pool.slice(2), 'voleur' as RoleId])
    } else {
      setThiefCards([])
      dealt = shuffle(roles)
    }

    setActorCards(
      specials.includes('comedien') ? shuffle(ACTOR_POOL.filter((r) => !specials.includes(r))).slice(0, 3) : [],
    )

    // L'ordre des joueurs reste celui de la session : c'est l'ordre de la table, dont le Renard se sert.
    setPlayers(
      session.players.map((p, i) => ({
        playerId: p.id,
        name: p.name,
        role: dealt[i],
        alive: true,
        lover: false,
        canShoot: dealt[i] === 'chasseur',
        hasShot: false,
        mute: false,
        wolf: false,
        decided: dealt[i] !== 'chienloup',
        shield: dealt[i] === 'ancien',
        publicCard: dealt[i] === 'villageois2',
        noVote: false,
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
    setSingeDeadId(null)
    setWhiteVictimId(null)
    setCrowId(null)
    setTarget(null)

    const s: StepId[] = []
    const hasAlive = (role: RoleId) => list.some((p) => p.alive && p.role === role)
    // La rancune de l'Ancien éteint tous les pouvoirs du village.
    const power = (role: RoleId) => hasAlive(role) && !powersLost

    if (n === 1 && hasAlive('voleur')) s.push('voleur')
    if (n === 1 && power('cupidon')) s.push('cupidon')
    if (n === 1 && power('sauvage')) s.push('sauvage')
    if (turnedId) s.push('sauvage-turn')
    if (power('salvateur')) s.push('salvateur')
    if (power('voyante')) s.push('voyante')
    if (power('renard') && !foxLost) s.push('renard')
    if (power('comedien') && actorCards.length > 0) s.push('comedien')
    if (power('singe') && !singeUsed) s.push('singe')
    s.push('loups')
    if (hasAlive('loupblanc') && n % 2 === 0) s.push('loupblanc')
    if (power('sorciere')) s.push('sorciere')
    if (power('corbeau')) s.push('corbeau')
    setSteps(s)
    setPhase({ name: 'night-intro' })
  }

  /** Les surcharges évitent d'attendre le commit du state pour la dernière étape de la nuit. */
  function goToStep(idx: number, over: { victim?: ID | null; white?: ID | null; singe?: ID | null } = {}) {
    setTarget(null)
    if (idx >= steps.length) {
      dawn(
        over.victim !== undefined ? over.victim : victimId,
        over.singe !== undefined ? over.singe : singeDeadId,
        over.white !== undefined ? over.white : whiteVictimId,
      )
      return
    }
    setPhase({ name: 'step', idx })
  }

  function dawn(
    victim: ID | null = victimId,
    singeDead: ID | null = singeDeadId,
    whiteVictim: ID | null = whiteVictimId,
  ) {
    const dying: ID[] = []
    if (victim && !witchSaved && victim !== protectedId) dying.push(victim)
    if (whiteVictim && !dying.includes(whiteVictim)) dying.push(whiteVictim)
    if (witchKillId && !dying.includes(witchKillId)) dying.push(witchKillId)
    if (singeDead && !dying.includes(singeDead)) dying.push(singeDead)

    // Seule la morsure de la meute déclenche les pouvoirs de mort ; poison et Loup Blanc passent outre.
    const devoured =
      victim && dying.includes(victim) && witchKillId !== victim && whiteVictim !== victim ? byId(victim) : undefined

    if (devoured && !powersLost) {
      const survives =
        (devoured.role === 'marionnettiste' && !devoured.mute) || (devoured.role === 'ancien' && devoured.shield)
      if (survives) {
        setPlayers((list) =>
          list.map((p) =>
            p.playerId === devoured.playerId
              ? { ...p, mute: p.role === 'marionnettiste' ? true : p.mute, shield: false }
              : p,
          ),
        )
        setPhase({
          name: 'shielded',
          playerId: devoured.playerId,
          pending: dying.filter((id) => id !== devoured.playerId),
        })
        return
      }

      if (devoured.role === 'colosse' && players.some((p) => p.alive && isWolf(p))) {
        setTarget(null)
        setPhase({ name: 'colosse', playerId: devoured.playerId, pending: dying, revealed: false })
        return
      }
    }

    resolveDeaths(players, dying, 'dawn', 'day')
  }

  /** Applique une vague de morts, puis laisse sa chance à la Servante avant toute révélation. */
  function resolveDeaths(list: LP[], ids: ID[], context: DeathContext, next: NextPhase) {
    const { list: after, died } = kill(list, ids)
    setPlayers(after)
    const servante = after.find((p) => p.alive && p.role === 'servante')
    const takeable = died.filter((id) => id !== servante?.playerId)
    if (servante && !servanteUsed && !powersLost && takeable.length > 0) {
      setPhase({ name: 'servante', ids: died, context, next })
      return
    }
    setPhase({ name: 'deaths', ids: died, context, next })
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
    if (aliveList.length === 0) {
      return { winner: 'loups', reason: t.lg.reasonDecimated }
    }
    if (aliveList.length === 1 && aliveList[0].role === 'loupblanc') {
      return { winner: 'solitaire', reason: t.lg.reasonWhiteLast }
    }
    const wolves = aliveList.filter(isWolf)
    const others = aliveList.length - wolves.length
    if (aliveList.length === 2 && aliveList.every((p) => p.lover)) {
      const camps = new Set(aliveList.map(campOf))
      if (camps.size === 2) {
        return { winner: 'amoureux', reason: t.lg.reasonLoversLast }
      }
    }
    if (wolves.length === 0) {
      return { winner: 'village', reason: t.lg.reasonWolvesDead }
    }
    if (wolves.length >= others) {
      return { winner: 'loups', reason: t.lg.reasonWolvesParity }
    }
    return null
  }

  /** Après une vague de morts : rancune de l'Ancien, transformation, tir, victoire, suite. */
  function afterDeaths(died: ID[], next: NextPhase, context: DeathContext) {
    let list = players
    let lost = powersLost

    const elder = list.find((p) => died.includes(p.playerId) && p.role === 'ancien')
    if (elder && context === 'vote') {
      lost = true
      setPowersLost(true)
    }

    // L'Enfant Sauvage bascule dès que son modèle tombe ; on le lui dira en privé la nuit suivante.
    const child = list.find((p) => p.alive && p.role === 'sauvage' && !p.wolf)
    if (child && modelId && died.includes(modelId)) {
      list = list.map((p) => (p.playerId === child.playerId ? { ...p, wolf: true } : p))
      setPlayers(list)
      setTurnedId(child.playerId)
    }

    const hunter = list.find((p) => died.includes(p.playerId) && p.canShoot && !p.hasShot)
    if (hunter && !lost) {
      list = list.map((p) => (p.playerId === hunter.playerId ? { ...p, hasShot: true } : p))
      setPlayers(list)
      setTarget(null)
      setPhase({ name: 'hunter', playerId: hunter.playerId, next })
      return
    }

    const victory = checkVictory(list)
    if (victory) {
      setPhase({ name: 'result', ...victory })
      return
    }

    if (boucTie) {
      setBoucTie(false)
      const bouc = list.find((p) => died.includes(p.playerId) && p.role === 'bouc')
      if (bouc) {
        setSelection([])
        setPhase({ name: 'bouc', playerId: bouc.playerId })
        return
      }
    }

    if (next === 'day') {
      setTarget(null)
      setPhase({ name: 'day' })
    } else {
      // Toute chaîne de morts partie du vote repasse par le Juge Bègue avant la nuit.
      afterVote(list)
    }
  }

  /** Fin de journée : le Juge Bègue peut encore exiger un second vote. */
  function afterVote(list: LP[]) {
    const judge = list.find((p) => p.alive && p.role === 'juge')
    if (judge && !judgeUsed && !powersLost) {
      setPhase({ name: 'judge' })
      return
    }
    startNight(list)
  }

  function voteOut(playerId: ID | null) {
    if (!playerId) {
      const victory = checkVictory(players)
      if (victory) setPhase({ name: 'result', ...victory })
      else afterVote(players)
      return
    }
    const p = byId(playerId)!
    // L'Idiot est épargné la première fois : sa carte est retournée, il perd son vote.
    if (p.role === 'idiot' && !p.noVote) {
      setPlayers((list) => list.map((x) => (x.playerId === playerId ? { ...x, noVote: true } : x)))
      setPhase({ name: 'idiot', playerId })
      return
    }
    resolveDeaths(players, [playerId], 'vote', 'night')
  }

  function voteTie() {
    const bouc = players.find((p) => p.alive && p.role === 'bouc')
    if (!bouc) return
    setBoucTie(true)
    resolveDeaths(players, [bouc.playerId], 'vote', 'night')
  }

  function hunterShoot(shooterNext: NextPhase) {
    if (!target) return
    resolveDeaths(players, [target], 'hunter', shooterNext)
  }

  function save(winner: Camp, reason: string) {
    const scoring = session.scoring.loupgarou
    const results: PlayerResult[] = players.map((p) => {
      const camp = campOf(p)
      const won =
        winner === 'amoureux' ? p.lover : winner === 'solitaire' ? p.role === 'loupblanc' : camp === winner
      const points = won ? (scoring[winner] ?? 0) : 0
      return { playerId: p.playerId, role: t.roles[p.role].label, camp, won, points }
    })
    const round: Round = {
      id: uid(),
      gameId: 'loupgarou',
      playedAt: Date.now(),
      summary: `${t.common.nights(nightNo)} — ${reason}`,
      winnerCamp: winner,
      results,
    }
    onFinish(round)
  }

  // Change à chaque écran : remonte le contenu et rejoue l'animation d'entrée.
  const phaseKey = JSON.stringify(phase)

  const quitButton = <QuitButton onQuit={onQuit} />

  // ---------- Écrans ----------

  if (phase.name === 'intro') {
    return (
      <div className="app">
        <TopBar title={t.games.loupgarou.name} subtitle={t.lg.ready(nbPlayers)} onBack={onQuit} />
        <div className="content fade-step" key={phaseKey}>
          <div className="card">
            <h3>{t.lg.villageTonight}</h3>
            <div className="row wrap chips">
              <span className="badge accent">{t.games.loupgarou.wolves(nbLoups)}</span>
              <span className="badge accent">{t.games.loupgarou.villagers(nbVillageois)}</span>
              {specials.map((r) => (
                <span key={r} className="badge">
                  {t.roles[r].label}
                </span>
              ))}
            </div>
            <p className="muted">{t.lg.settingsHint}</p>
            {specials.includes('voleur') && (
              <p className="muted">{t.lg.thiefNote}</p>
            )}
          </div>

          <div className="card">
            <h3>{t.lg.rolesInPlay}</h3>
            <div className="list">
              {specials.map((r) => (
                <div key={r} className="item">
                  <span className="grow">
                    {t.roles[r].label}
                    <br />
                    <span className="muted">{t.roles[r].description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={start}>
            {t.lg.dealRoles}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'deal') {
    const current = players[phase.index]
    const last = phase.index === players.length - 1
    const def = t.roles[current.role]
    const packmates = packNames(current.playerId)
    const dogChoice = current.role === 'chienloup' && !current.decided

    function decideDog(joinPack: boolean) {
      setPlayers((list) =>
        list.map((p) => (p.playerId === current.playerId ? { ...p, wolf: joinPack, decided: true } : p)),
      )
    }

    return (
      <div className="app">
        <TopBar title={t.lg.dealing} subtitle={`${phase.index + 1} / ${players.length}`} />
        <div className="content fade-step" key={phaseKey}>
          {!phase.revealed ? (
            <>
              <p className="muted center-text">{t.lg.passTo}</p>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <span className="muted">{t.lg.noPeeking}</span>
              </div>
              <button
                className="primary big block"
                onClick={() => {
                  haptic()
                  setPhase({ name: 'deal', index: phase.index, revealed: true })
                }}
              >
                {t.lg.seeMyRole}
              </button>
            </>
          ) : (
            <>
              <p className="big-name">{current.name}</p>
              <div className="reveal">
                <div>
                  <div className="role">{def.label}</div>
                  <div className="muted">{def.description}</div>
                  {isWolf(current) && packmates.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <span className="badge accent">{t.lg.yourPack(packmates.join(', '))}</span>
                    </div>
                  )}
                  {current.publicCard && (
                    <div style={{ marginTop: 12 }}>
                      <span className="badge success">{t.lg.showCard}</span>
                    </div>
                  )}
                </div>
              </div>
              {dogChoice ? (
                <div className="stack">
                  <p className="muted center-text">{t.lg.dogAsk}</p>
                  <button className="primary big block" onClick={() => decideDog(false)}>
                    {t.lg.dogStay}
                  </button>
                  <button className="big block" onClick={() => decideDog(true)}>
                    {t.lg.dogJoin}
                  </button>
                </div>
              ) : (
                <button
                  className="primary big block"
                  onClick={() =>
                    last ? startNight() : setPhase({ name: 'deal', index: phase.index + 1, revealed: false })
                  }
                >
                  {last ? t.lg.startNight : t.common.next}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase.name === 'night-intro') {
    return (
      <div className="app night">
        <TopBar title={t.lg.night(nightNo)} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <Emblem icon="🌙" label={t.lg.night(nightNo)} />
          <div className="card">
            <h2>{t.lg.villageSleeps}</h2>
            <p className="muted">{t.lg.narratorIntro}</p>
            {powersLost && <p className="error">{t.lg.powersLost}</p>}
          </div>
          <div className="card">
            <h3>{t.lg.stillAlive(alive.length)}</h3>
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
            {t.lg.beginNight}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'step') {
    const step = steps[phase.idx]
    const wolves = players.filter(isWolf)

    if (step === 'voleur') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.voleur} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.voleur} />
            <p className="step-title">{t.lg.thiefOpens}</p>
            <p className="muted">{t.lg.thiefIntro}</p>
          </div>
          <div className="footer-actions">
            <button className="primary big block" onClick={() => setPhase({ name: 'voleur-cards', idx: phase.idx })}>
              {t.lg.thiefSeeCards}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'cupidon') {
      const toggle = (id: ID) =>
        setSelection((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 2 ? [...cur, id] : cur))
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.cupidon} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.cupidon} />
            <p className="step-title">{t.lg.cupidTitle}</p>
            <p className="muted">{t.lg.cupidNote}</p>
            <div className="list">
              {alive.map((p) => (
                <button
                  key={p.playerId}
                  className={`item${selection.includes(p.playerId) ? ' selected' : ''}`}
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
              disabled={selection.length !== 2}
              onClick={() => {
                setPlayers((list) => list.map((p) => (selection.includes(p.playerId) ? { ...p, lover: true } : p)))
                setPhase({ name: 'lovers', resumeIdx: phase.idx + 1, index: 0, revealed: false })
              }}
            >
              {t.lg.cupidValidate}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'sauvage') {
      const child = players.find((p) => p.role === 'sauvage')!
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.sauvage} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.sauvage} />
            <p className="step-title">{t.lg.childTitle}</p>
            <p className="muted">{t.lg.childNote}</p>
            <AliveList players={players} target={target} onSelect={setTarget} disabledIds={[child.playerId]} />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => {
                setModelId(target)
                goToStep(phase.idx + 1)
              }}
            >
              {t.lg.childPick}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'sauvage-turn') {
      const child = byId(turnedId)!
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles['sauvage-turn']} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON['sauvage-turn']} />
            <p className="muted center-text">{t.lg.childWake}</p>
            <p className="big-name">{child.name}</p>
            <div className="reveal">
              <div>
                <div className="role">{t.lg.childTurned}</div>
                <div className="muted">{t.lg.childTurnedNote}</div>
                <div className="pad-top">
                  <span className="badge accent">
                    {t.lg.yourPack(packNames(child.playerId).join(', ') || t.common.noOne)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              onClick={() => {
                setTurnedId(null)
                goToStep(phase.idx + 1)
              }}
            >
              {t.lg.childCloses}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'salvateur') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.salvateur} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.salvateur} />
            <p className="step-title">{t.lg.guardTitle}</p>
            {lastProtectedId && <p className="muted">{t.lg.guardForbidden(byId(lastProtectedId)?.name ?? '')}</p>}
            <AliveList players={players} target={target} onSelect={setTarget} disabledIds={lastProtectedId ? [lastProtectedId] : []} />
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
              {t.lg.guardProtect}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'voyante') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.voyante} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.voyante} />
            <p className="step-title">{t.lg.seerTitle}</p>
            <p className="muted">{t.lg.seerNote}</p>
            <AliveList players={players} target={target} onSelect={setTarget} />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => setPhase({ name: 'voyante-reveal', idx: phase.idx, targetId: target! })}
            >
              {t.lg.seerReveal}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'renard') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.renard} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.renard} />
            <p className="step-title">{t.lg.foxTitle}</p>
            <p className="muted">{t.lg.foxNote}</p>
            <AliveList players={players} target={target} onSelect={setTarget} />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => {
                const group = foxGroup(players, target!)
                const found = group.some(isWolf)
                if (!found) setFoxLost(true)
                setPhase({ name: 'renard-reveal', idx: phase.idx, targetId: target!, found })
              }}
            >
              {t.lg.foxSniff}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'comedien') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.comedien} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.comedien} />
            <p className="step-title">{t.lg.actorTitle}</p>
            <p className="muted">{t.lg.actorNote(t.common.cards(actorCards.length))}</p>
          </div>
          <div className="footer-actions">
            <button className="ghost" onClick={() => goToStep(phase.idx + 1)}>
              {t.common.skip}
            </button>
            <button className="primary big grow" onClick={() => setPhase({ name: 'comedien-cards', idx: phase.idx })}>
              {t.lg.actorSeeCards}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'singe') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.singe} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.singe} />
            <p className="step-title">{t.lg.monkeyTitle}</p>
            <p className="muted">{t.lg.monkeyNote}</p>
            <div className="card">
              <h3>{t.lg.monkeyOnce}</h3>
              <p className="muted">{t.lg.monkeyOnceNote}</p>
            </div>
          </div>
          <div className="footer-actions">
            <button className="ghost" onClick={() => goToStep(phase.idx + 1)}>
              {t.common.skip}
            </button>
            <button
              className="primary big grow"
              onClick={() => {
                setSingeUsed(true)
                setTarget(null)
                setPhase({ name: 'singe-pick', idx: phase.idx, seen: [] })
              }}
            >
              {t.lg.monkeyConsult}
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
          <TopBar title={t.lg.stepTitles.loups} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.loups} />
            <p className="step-title">{t.lg.wolvesTitle}</p>
            <p className="muted">{t.lg.wolvesAwake(wolfNames || t.lg.noWolfAlive)}</p>
            <AliveList players={players} target={target} onSelect={setTarget} disabledIds={wolfIds} />
          </div>
          <div className="footer-actions">
            <button
              className="primary big block"
              disabled={!target}
              onClick={() => {
                haptic([18, 40, 18])
                setVictimId(target)
                goToStep(phase.idx + 1, { victim: target })
              }}
            >
              {t.lg.devour}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'loupblanc') {
      const white = players.find((p) => p.role === 'loupblanc')!
      const preys = players.filter((p) => p.alive && isWolf(p) && p.playerId !== white.playerId)
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.loupblanc} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.loupblanc} />
            <p className="step-title">{t.lg.whiteTitle}</p>
            <p className="muted">{t.lg.whiteNote}</p>
            {preys.length === 0 ? (
              <p className="muted center-text">{t.lg.whiteNoPrey}</p>
            ) : (
              <AliveList players={players} target={target} onSelect={setTarget} onlyIds={preys.map((p) => p.playerId)} />
            )}
          </div>
          <div className="footer-actions">
            <button className="ghost" onClick={() => goToStep(phase.idx + 1, { white: null })}>
              {t.common.skip}
            </button>
            <button
              className="primary big grow"
              disabled={!target}
              onClick={() => {
                setWhiteVictimId(target)
                goToStep(phase.idx + 1, { white: target })
              }}
            >
              {t.lg.devour}
            </button>
          </div>
        </div>
      )
    }

    if (step === 'corbeau') {
      return (
        <div className="app night">
          <TopBar title={t.lg.stepTitles.corbeau} subtitle={t.lg.night(nightNo)} right={quitButton} />
          <div className="content fade-step" key={phaseKey}>
            <Emblem icon={STEP_ICON.corbeau} />
            <p className="step-title">{t.lg.crowTitle}</p>
            <p className="muted">{t.lg.crowNote}</p>
            <AliveList players={players} target={target} onSelect={setTarget} />
          </div>
          <div className="footer-actions">
            <button className="ghost" onClick={() => goToStep(phase.idx + 1)}>
              {t.common.skip}
            </button>
            <button
              className="primary big grow"
              disabled={!target}
              onClick={() => {
                setCrowId(target)
                goToStep(phase.idx + 1)
              }}
            >
              {t.lg.crowCaw}
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
        <TopBar title={t.lg.stepTitles.sorciere} subtitle={t.lg.night(nightNo)} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <Emblem icon={STEP_ICON.sorciere} />
          <p className="step-title">{t.lg.witchTitle}</p>
          <div className="card">
            <h3>{t.lg.witchVictim}</h3>
            <p className="big-name">{victim ? victim.name : t.common.noOne}</p>
            {victimSurvives && <p className="muted center-text">{t.lg.witchAlreadySaved}</p>}
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
              {t.lg.witchHeal} {healUsed ? t.lg.used : witchSaved ? t.lg.applied : ''}
            </button>
            <button
              className="block"
              disabled={poisonUsed}
              onClick={() => {
                setTarget(null)
                setPhase({ name: 'sorciere-kill', idx: phase.idx })
              }}
            >
              {t.lg.witchPoison} {poisonUsed ? t.lg.used : witchKillId ? `→ ${byId(witchKillId)?.name}` : ''}
            </button>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={() => goToStep(phase.idx + 1)}>
            {t.lg.witchEndNight}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'voleur-cards') {
    const thief = players.find((p) => p.role === 'voleur')!
    const mustSwap = thiefCards.length === 2 && thiefCards.every((r) => ROLES[r].camp === 'loups')

    function takeCard(role: RoleId) {
      setPlayers((list) => list.map((p) => (p.playerId === thief.playerId ? withRole(p, role) : p)))
      goToStep(phase.name === 'voleur-cards' ? phase.idx + 1 : 0)
    }

    return (
      <div className="app night">
        <TopBar title={t.lg.thiefCards} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{thief.name}</p>
          <div className="list">
            {thiefCards.map((r, i) => (
              <button key={i} className="item" onClick={() => takeCard(r)}>
                <span className="grow">
                  {t.roles[r].label}
                  <br />
                  <span className="muted">{t.roles[r].description}</span>
                </span>
                <span className="badge accent">{t.lg.thiefTake}</span>
              </button>
            ))}
          </div>
          {mustSwap && (
            <p className="error center-text">{t.lg.thiefMustSwap}</p>
          )}
        </div>
        <div className="footer-actions">
          <button className="primary big block" disabled={mustSwap} onClick={() => goToStep(phase.idx + 1)}>
            {t.lg.thiefKeep}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'comedien-cards') {
    const actor = players.find((p) => p.role === 'comedien')!

    function playCard(role: RoleId) {
      setActorCards((cur) => cur.filter((r) => r !== role))
      const inserted = ACTOR_STEPS[role]
      if (!inserted) {
        // Carte passive : le Chasseur lui offre simplement un tir pour la suite de la partie.
        setPlayers((list) => list.map((p) => (p.playerId === actor.playerId ? { ...p, canShoot: true } : p)))
        goToStep(phase.name === 'comedien-cards' ? phase.idx + 1 : 0)
        return
      }
      const idx = phase.name === 'comedien-cards' ? phase.idx : 0
      setSteps((cur) => {
        const next = [...cur]
        next.splice(idx + 1, 0, inserted)
        return next
      })
      setTarget(null)
      setPhase({ name: 'step', idx: idx + 1 })
    }

    return (
      <div className="app night">
        <TopBar title={t.lg.actorCardsTitle} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{actor.name}</p>
          <div className="list">
            {actorCards.map((r) => (
              <button key={r} className="item" onClick={() => playCard(r)}>
                <span className="grow">
                  {t.roles[r].label}
                  <br />
                  <span className="muted">{t.roles[r].description}</span>
                </span>
                <span className="badge accent">{t.lg.actorPlay}</span>
              </button>
            ))}
          </div>
          <p className="muted center-text">{t.lg.actorDiscardNote}</p>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={() => goToStep(phase.idx + 1)}>
            {t.lg.actorSkip}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'voyante-reveal') {
    const seen = byId(phase.targetId)!
    return (
      <div className="app night">
        <TopBar title={t.lg.seerVision} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{seen.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{t.roles[seen.role].label}</div>
              <div className="muted">{campOf(seen) === 'loups' ? t.lg.campWolves : t.lg.campVillage}</div>
            </div>
          </div>
          <button className="primary big block" onClick={() => goToStep(phase.idx + 1)}>
            {t.lg.seerCloses}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'renard-reveal') {
    const group = foxGroup(players, phase.targetId)
    return (
      <div className="app night">
        <TopBar title={t.lg.foxResultTitle} />
        <div className="content fade-step" key={phaseKey}>
          <div className="row wrap chips center">
            {group.map((p) => (
              <span key={p.playerId} className="badge accent">
                {p.name}
              </span>
            ))}
          </div>
          <div className="reveal">
            <div>
              <div className="role">{phase.found ? t.lg.foxFound : t.lg.foxNotFound}</div>
              <div className="muted">{phase.found ? t.lg.foxFoundNote : t.lg.foxNotFoundNote}</div>
            </div>
          </div>
          <button className="primary big block" onClick={() => goToStep(phase.idx + 1)}>
            {t.lg.foxCloses}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'singe-pick') {
    const singe = players.find((p) => p.role === 'singe')!
    const remaining = players.filter(
      (p) => p.alive && p.playerId !== singe.playerId && !phase.seen.includes(p.playerId),
    )
    return (
      <div className="app night">
        <TopBar title={t.lg.monkeyCardsTitle} subtitle={t.common.cardsSeen(phase.seen.length)} />
        <div className="content fade-step" key={phaseKey}>
          <p className="step-title">{t.lg.monkeyWhich}</p>
          {remaining.length === 0 ? (
            <p className="muted center-text">{t.lg.monkeyAllSeen}</p>
          ) : (
            <AliveList players={players} target={target} onSelect={setTarget} disabledIds={[singe.playerId, ...phase.seen]} />
          )}
        </div>
        <div className="footer-actions">
          <button
            className="ghost"
            onClick={() => {
              setTarget(null)
              goToStep(phase.idx + 1)
            }}
          >
            {t.lg.monkeyStop}
          </button>
          <button
            className="primary big grow"
            disabled={!target}
            onClick={() => setPhase({ name: 'singe-reveal', idx: phase.idx, seen: phase.seen, targetId: target! })}
          >
            {t.lg.monkeyFlip}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'singe-reveal') {
    const flipped = byId(phase.targetId)!
    const caught = campOf(flipped) === 'loups'
    const seen = [...phase.seen, phase.targetId]
    return (
      <div className="app night">
        <TopBar title={t.lg.monkeyFlipped} subtitle={t.common.cards(seen.length)} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{flipped.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{t.roles[flipped.role].label}</div>
              <div className="muted">{caught ? t.lg.monkeyCaught : t.lg.campVillage}</div>
            </div>
          </div>
          {caught ? (
            <>
              <p className="muted center-text">{t.lg.monkeyDies}</p>
              <button
                className="primary big block"
                onClick={() => {
                  const singe = players.find((p) => p.role === 'singe')!
                  setSingeDeadId(singe.playerId)
                  setTarget(null)
                  goToStep(phase.idx + 1, { singe: singe.playerId })
                }}
              >
                {t.lg.monkeyCloseEyes}
              </button>
            </>
          ) : (
            <div className="stack">
              <button
                className="primary big block"
                onClick={() => {
                  setTarget(null)
                  setPhase({ name: 'singe-pick', idx: phase.idx, seen })
                }}
              >
                {t.lg.monkeyAnother}
              </button>
              <button
                className="block"
                onClick={() => {
                  setTarget(null)
                  goToStep(phase.idx + 1)
                }}
              >
                {t.lg.monkeyStop}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase.name === 'sorciere-kill') {
    return (
      <div className="app night">
        <TopBar title={t.lg.witchPoison} />
        <div className="content fade-step" key={phaseKey}>
          <p className="step-title">{t.lg.witchKillAsk}</p>
          <AliveList players={players} target={target} onSelect={setTarget} />
        </div>
        <div className="footer-actions">
          <button className="ghost" onClick={() => setPhase({ name: 'step', idx: phase.idx })}>
            {t.common.cancel}
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
            {t.lg.witchKill}
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
        <TopBar title={t.lg.loversTitle} subtitle={`${phase.index + 1} / ${lovers.length}`} />
        <div className="content fade-step" key={phaseKey}>
          {!phase.revealed ? (
            <>
              <p className="muted center-text">{t.lg.loversPass}</p>
              <p className="big-name">{current.name}</p>
              <button className="primary big block" onClick={() => setPhase({ ...phase, revealed: true })}>
                {t.lg.loversSee}
              </button>
            </>
          ) : (
            <>
              <div className="reveal">
                <div>
                  <div className="muted">{t.lg.loversYouLove}</div>
                  <div className="word">{other.name}</div>
                  <div className="muted">{t.lg.loversWarning}</div>
                </div>
              </div>
              <button
                className="primary big block"
                onClick={() =>
                  last ? goToStep(phase.resumeIdx) : setPhase({ ...phase, index: phase.index + 1, revealed: false })
                }
              >
                {last ? t.lg.loversContinue : t.common.next}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase.name === 'shielded') {
    const p = byId(phase.playerId)!
    const puppet = p.role === 'marionnettiste'
    return (
      <div className="app day">
        <TopBar title={t.lg.dawnOf(nightNo)} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <div className="card">
            <h2>{puppet ? t.lg.puppetFalls : t.lg.elderHolds}</h2>
            <p className="muted">{puppet ? t.lg.puppetLead(p.name) : t.lg.elderLead(p.name)}</p>
            <p className="muted">{puppet ? t.lg.puppetNote(p.name) : t.lg.elderNote(p.name)}</p>
          </div>
        </div>
        <div className="footer-actions">
          <button className="primary big block" onClick={() => resolveDeaths(players, phase.pending, 'dawn', 'day')}>
            {t.common.continue}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'colosse') {
    const colosse = byId(phase.playerId)!
    const wolves = players.filter((p) => p.alive && isWolf(p))
    if (!phase.revealed) {
      return (
        <div className="app night">
          <TopBar title={t.lg.colossusWakes} />
          <div className="content fade-step" key={phaseKey}>
            <p className="muted center-text">{t.lg.colossusIntro}</p>
            <p className="big-name">{colosse.name}</p>
            <div className="reveal">
              <span className="muted">{t.lg.colossusHint}</span>
            </div>
            <button className="primary big block" onClick={() => setPhase({ ...phase, revealed: true })}>
              {t.lg.colossusDiscover}
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="app night">
        <TopBar title={t.lg.colossusStrikes} subtitle={t.lg.colossusSub} />
        <div className="content fade-step" key={phaseKey}>
          <Emblem icon="💥" />
          <p className="step-title">{t.lg.colossusAsk}</p>
          <div className="list">
            {wolves.map((p) => (
              <button
                key={p.playerId}
                className={`item${target === p.playerId ? ' selected' : ''}`}
                onClick={() => setTarget(p.playerId)}
              >
                <span className="grow">{p.name}</span>
                <span className="badge danger">{t.lg.badges.wolf}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="footer-actions">
          <button
            className="primary big block"
            disabled={!target}
            onClick={() => resolveDeaths(players, [...phase.pending, target!], 'dawn', 'day')}
          >
            {t.lg.colossusTake}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'servante') {
    const servante = players.find((p) => p.alive && p.role === 'servante')!
    const dead = phase.ids.map((id) => byId(id)!).filter((p) => p && p.playerId !== servante.playerId)

    function take(deadId: ID) {
      const taken = byId(deadId)!
      setPlayers((list) => list.map((p) => (p.playerId === servante.playerId ? withRole(p, taken.role) : p)))
      setHiddenRoles((cur) => [...cur, deadId])
      setServanteUsed(true)
      if (phase.name === 'servante') {
        setPhase({ name: 'servante-reveal', ids: phase.ids, context: phase.context, next: phase.next, role: taken.role })
      }
    }

    return (
      <div className="app night">
        <TopBar title={t.lg.maidTitle} />
        <div className="content fade-step" key={phaseKey}>
          <Emblem icon="🕯️" />
          <p className="muted center-text">{t.lg.maidPass}</p>
          <p className="big-name">{servante.name}</p>
          <p className="muted center-text">{t.lg.maidNote}</p>
          <div className="list">
            {dead.map((p) => (
              <button key={p.playerId} className="item" onClick={() => take(p.playerId)}>
                <span className="grow">
                  {p.name}
                  <br />
                  <span className="muted">{t.lg.maidTake}</span>
                </span>
                <span className="badge">{t.lg.maidFaceDown}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="footer-actions">
          <button
            className="primary big block"
            onClick={() => setPhase({ name: 'deaths', ids: phase.ids, context: phase.context, next: phase.next })}
          >
            {t.lg.maidStay}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'servante-reveal') {
    const def = t.roles[phase.role]
    return (
      <div className="app night">
        <TopBar title={t.lg.maidInherits} />
        <div className="content fade-step" key={phaseKey}>
          <div className="reveal">
            <div>
              <div className="role">{def.label}</div>
              <div className="muted">{def.description}</div>
              {ROLES[phase.role].camp === 'loups' && (
                <div className="pad-top">
                  <span className="badge danger">{t.lg.maidSwitchesCamp}</span>
                </div>
              )}
            </div>
          </div>
          <button
            className="primary big block"
            onClick={() => setPhase({ name: 'deaths', ids: phase.ids, context: phase.context, next: phase.next })}
          >
            {t.lg.maidCloses}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'deaths') {
    const dead = phase.ids.map((id) => byId(id)!).filter(Boolean)
    const elderBurned = phase.context === 'vote' && dead.some((p) => p.role === 'ancien')
    const title =
      phase.context === 'dawn'
        ? t.lg.dawnOf(nightNo)
        : phase.context === 'vote'
          ? t.lg.verdict
          : t.lg.gunshot
    return (
      <div className={`app ${phase.context === 'dawn' || phase.context === 'vote' ? 'day' : ''}`}>
        <TopBar title={title} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          {dead.length === 0 ? (
            <div className="card">
              <h2>{t.lg.nobodyDied}</h2>
              <p className="muted">{t.lg.villageIntact}</p>
            </div>
          ) : (
            <div className="card">
              <h2>{dead.length > 1 ? t.lg.theyLeaveUs : t.lg.heSheLeavesUs}</h2>
              <div className="list">
                {dead.map((p, i) => (
                  <div key={p.playerId} className="item death-item" style={{ animationDelay: `${i * 140}ms` }}>
                    <span className="grow">{p.name}</span>
                    <span className="badge danger">
                      {hiddenRoles.includes(p.playerId) ? t.lg.cardHidden : t.roles[p.role].label}
                    </span>
                    {p.lover && <span className="badge warn">{t.lg.badges.inLove}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {elderBurned && (
            <div className="card">
              <h3>{t.lg.elderGrudge}</h3>
              <p className="muted">{t.lg.elderGrudgeNote}</p>
            </div>
          )}
        </div>
        <div className="footer-actions">
          <button
            className="primary big block"
            onClick={() => afterDeaths(phase.ids, phase.next, phase.context)}
          >
            {t.common.continue}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'hunter') {
    const hunter = byId(phase.playerId)!
    return (
      <div className="app">
        <TopBar title={t.lg.hunterTitle} />
        <div className="content fade-step" key={phaseKey}>
          <p className="step-title">{t.lg.hunterCould(hunter.name)}</p>
          <p className="muted">{t.lg.hunterNote}</p>
          <AliveList players={players} target={target} onSelect={setTarget} />
        </div>
        <div className="footer-actions">
          <button className="primary big block" disabled={!target} onClick={() => hunterShoot(phase.next)}>
            {t.lg.hunterShoot}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'idiot') {
    const idiot = byId(phase.playerId)!
    return (
      <div className="app day">
        <TopBar title={t.lg.verdict} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <p className="big-name">{idiot.name}</p>
          <div className="reveal">
            <div>
              <div className="role">{t.lg.idiotTitle}</div>
              <div className="muted">{t.lg.idiotNote}</div>
            </div>
          </div>
          <button className="primary big block" onClick={() => afterVote(players)}>
            {t.common.continue}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'bouc') {
    const bouc = byId(phase.playerId)!
    const toggle = (id: ID) => setSelection((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
    return (
      <div className="app day">
        <TopBar title={t.lg.scapegoatTitle} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <p className="muted center-text">{t.lg.scapegoatIntro(bouc.name)}</p>
          <p className="step-title">{t.lg.scapegoatAsk}</p>
          <div className="list">
            {alive.map((p) => (
              <button
                key={p.playerId}
                className={`item${selection.includes(p.playerId) ? ' selected' : ''}`}
                onClick={() => toggle(p.playerId)}
              >
                <span className="grow">{p.name}</span>
                <span className={`badge${selection.includes(p.playerId) ? ' warn' : ''}`}>
                  {selection.includes(p.playerId) ? t.lg.scapegoatBanned : t.lg.scapegoatVotes}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="footer-actions">
          <button
            className="primary big block"
            onClick={() => {
              setBanned({ day: nightNo + 1, ids: selection })
              setSelection([])
              afterVote(players)
            }}
          >
            {t.common.validate}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'judge') {
    return (
      <div className="app day">
        <TopBar title={t.lg.judgeTitle} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <Emblem icon="⚖️" />
          <p className="step-title">{t.lg.judgeAsk}</p>
          <p className="muted">{t.lg.judgeNote}</p>
        </div>
        <div className="footer-actions">
          <button className="ghost" onClick={() => startNight(players)}>
            {t.lg.judgeNightFalls}
          </button>
          <button
            className="primary big grow"
            onClick={() => {
              setJudgeUsed(true)
              setTarget(null)
              setPhase({ name: 'day' })
            }}
          >
            {t.lg.judgeSecondVote}
          </button>
        </div>
      </div>
    )
  }

  if (phase.name === 'day') {
    const crow = byId(crowId)
    const noVoteToday = banned.day === nightNo ? banned.ids : []
    const bouc = players.find((p) => p.alive && p.role === 'bouc')
    return (
      <div className="app day">
        <TopBar title={t.lg.day(nightNo)} subtitle={t.common.survivors(alive.length)} right={quitButton} />
        <div className="content fade-step" key={phaseKey}>
          <div className="card">
            <h2>{t.lg.debateAndVote}</h2>
            <p className="muted">{t.lg.debateNote}</p>
            {crow && <p className="muted">🐦‍⬛ {t.lg.crowDesignated(crow.name)}</p>}
            {noVoteToday.length > 0 && (
              <p className="muted">{t.lg.bannedToday(noVoteToday.map((id) => byId(id)?.name).join(', '))}</p>
            )}
          </div>
          {debateMinutes > 0 && <DebateTimer key={`debat-${nightNo}-${judgeUsed}`} minutes={debateMinutes} />}
          <AliveList players={players} target={target} onSelect={setTarget}
            extra={(p) => (
              <>
                {p.playerId === crowId && <span className="badge danger">{t.lg.badges.extraVotes}</span>}
                {noVoteToday.includes(p.playerId) && <span className="badge warn">{t.lg.badges.cannotVote}</span>}
              </>
            )}
          />
        </div>
        <div className="footer-actions">
          <button className="ghost" onClick={() => voteOut(null)}>
            {t.common.nobody}
          </button>
          {bouc && (
            <button className="ghost" onClick={voteTie}>
              {t.lg.tie}
            </button>
          )}
          <button
            className="primary big grow"
            disabled={!target}
            onClick={() => {
              haptic([18, 40, 18])
              voteOut(target)
            }}
          >
            {t.lg.eliminate}
          </button>
        </div>
      </div>
    )
  }

  // result
  const scoring = session.scoring.loupgarou
  const winnerLabel =
    phase.winner === 'village'
      ? t.lg.winners.village
      : phase.winner === 'loups'
        ? t.lg.winners.loups
        : phase.winner === 'solitaire'
          ? t.lg.winners.solitaire
          : t.lg.winners.amoureux
  return (
    <div className="app">
      <TopBar title={t.result.title} />
      <div className="content fade-step" key={phaseKey}>
        <div className="card victory">
          <span className="trophy">🏆</span>
          <h2>{t.result.victory(winnerLabel)}</h2>
          <p className="muted">{phase.reason}</p>
        </div>
        <div className="card">
          <h3>{t.result.points}</h3>
          <div className="list">
            {players.map((p) => {
              const won =
                phase.winner === 'amoureux'
                  ? p.lover
                  : phase.winner === 'solitaire'
                    ? p.role === 'loupblanc'
                    : campOf(p) === phase.winner
              const pts = won ? (scoring[phase.winner] ?? 0) : 0
              return (
                <div key={p.playerId} className="item">
                  <span className="grow">{p.name}</span>
                  <span className="badge">{t.roles[p.role].label}</span>
                  {p.wolf && <span className="badge danger">{t.lg.badges.turned}</span>}
                  <span className={`badge ${won ? 'success' : ''}`}>+{pts}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="footer-actions">
        <button className="ghost" onClick={onQuit}>
          {t.common.ignore}
        </button>
        <button className="primary big grow" onClick={() => save(phase.winner, phase.reason)}>
          {t.result.save}
        </button>
      </div>
    </div>
  )
}
