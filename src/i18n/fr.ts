import type { RoleId } from '../games/loupgarou/roles'

/** Pluriel français : « 1 joueur », « 3 joueurs ». */
function p(n: number, one: string, many = one + 's'): string {
  return `${n} ${n > 1 ? many : one}`
}

export const fr = {
  intl: 'fr-FR',
  label: 'Français',

  common: {
    back: 'Retour',
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    continue: 'Continuer',
    next: 'Suivant',
    validate: 'Valider',
    skip: 'Passer',
    settings: 'Réglages',
    delete: 'Supprimer',
    add: 'Ajouter',
    plus: 'Plus',
    minus: 'Moins',
    ignore: 'Ignorer',
    nobody: 'Personne',
    noOne: 'personne',
    dash: '—',
    players: (n: number) => p(n, 'joueur'),
    rounds: (n: number) => p(n, 'partie'),
    points: (n: number) => p(n, 'pt'),
    wins: (n: number) => p(n, 'victoire'),
    survivors: (n: number) => p(n, 'survivant'),
    nights: (n: number) => p(n, 'nuit'),
    cards: (n: number) => p(n, 'carte'),
    cardsSeen: (n: number) => p(n, 'carte consultée', 'cartes consultées'),
    eliminated: (n: number) => p(n, 'éliminé'),
    detailOf: (label: string) => `Détail : ${label}`,
    renamePlayer: (name: string) => `Renommer ${name}`,
    removePlayer: (name: string) => `Retirer ${name}`,
  },

  app: {
    name: 'JeuCommu',
    tagline: 'Jeux d’ambiance hors ligne',
    quitRound: 'Quitter la partie en cours ?',
    quit: 'Quitter',
    abandonRound: 'Abandonner la partie en cours ?',
    abandon: 'Abandonner',
  },

  menu: {
    pickGame: 'Choisis un jeu',
    morePlanned: 'D’autres jeux arriveront ici.',
    resume: 'Reprendre une session',
    playersRange: (min: number, max: number) => `${min}–${max} joueurs`,
    deleteSession: (name: string) => `Supprimer la session « ${name} » et son classement ?`,
  },

  prefs: {
    title: 'Préférences',
    subtitle: 'Langue et apparence',
    language: 'Langue',
    appearance: 'Apparence',
    system: 'Système',
    light: 'Clair',
    dark: 'Sombre',
    note: 'Le thème « Système » suit le réglage clair/sombre de ton téléphone.',
  },

  setup: {
    steps: ['Jeu', 'Joueurs', 'Réglages'],
    who: 'Qui joue ?',
    sessionName: 'Nom de la session',
    defaultName: (game: string, date: string) => `${game} du ${date}`,
    playersCount: (n: number, max: number) => `Joueurs (${n}/${max})`,
    missing: (n: number) => `Encore ${n} joueur${n > 1 ? 's' : ''}`,
    toConfig: 'Réglages de la partie',
    launch: 'Lancer la session',
    configSubtitle: (n: number) => `${n} joueurs · réglages`,
    inPreparation: 'Session en préparation',
    firstName: 'Prénom',
    addPlayers: 'Ajoute les joueurs de la soirée.',
    maxReached: (max: number) => `Maximum atteint : ${max} joueurs.`,
    newName: 'Nouveau prénom',
  },

  session: {
    notFound: 'Session introuvable',
    tabs: { round: 'Partie', ranking: 'Classement', history: 'Historique' },
    where: 'Où en est la soirée',
    roundsPlayed: 'Parties jouées',
    leading: 'En tête',
    lastRound: (date: string) => `Dernière partie · ${date}`,
    ranking: 'Classement de la session',
    rankingEmpty: 'Ajoute des joueurs et lance une partie.',
    history: 'Parties jouées',
    historyEmpty: 'Aucune partie enregistrée.',
    deleteRound: 'Supprimer cette partie ? Les points correspondants seront retirés du classement.',
    launchFirst: 'Lancer la première partie',
    launch: 'Lancer une partie',
    record: (wins: number, played: number) => `${p(wins, 'victoire')} / ${p(played, 'partie')}`,
  },

  settings: {
    title: 'Réglages',
    sessionName: 'Nom de la session',
    playersCount: (n: number) => `Joueurs (${n})`,
    playersNote: 'Les changements s’appliquent à la prochaine partie.',
    removeNote: (name: string) => `Retirer ${name} ? Ses parties déjà jouées restent au classement.`,
    dangerZone: 'Zone rouge',
    deleteSession: 'Supprimer la session',
    deleteSessionAsk: (name: string) => `Supprimer « ${name} » et tout son classement ?`,
  },

  scoring: {
    perWin: 'Points par victoire',
    short: 'Points',
    heading: (label: string, game: string) => `${label} — ${game}`,
    note: 'Les points sont figés au moment où une partie est enregistrée : modifier le barème n’altère pas l’historique.',
  },

  suggestion: {
    title: (n: number) => `Conseillé à ${n} joueurs`,
    applied: '✓ C’est exactement ta composition actuelle.',
    apply: 'Appliquer cette composition',
    note: 'Un repère pour équilibrer la partie, rien de plus : compose comme tu veux, l’app ne t’impose rien.',
  },

  camps: {
    civils: 'Civils',
    undercover: 'Undercover',
    mrwhite: 'Mr White',
    village: 'Village',
    loups: 'Loups-Garous',
    amoureux: 'Amoureux',
    solitaire: 'Loup-Garou Blanc',
  },

  timer: {
    running: 'Débat en cours',
    over: 'Temps écoulé — au vote !',
    pause: 'Pause',
    resume: 'Reprendre',
    addMinute: '+1 min',
    restart: 'Relancer',
  },

  games: {
    undercover: {
      name: 'Undercover',
      tagline: 'Un mot pour les civils, un autre pour l’infiltré. Décris sans te faire démasquer.',
      highlights: ['Distribution des mots en privé', 'Vote et élimination', 'Mr White peut voler la victoire'],
      civilians: (n: number) => p(n, 'civil'),
      undercovers: (n: number) => p(n, 'undercover', 'undercover'),
      mrWhites: (n: number) => p(n, 'Mr White', 'Mr White'),
      composition: 'Composition',
      undercoverTip:
        'Il reçoit un mot voisin de celui des civils, sans savoir qu’il est l’infiltré au premier coup d’œil. Il doit décrire son mot assez juste pour passer inaperçu. Les infiltrés gagnent dès qu’ils sont aussi nombreux que les civils.',
      mrWhiteTip:
        'Aucun mot : il bluffe uniquement à partir de ce qu’il entend. S’il est éliminé, l’app lui offre une dernière chance de deviner le mot des civils — réussi, il vole la victoire à lui tout seul.',
      compositionNote: (civils: string) => `${civils} · Mr White ne reçoit aucun mot et doit bluffer.`,
      errMinPlayers: 'Il faut au moins 3 joueurs.',
      errMinUndercover: 'Il faut au moins 1 undercover.',
      errTooMany: (max: number, count: number) => `Trop d’infiltrés : ${max} maximum pour ${count} joueurs.`,
    },
    loupgarou: {
      name: 'Loup-Garou',
      tagline: 'Nuits, pouvoirs et votes : le village contre la meute, guidé par l’app.',
      highlights: ['Narrateur guidé étape par étape', '24 rôles au choix', 'Morts et victoires calculées'],
      wolves: (n: number) => p(n, 'loup'),
      villagers: (n: number) => p(n, 'villageois', 'villageois'),
      debateMinutes: (n: number) => `débat ${n} min`,
      freeDebate: 'débat libre',
      pack: 'La meute',
      wolvesLabel: 'Loups-Garous',
      debate: 'Débat du jour',
      timerLabel: 'Minuteur',
      timerOn: (n: number) => `${n} min de débat avant le vote — le minuteur démarre tout seul au lever du jour.`,
      timerOff: 'Aucun minuteur : le village débat aussi longtemps qu’il veut.',
      specialRoles: 'Rôles spéciaux',
      included: 'Inclus',
      tally: (villagers: number, total: number, count: number) =>
        `Simples villageois : ${villagers} · Total ${total}/${count}`,
      errMinPlayers: 'Il faut au moins 4 joueurs.',
      errMinWolves: 'Il faut au moins 1 loup-garou.',
      errTooManySpecials: 'Trop de rôles spéciaux pour le nombre de joueurs.',
      errWolfMajority: 'Trop de loups : le village doit être majoritaire.',
    },
  },

  uc: {
    ready: (n: number) => `${p(n, 'joueur')} · prêt ?`,
    settingsHint: 'Modifiable à tout moment depuis l’engrenage.',
    words: 'Les mots',
    wordsHidden: 'Cachés — celui qui lance la partie ne doit pas les connaître.',
    wordsNote: 'Chaque joueur découvrira le sien pendant la distribution, à l’abri des regards.',
    redraw: 'Tirer une autre paire, sans la voir',
    deal: 'Distribuer les mots',
    dealing: 'Distribution',
    passTo: 'Passe le téléphone à',
    noPeeking: 'Personne d’autre ne doit regarder l’écran.',
    seeMyWord: 'Voir mon mot',
    myWord: 'Ton mot',
    noWord: 'Tu n’as pas de mot : écoute et bluffe.',
    everyoneSaw: 'Tout le monde a vu',
    turn: (n: number) => `Tour ${n}`,
    turnSub: (n: number) => `${p(n, 'joueur')} en vie · mêmes mots`,
    aliveBadge: (n: number) => `${p(n, 'joueur')} en vie`,
    starter: (name: string) => `${name} commence, puis on tourne. Un mot par joueur, sans dire son mot.`,
    voteTitle: 'Vote : qui est éliminé ?',
    eliminate: 'Éliminer',
    elimination: 'Élimination',
    turnDone: (n: number) => `Tour ${n} terminé`,
    hisWord: (w: string) => `Son mot : ${w}`,
    noWordShort: 'Aucun mot',
    nextMrWhite: 'Dernière chance de Mr White',
    seeResult: 'Voir le résultat',
    startTurn: (n: number) => `Lancer le tour ${n}`,
    lastChance: 'Dernière chance',
    lastChanceSub: 'Mr White devine le mot',
    guessAsk: 'Quel est le mot des civils ?',
    guessPlaceholder: 'Ta proposition',
    narratorDecides: 'Le narrateur peut aussi trancher directement :',
    wasRight: 'C’était juste',
    wasWrong: 'C’était faux',
    roles: { civil: 'Civil', undercover: 'Undercover', mrwhite: 'Mr White' },
    winners: { civils: 'les Civils', undercover: 'les Undercover', mrwhite: 'Mr White' },
    reasonAllFound: 'Tous les infiltrés ont été démasqués.',
    reasonParity: 'Les infiltrés sont aussi nombreux que les civils.',
    reasonGuessed: (word: string) => `Mr White a deviné le mot : ${word}.`,
    civilWord: (w: string) => `Civils : ${w}`,
    undercoverWord: (w: string) => `Undercover : ${w}`,
  },

  lg: {
    ready: (n: number) => `${p(n, 'joueur')} · prêt ?`,
    villageTonight: 'Le village ce soir',
    settingsHint: 'Modifiable à tout moment depuis l’engrenage.',
    thiefNote:
      'Voleur en jeu : deux cartes de ce paquet resteront au milieu, la composition réelle peut donc être un peu plus légère.',
    rolesInPlay: 'Rôles en jeu',
    dealRoles: 'Distribuer les rôles',
    dealing: 'Distribution',
    passTo: 'Passe le téléphone à',
    noPeeking: 'Personne d’autre ne doit regarder l’écran.',
    seeMyRole: 'Voir mon rôle',
    yourPack: (names: string) => `Ta meute : ${names}`,
    showCard: 'Montre ta carte à toute la table',
    dogAsk: 'Choisis ton camp maintenant, sans rien dire.',
    dogStay: 'Rester au village',
    dogJoin: 'Rejoindre la meute',
    startNight: 'Commencer la nuit',
    night: (n: number) => `Nuit ${n}`,
    villageSleeps: 'Le village s’endort',
    narratorIntro: 'Narrateur : demande à tout le monde de fermer les yeux, puis suis les étapes une par une.',
    powersLost: 'La rancune de l’Ancien a éteint tous les pouvoirs du village : seuls les loups se réveillent.',
    stillAlive: (n: number) => `Encore en vie (${n})`,
    beginNight: 'Démarrer la nuit',

    stepTitles: {
      voleur: 'Le Voleur',
      cupidon: 'Cupidon',
      sauvage: 'L’Enfant Sauvage',
      'sauvage-turn': 'L’Enfant Sauvage',
      salvateur: 'Salvateur',
      voyante: 'Voyante',
      renard: 'Le Renard',
      comedien: 'Le Comédien',
      singe: 'Le Singe Savant',
      loups: 'Les Loups-Garous',
      loupblanc: 'Le Loup-Garou Blanc',
      sorciere: 'La Sorcière',
      corbeau: 'Le Corbeau',
    },

    thiefOpens: 'Le Voleur ouvre les yeux',
    thiefIntro: 'Passe-lui le téléphone : il découvre les deux cartes du milieu et décide s’il échange la sienne.',
    thiefSeeCards: 'Voir les deux cartes',
    thiefCards: 'Les cartes du milieu',
    thiefTake: 'Prendre',
    thiefMustSwap: 'Les deux cartes sont des loups : le Voleur est obligé d’en prendre une.',
    thiefKeep: 'Garder ma carte',

    cupidTitle: 'Cupidon désigne les deux amoureux',
    cupidNote: 'Il peut se choisir lui-même. Si l’un meurt, l’autre meurt aussitôt.',
    cupidValidate: 'Valider le couple',

    childTitle: 'L’Enfant Sauvage choisit son modèle',
    childNote: 'Tant que son modèle vit, il reste villageois. S’il meurt, l’enfant rejoint la meute.',
    childPick: 'Prendre pour modèle',
    childWake: 'Réveille discrètement',
    childTurned: 'Ton modèle est mort',
    childTurnedNote: 'Tu rejoins la meute — tu gagnes désormais avec les loups.',
    childCloses: 'Il referme les yeux',

    guardTitle: 'Le Salvateur protège un joueur',
    guardForbidden: (name: string) => `Interdit cette nuit : ${name} (protégé la nuit dernière).`,
    guardProtect: 'Protéger',

    seerTitle: 'La Voyante sonde un joueur',
    seerNote: 'Passe-lui le téléphone : elle choisit, découvre le rôle, puis rend l’appareil.',
    seerReveal: 'Révéler le rôle',
    seerVision: 'Vision',
    campWolves: 'Camp des loups',
    campVillage: 'Camp du village',
    seerCloses: 'La Voyante referme les yeux',

    foxTitle: 'Le Renard flaire un groupe',
    foxNote: 'Il désigne un joueur : l’app examine ce joueur et ses deux voisins vivants, dans l’ordre de la table.',
    foxSniff: 'Flairer',
    foxResultTitle: 'Le flair du Renard',
    foxFound: 'Il y a un loup',
    foxNotFound: 'Aucun loup',
    foxFoundNote: 'Le Renard ne sait pas lequel — il garde son flair pour les nuits suivantes.',
    foxNotFoundNote: 'Les trois sont innocents : le Renard perd définitivement son pouvoir.',
    foxCloses: 'Le Renard referme les yeux',

    actorTitle: 'Le Comédien entre en scène',
    actorNote: (cards: string) => `Il lui reste ${cards}. Il en joue une cette nuit, ou garde tout pour plus tard.`,
    actorSeeCards: 'Voir ses cartes',
    actorCardsTitle: 'Les cartes du Comédien',
    actorPlay: 'Jouer',
    actorDiscardNote: 'La carte jouée est ensuite écartée définitivement.',
    actorSkip: 'Finalement, il passe',

    monkeyTitle: 'Le Singe Savant ouvre les yeux',
    monkeyNote:
      'Passe-lui le téléphone : il retourne les cartes une par une et s’arrête quand il le souhaite. S’il tombe sur un Loup-Garou, sa curiosité lui coûte la vie.',
    monkeyOnce: 'Une seule fois dans la partie',
    monkeyOnceNote: 'S’il passe son tour, il pourra encore utiliser son pouvoir lors d’une nuit suivante.',
    monkeyConsult: 'Consulter des cartes',
    monkeyCardsTitle: 'Cartes du village',
    monkeyWhich: 'Quelle carte retourner ?',
    monkeyAllSeen: 'Toutes les cartes ont été consultées.',
    monkeyStop: 'S’arrêter là',
    monkeyFlip: 'Retourner la carte',
    monkeyFlipped: 'Carte retournée',
    monkeyCaught: 'Un Loup-Garou !',
    monkeyDies: 'La curiosité du Singe Savant lui coûte la vie. Sa mort sera annoncée à l’aube.',
    monkeyCloseEyes: 'Refermer les yeux',
    monkeyAnother: 'Retourner une autre carte',

    wolvesTitle: 'Les loups choisissent leur victime',
    wolvesAwake: (names: string) => `Meute réveillée : ${names}`,
    noWolfAlive: 'aucun loup en vie',
    devour: 'Dévorer',

    whiteTitle: 'Le Loup-Garou Blanc se réveille seul',
    whiteNote: 'Une nuit sur deux, il peut dévorer un membre de sa propre meute.',
    whiteNoPrey: 'Aucun autre loup en vie.',

    crowTitle: 'Le Corbeau désigne sa cible',
    crowNote: 'Elle commencera la journée avec deux voix contre elle.',
    crowCaw: 'Croasser',

    witchTitle: 'La Sorcière ouvre les yeux',
    witchVictim: 'Victime des loups',
    witchAlreadySaved: 'Cette victime est déjà sauvée cette nuit.',
    witchHeal: 'Potion de vie',
    witchPoison: 'Potion de mort',
    used: '(utilisée)',
    applied: '✓ appliquée',
    witchEndNight: 'Terminer la nuit',
    witchKillAsk: 'Qui la Sorcière empoisonne-t-elle ?',
    witchKill: 'Empoisonner',

    loversTitle: 'Les amoureux',
    loversPass: 'Passe discrètement le téléphone à',
    loversSee: 'Voir mon amoureux',
    loversYouLove: 'Tu es amoureux de',
    loversWarning: 'Si l’un de vous meurt, l’autre meurt de chagrin.',
    loversContinue: 'La nuit continue',

    dawnOf: (n: number) => `Aube du jour ${n}`,
    puppetFalls: 'La marionnette tombe',
    elderHolds: 'L’Ancien encaisse',
    puppetLead: (name: string) => `Les loups ont désigné ${name} : c’est sa marionnette qui est éliminée à sa place.`,
    elderLead: (name: string) => `Les loups ont désigné ${name} : sa vieille carcasse survit à cette première morsure.`,
    puppetNote: (name: string) =>
      `${name} reste dans la partie, mais ne peut plus prononcer un seul mot : uniquement des gestes.`,
    elderNote: (name: string) => `${name} reste dans la partie. La prochaine morsure lui sera fatale.`,

    colossusWakes: 'Le Colosse se réveille',
    colossusIntro: 'Les loups ont dévoré le Colosse. Passe-lui le téléphone.',
    colossusHint: 'Il va découvrir ses assaillants et en emporter un.',
    colossusDiscover: 'Découvrir la meute',
    colossusStrikes: 'Le Colosse frappe',
    colossusSub: 'Il en emporte un dans la tombe',
    colossusAsk: 'Quel Loup-Garou emporter ?',
    colossusTake: 'L’emporter dans la tombe',

    maidTitle: 'La Servante Dévouée',
    maidPass: 'Avant toute révélation, passe le téléphone à',
    maidNote:
      'Elle peut prendre la place d’un éliminé sans voir sa carte : elle en hérite, et le rôle du mort ne sera jamais montré à la table. Une seule fois dans la partie.',
    maidTake: 'Prendre sa place, sans savoir ce qu’il était',
    maidFaceDown: 'carte face cachée',
    maidStay: 'Elle reste elle-même',
    maidInherits: 'La Servante hérite',
    maidSwitchesCamp: 'Tu changes de camp : tu joues désormais avec les loups.',
    maidCloses: 'Elle referme la carte',

    verdict: 'Verdict du village',
    gunshot: 'Le coup de feu',
    nobodyDied: 'Personne n’est mort',
    villageIntact: 'Le village se réveille intact.',
    theyLeaveUs: 'Ils nous quittent',
    heSheLeavesUs: 'Il/elle nous quitte',
    cardHidden: 'carte non révélée',
    elderGrudge: 'La rancune de l’Ancien',
    elderGrudgeNote:
      'Le village a brûlé l’Ancien : tous les villageois perdent leurs pouvoirs. Plus aucune étape de nuit du village à partir de maintenant.',

    hunterTitle: 'Dernier souffle',
    hunterCould: (name: string) => `${name} pouvait tirer`,
    hunterNote: 'Il emporte un joueur de son choix dans la tombe.',
    hunterShoot: 'Tirer',

    idiotTitle: 'L’Idiot du Village',
    idiotNote:
      'On ne pend pas un innocent pareil : il est épargné, mais il perd son droit de vote pour le reste de la partie.',

    scapegoatTitle: 'Le Bouc Émissaire',
    scapegoatIntro: (name: string) => `Brûlé pour l’égalité, ${name} se venge. Passe-lui le téléphone.`,
    scapegoatAsk: 'Qui sera privé de vote demain ?',
    scapegoatBanned: 'privé de vote',
    scapegoatVotes: 'vote',

    judgeTitle: 'Le Juge Bègue',
    judgeAsk: 'Un second vote ?',
    judgeNote:
      'Le Juge peut exiger un second vote dans la foulée, une seule fois dans la partie. Le village revote immédiatement.',
    judgeNightFalls: 'La nuit tombe',
    judgeSecondVote: 'Second vote',

    day: (n: number) => `Jour ${n}`,
    debateAndVote: 'Débat et vote',
    debateNote: 'Le village débat, puis désigne un joueur à éliminer.',
    crowDesignated: (name: string) => `Le Corbeau a désigné ${name} : il commence avec deux voix contre lui.`,
    bannedToday: (names: string) => `Privés de vote par le Bouc Émissaire : ${names}.`,
    tie: 'Égalité',
    eliminate: 'Éliminer',

    badges: {
      innocent: 'innocent',
      mute: 'muet',
      noVote: 'sans voix',
      dead: 'mort',
      extraVotes: '+2 voix',
      cannotVote: 'ne vote pas',
      wolf: 'Loup-Garou',
      turned: 'rallié',
      inLove: 'amoureux',
    },

    winners: {
      village: 'le Village',
      loups: 'les Loups-Garous',
      solitaire: 'le Loup-Garou Blanc',
      amoureux: 'les Amoureux',
    },
    reasonDecimated: 'Le village entier a été décimé.',
    reasonWhiteLast: 'Le Loup-Garou Blanc est le dernier survivant.',
    reasonLoversLast: 'Les amoureux sont les derniers survivants.',
    reasonWolvesDead: 'Tous les loups-garous ont été éliminés.',
    reasonWolvesParity: 'Les loups sont aussi nombreux que les villageois.',
  },

  result: {
    title: 'Fin de la partie',
    victory: (who: string) => `Victoire : ${who}`,
    points: 'Points',
    save: 'Enregistrer au classement',
  },

  store: { removedPlayer: '(joueur retiré)' },

  roles: {
    loup: {
      label: 'Loup-Garou',
      description: 'Chaque nuit, tu dévores un villageois avec ta meute.',
      details:
        'Chaque nuit, l’app réveille la meute : les loups se reconnaissent dès la distribution et désignent ensemble une victime. Ils gagnent dès qu’ils sont aussi nombreux que le reste du village.',
    },
    villageois: {
      label: 'Villageois',
      description: 'Aucun pouvoir : ton arme, c’est le débat et ton vote.',
      details:
        'Aucun pouvoir de nuit, mais sa voix pèse autant que les autres au vote du jour. C’est le rôle de remplissage : tout joueur sans rôle spécial est villageois.',
    },
    voyante: {
      label: 'Voyante',
      description: 'Chaque nuit, tu découvres le rôle d’un joueur.',
      details:
        'Chaque nuit, l’app lui montre le rôle exact d’un joueur — pas seulement son camp. À elle de distiller l’information sans se faire repérer par la meute.',
    },
    sorciere: {
      label: 'Sorcière',
      description: 'Tu possèdes une potion de vie et une potion de mort, une seule fois chacune.',
      details:
        'L’app lui montre la victime des loups. Potion de vie pour la sauver, potion de mort pour éliminer quelqu’un d’autre : une seule utilisation chacune sur toute la partie.',
    },
    chasseur: {
      label: 'Chasseur',
      description: 'Si tu meurs, tu emportes un joueur de ton choix avec toi.',
      details:
        'À sa mort — morsure, vote ou chagrin d’amour — l’app lui fait aussitôt désigner un joueur qui meurt avec lui. Un seul tir dans la partie.',
    },
    cupidon: {
      label: 'Cupidon',
      description: 'La première nuit, tu désignes deux amoureux. Si l’un meurt, l’autre meurt de chagrin.',
      details:
        'La première nuit seulement. L’app montre ensuite à chaque amoureux, en privé, qui est l’autre. Si l’un meurt, l’autre meurt de chagrin. Un couple loup + village gagne seul s’il reste en dernier.',
    },
    petite_fille: {
      label: 'Petite Fille',
      description: 'Tu peux espionner les loups pendant la nuit, à tes risques et périls.',
      details:
        'Rôle purement oral : elle entrouvre les yeux pendant le tour des loups, à ses risques et périls. L’app ne lui ouvre pas d’étape, c’est au narrateur de la surveiller.',
    },
    salvateur: {
      label: 'Salvateur',
      description: 'Chaque nuit, tu protèges un joueur des loups (jamais le même deux nuits de suite).',
      details:
        'Chaque nuit, il protège un joueur de la morsure. L’app interdit de reprendre le même joueur deux nuits de suite. La protection ne vaut rien contre la potion de mort.',
    },
    marionnettiste: {
      label: 'Marionnettiste',
      description:
        'Tu as une seconde vie : si les loups te dévorent, ta marionnette meurt à ta place. Tu restes en jeu, mais muet.',
      details:
        'Seconde vie contre les loups uniquement : la marionnette meurt à sa place, une seule fois. Il reste en jeu, marqué « muet » dans les listes, et ne communique plus que par gestes. Le poison de la Sorcière le tue normalement.',
    },
    colosse: {
      label: 'Colosse',
      description:
        'Si les loups te dévorent, tu te réveilles, découvres la meute et emportes l’un d’eux dans la tombe.',
      details:
        'Uniquement s’il est dévoré : l’app lui montre la meute et lui fait choisir le loup qu’il emporte. Mort par le vote ou par le poison, il part seul.',
    },
    singe: {
      label: 'Singe Savant',
      description:
        'Une fois par partie, tu consultes autant de cartes que tu veux. Une carte de loup et ta curiosité te tue.',
      details:
        'Une seule fois dans la partie, la nuit de son choix. Il retourne les cartes une par une et s’arrête quand il veut. Sur une carte de loup, il meurt — la mort est annoncée à l’aube.',
    },
    idiot: {
      label: 'Idiot du Village',
      description: 'Si le village te condamne, tu es épargné — mais tu perds ton droit de vote.',
      details:
        'Le premier vote qui le désigne retourne sa carte : il survit, tout le monde sait qui il est, et l’app le marque « sans voix » pour le reste de la partie. Les loups, eux, peuvent toujours le dévorer, et un second vote contre lui l’élimine pour de bon.',
    },
    ancien: {
      label: 'Ancien',
      description:
        'Tu survis à la première morsure des loups. Mais si le village te tue, tous perdent leurs pouvoirs.',
      details:
        'La première attaque des loups ne le tue pas : l’app annonce qu’il a encaissé et il reste en jeu. En revanche, éliminé par le vote du village, sa rancune prive tous les villageois de leurs pouvoirs — l’app supprime alors toutes les étapes de nuit du village. Le poison de la Sorcière et le Loup-Garou Blanc passent outre son bouclier.',
    },
    bouc: {
      label: 'Bouc Émissaire',
      description: 'En cas d’égalité au vote, c’est toi qu’on brûle. Tu choisis alors qui votera le lendemain.',
      details:
        'L’app ajoute un bouton « Égalité » au vote du jour tant qu’il est vivant. En cas d’égalité il meurt à la place de tout le monde, puis désigne les joueurs privés de vote pour la journée suivante — l’app les marque « ne vote pas » le jour venu.',
    },
    chienloup: {
      label: 'Chien-Loup',
      description: 'À la distribution, tu choisis ton camp : simple villageois, ou membre de la meute.',
      details:
        'Au moment où l’app lui montre sa carte, deux boutons : rester au village ou rejoindre la meute. S’il rejoint les loups, il découvre aussitôt ses complices et compte comme loup jusqu’à la fin — pour la victoire comme pour les points.',
    },
    villageois2: {
      label: 'Villageois-Villageois',
      description: 'Ta carte est publique : tout le monde sait que tu es innocent.',
      details:
        'À la distribution, l’app lui demande de montrer sa carte à toute la table. Il porte ensuite le badge « innocent » dans toutes les listes : impossible de le soupçonner, mais il devient une cible évidente.',
    },
    servante: {
      label: 'Servante Dévouée',
      description: 'Avant qu’une carte éliminée ne soit révélée, tu peux prendre sa place et hériter de son rôle.',
      details:
        'À chaque vague de morts, l’app lui propose de prendre la place d’un des éliminés, sans voir sa carte. Elle hérite du rôle et de ses pouvoirs — les potions déjà bues restent bues, mais son tir de Chasseur est intact — et la carte du mort n’est jamais révélée. Une seule fois dans la partie, et si elle hérite d’une carte de loup, elle change de camp.',
    },
    voleur: {
      label: 'Voleur',
      description: 'La première nuit, tu peux échanger ta carte contre l’une des deux cartes du milieu.',
      details:
        'Quand il est en jeu, l’app met deux cartes de côté à la distribution. La première nuit, elle les lui montre : il garde la sienne ou prend l’une des deux. Si les deux cartes du milieu sont des loups, il est obligé d’en prendre une.',
    },
    loupblanc: {
      label: 'Loup-Garou Blanc',
      description:
        'Loup solitaire : tu dévores avec la meute, mais une nuit sur deux tu élimines un loup. Tu gagnes seul.',
      details:
        'Il se réveille avec la meute comme un loup ordinaire, puis l’app le réveille seul chaque nuit paire pour dévorer un loup de son choix (ou passer). Sa victime n’est protégée ni par le Salvateur ni par la Sorcière. Il ne gagne son camp « solitaire » que s’il est le dernier survivant ; si les loups gagnent avant, il gagne avec eux.',
    },
    renard: {
      label: 'Renard',
      description: 'Chaque nuit, tu flaires un joueur et ses deux voisins. Si aucun n’est loup, tu perds ton flair.',
      details:
        'L’app lui montre un groupe de trois joueurs — la cible et ses deux voisins vivants — et répond simplement oui ou non à « y a-t-il un loup ». L’ordre de la table est celui dans lequel les joueurs ont été saisis. Une réponse négative lui coûte définitivement son pouvoir.',
    },
    corbeau: {
      label: 'Corbeau',
      description: 'Chaque nuit, tu désignes un joueur : il commence la journée avec deux voix contre lui.',
      details:
        'L’app affiche le désigné en tête de l’écran du jour et le marque « +2 voix » dans la liste. C’est au narrateur d’en tenir compte au dépouillement — l’app ne compte pas les voix à sa place.',
    },
    sauvage: {
      label: 'Enfant Sauvage',
      description: 'La première nuit, tu choisis un modèle. S’il meurt, tu rejoins la meute.',
      details:
        'L’app lui fait désigner un modèle la première nuit. Tant que le modèle vit, il joue villageois. Dès que le modèle meurt, l’app le réveille en privé la nuit suivante pour lui annoncer sa transformation et lui montrer la meute : il compte alors comme loup pour la victoire et pour les points.',
    },
    juge: {
      label: 'Juge Bègue',
      description: 'Une fois dans la partie, tu peux exiger un second vote dans la foulée du premier.',
      details:
        'Dès que le vote du jour est résolu, l’app lui demande s’il déclenche son second vote. Le village revote aussitôt, avec un nouveau minuteur de débat. Une seule fois dans la partie.',
    },
    comedien: {
      label: 'Comédien',
      description: 'Trois cartes sont posées devant toi : chaque nuit tu en joues une, qui est ensuite écartée.',
      details:
        'À la distribution, l’app tire trois pouvoirs parmi ceux qui ne sont pas déjà en jeu (Voyante, Salvateur, Renard, Corbeau, Chasseur). Chaque nuit il en choisit un, l’app enchaîne aussitôt sur l’étape correspondante, et la carte est écartée. Il peut aussi passer son tour pour les garder.',
    },
  } satisfies Record<RoleId, { label: string; description: string; details: string }>,
}

export type Dict = typeof fr
