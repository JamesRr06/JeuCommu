import type { Dict } from './fr'

/** English plural: "1 player", "3 players". */
function p(n: number, one: string, many = one + 's'): string {
  return `${n} ${n === 1 ? one : many}`
}

export const en: Dict = {
  intl: 'en-GB',
  label: 'English',

  common: {
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    continue: 'Continue',
    next: 'Next',
    validate: 'Confirm',
    skip: 'Skip',
    settings: 'Settings',
    delete: 'Delete',
    add: 'Add',
    plus: 'More',
    minus: 'Fewer',
    ignore: 'Discard',
    nobody: 'Nobody',
    noOne: 'no one',
    dash: '—',
    players: (n: number) => p(n, 'player'),
    rounds: (n: number) => p(n, 'round'),
    points: (n: number) => p(n, 'pt'),
    wins: (n: number) => p(n, 'win'),
    survivors: (n: number) => p(n, 'survivor'),
    nights: (n: number) => p(n, 'night'),
    cards: (n: number) => p(n, 'card'),
    cardsSeen: (n: number) => p(n, 'card seen', 'cards seen'),
    eliminated: (n: number) => `${n} out`,
    detailOf: (label: string) => `Details: ${label}`,
    renamePlayer: (name: string) => `Rename ${name}`,
    removePlayer: (name: string) => `Remove ${name}`,
  },

  app: {
    name: 'JeuCommu',
    tagline: 'Offline party games',
    quitRound: 'Leave the game in progress?',
    quit: 'Leave',
    abandonRound: 'Abandon the game in progress?',
    abandon: 'Abandon',
  },

  menu: {
    pickGame: 'Pick a game',
    morePlanned: 'More games are on the way.',
    resume: 'Resume a session',
    playersRange: (min: number, max: number) => `${min}–${max} players`,
    deleteSession: (name: string) => `Delete the session “${name}” and its standings?`,
  },

  prefs: {
    title: 'Preferences',
    subtitle: 'Language and appearance',
    language: 'Language',
    appearance: 'Appearance',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    note: 'The “System” theme follows your phone’s light/dark setting.',
  },

  setup: {
    steps: ['Game', 'Players', 'Setup'],
    who: 'Who’s playing?',
    sessionName: 'Session name',
    defaultName: (game: string, date: string) => `${game} — ${date}`,
    playersCount: (n: number, max: number) => `Players (${n}/${max})`,
    missing: (n: number) => `${n} more player${n > 1 ? 's' : ''} needed`,
    toConfig: 'Game setup',
    launch: 'Start the session',
    configSubtitle: (n: number) => `${n} players · setup`,
    inPreparation: 'Session being prepared',
    firstName: 'First name',
    addPlayers: 'Add tonight’s players.',
    maxReached: (max: number) => `Maximum reached: ${max} players.`,
    newName: 'New name',
  },

  session: {
    notFound: 'Session not found',
    tabs: { round: 'Game', ranking: 'Standings', history: 'History' },
    where: 'How the night is going',
    roundsPlayed: 'Rounds played',
    leading: 'In the lead',
    lastRound: (date: string) => `Last round · ${date}`,
    ranking: 'Session standings',
    rankingEmpty: 'Add players and start a round.',
    history: 'Rounds played',
    historyEmpty: 'No round recorded yet.',
    deleteRound: 'Delete this round? Its points will be removed from the standings.',
    launchFirst: 'Start the first round',
    launch: 'Start a round',
    record: (wins: number, played: number) => `${p(wins, 'win')} / ${p(played, 'round')}`,
  },

  settings: {
    title: 'Settings',
    sessionName: 'Session name',
    playersCount: (n: number) => `Players (${n})`,
    playersNote: 'Changes apply to the next round.',
    removeNote: (name: string) => `Remove ${name}? Their played rounds stay in the standings.`,
    dangerZone: 'Danger zone',
    deleteSession: 'Delete the session',
    deleteSessionAsk: (name: string) => `Delete “${name}” and all of its standings?`,
  },

  scoring: {
    perWin: 'Points per win',
    short: 'Points',
    heading: (label: string, game: string) => `${label} — ${game}`,
    note: 'Points are locked in when a round is saved: changing the scale never alters the history.',
  },

  suggestion: {
    title: (n: number) => `Suggested for ${n} players`,
    applied: '✓ That’s exactly your current line-up.',
    apply: 'Apply this line-up',
    note: 'Just a guide for a balanced game: build whatever line-up you like, the app never forces one on you.',
  },

  camps: {
    civils: 'Civilians',
    undercover: 'Undercover',
    mrwhite: 'Mr White',
    village: 'Village',
    loups: 'Werewolves',
    amoureux: 'Lovers',
    solitaire: 'White Werewolf',
  },

  timer: {
    running: 'Debate under way',
    over: 'Time’s up — to the vote!',
    pause: 'Pause',
    resume: 'Resume',
    addMinute: '+1 min',
    restart: 'Restart',
  },

  games: {
    undercover: {
      name: 'Undercover',
      tagline: 'One word for the civilians, another for the infiltrator. Describe it without being unmasked.',
      highlights: ['Words dealt in private', 'Vote and elimination', 'Mr White can steal the win'],
      civilians: (n: number) => p(n, 'civilian'),
      undercovers: (n: number) => p(n, 'undercover', 'undercover'),
      mrWhites: (n: number) => p(n, 'Mr White', 'Mr White'),
      composition: 'Line-up',
      undercoverTip:
        'They get a word close to the civilians’ one, without immediately realising they are the infiltrator. They must describe their word accurately enough to blend in. The infiltrators win as soon as they match the civilians in number.',
      mrWhiteTip:
        'No word at all: they bluff purely from what they hear. If eliminated, the app gives them one last chance to guess the civilians’ word — get it right and they steal the win single-handedly.',
      compositionNote: (civils: string) => `${civils} · Mr White gets no word and has to bluff.`,
      errMinPlayers: 'At least 3 players are needed.',
      errMinUndercover: 'At least 1 undercover is needed.',
      errTooMany: (max: number, count: number) => `Too many infiltrators: ${max} maximum for ${count} players.`,
    },
    loupgarou: {
      name: 'Werewolf',
      tagline: 'Nights, powers and votes: the village against the pack, guided by the app.',
      highlights: ['Narrator guided step by step', '24 roles to choose from', 'Deaths and wins worked out for you'],
      wolves: (n: number) => p(n, 'wolf', 'wolves'),
      villagers: (n: number) => p(n, 'villager'),
      debateMinutes: (n: number) => `${n} min debate`,
      freeDebate: 'open debate',
      pack: 'The pack',
      wolvesLabel: 'Werewolves',
      debate: 'Daytime debate',
      timerLabel: 'Timer',
      timerOn: (n: number) => `${n} min of debate before the vote — the timer starts on its own at daybreak.`,
      timerOff: 'No timer: the village debates for as long as it likes.',
      specialRoles: 'Special roles',
      included: 'In',
      tally: (villagers: number, total: number, count: number) =>
        `Plain villagers: ${villagers} · Total ${total}/${count}`,
      errMinPlayers: 'At least 4 players are needed.',
      errMinWolves: 'At least 1 werewolf is needed.',
      errTooManySpecials: 'Too many special roles for this number of players.',
      errWolfMajority: 'Too many wolves: the village must stay in the majority.',
    },
  },

  uc: {
    ready: (n: number) => `${p(n, 'player')} · ready?`,
    settingsHint: 'Can be changed at any time from the gear icon.',
    words: 'The words',
    wordsHidden: 'Hidden — whoever starts the round must not know them.',
    wordsNote: 'Each player will discover their own during the deal, away from prying eyes.',
    redraw: 'Draw another pair, without looking',
    deal: 'Deal the words',
    dealing: 'Dealing',
    passTo: 'Pass the phone to',
    noPeeking: 'Nobody else should look at the screen.',
    seeMyWord: 'See my word',
    myWord: 'Your word',
    noWord: 'You have no word: listen and bluff.',
    everyoneSaw: 'Everyone has seen',
    turn: (n: number) => `Turn ${n}`,
    turnSub: (n: number) => `${p(n, 'player')} alive · same words`,
    aliveBadge: (n: number) => `${p(n, 'player')} alive`,
    starter: (name: string) => `${name} starts, then go round. One word each, never your own word.`,
    voteTitle: 'Vote: who is out?',
    eliminate: 'Eliminate',
    elimination: 'Elimination',
    turnDone: (n: number) => `Turn ${n} over`,
    hisWord: (w: string) => `Their word: ${w}`,
    noWordShort: 'No word',
    nextMrWhite: 'Mr White’s last chance',
    seeResult: 'See the result',
    startTurn: (n: number) => `Start turn ${n}`,
    lastChance: 'Last chance',
    lastChanceSub: 'Mr White guesses the word',
    guessAsk: 'What is the civilians’ word?',
    guessPlaceholder: 'Your guess',
    narratorDecides: 'The narrator can also decide directly:',
    wasRight: 'That was right',
    wasWrong: 'That was wrong',
    roles: { civil: 'Civilian', undercover: 'Undercover', mrwhite: 'Mr White' },
    winners: { civils: 'the Civilians', undercover: 'the Undercover', mrwhite: 'Mr White' },
    reasonAllFound: 'Every infiltrator has been unmasked.',
    reasonParity: 'The infiltrators now match the civilians in number.',
    reasonGuessed: (word: string) => `Mr White guessed the word: ${word}.`,
    civilWord: (w: string) => `Civilians: ${w}`,
    undercoverWord: (w: string) => `Undercover: ${w}`,
  },

  lg: {
    ready: (n: number) => `${p(n, 'player')} · ready?`,
    villageTonight: 'The village tonight',
    settingsHint: 'Can be changed at any time from the gear icon.',
    thiefNote:
      'Thief in play: two cards from this deck stay in the middle, so the real line-up may end up slightly lighter.',
    rolesInPlay: 'Roles in play',
    dealRoles: 'Deal the roles',
    dealing: 'Dealing',
    passTo: 'Pass the phone to',
    noPeeking: 'Nobody else should look at the screen.',
    seeMyRole: 'See my role',
    yourPack: (names: string) => `Your pack: ${names}`,
    showCard: 'Show your card to the whole table',
    dogAsk: 'Choose your side now, without saying a word.',
    dogStay: 'Stay in the village',
    dogJoin: 'Join the pack',
    startNight: 'Begin the night',
    night: (n: number) => `Night ${n}`,
    villageSleeps: 'The village falls asleep',
    narratorIntro: 'Narrator: ask everyone to close their eyes, then follow the steps one by one.',
    powersLost: 'The Elder’s grudge has snuffed out every village power: only the wolves wake up.',
    stillAlive: (n: number) => `Still alive (${n})`,
    beginNight: 'Start the night',

    stepTitles: {
      voleur: 'The Thief',
      cupidon: 'Cupid',
      sauvage: 'The Wild Child',
      'sauvage-turn': 'The Wild Child',
      salvateur: 'Defender',
      voyante: 'Seer',
      renard: 'The Fox',
      comedien: 'The Actor',
      singe: 'The Learned Monkey',
      loups: 'The Werewolves',
      loupblanc: 'The White Werewolf',
      sorciere: 'The Witch',
      corbeau: 'The Raven',
    },

    thiefOpens: 'The Thief opens their eyes',
    thiefIntro: 'Hand them the phone: they see the two middle cards and decide whether to swap their own.',
    thiefSeeCards: 'See the two cards',
    thiefCards: 'The middle cards',
    thiefTake: 'Take',
    thiefMustSwap: 'Both cards are wolves: the Thief is forced to take one.',
    thiefKeep: 'Keep my card',

    cupidTitle: 'Cupid picks the two lovers',
    cupidNote: 'They may pick themselves. If one dies, the other dies at once.',
    cupidValidate: 'Confirm the couple',

    childTitle: 'The Wild Child picks a role model',
    childNote: 'While the model lives, they stay a villager. If the model dies, the child joins the pack.',
    childPick: 'Take as role model',
    childWake: 'Quietly wake up',
    childTurned: 'Your role model is dead',
    childTurnedNote: 'You join the pack — from now on you win with the wolves.',
    childCloses: 'They close their eyes again',

    guardTitle: 'The Defender protects a player',
    guardForbidden: (name: string) => `Off limits tonight: ${name} (protected last night).`,
    guardProtect: 'Protect',

    seerTitle: 'The Seer looks into a player',
    seerNote: 'Hand them the phone: they choose, see the role, then hand it back.',
    seerReveal: 'Reveal the role',
    seerVision: 'Vision',
    campWolves: 'Wolf side',
    campVillage: 'Village side',
    seerCloses: 'The Seer closes their eyes again',

    foxTitle: 'The Fox sniffs out a group',
    foxNote: 'They point at a player: the app checks that player and their two living neighbours, in table order.',
    foxSniff: 'Sniff',
    foxResultTitle: 'The Fox’s nose',
    foxFound: 'There is a wolf',
    foxNotFound: 'No wolf',
    foxFoundNote: 'The Fox doesn’t know which one — and keeps their nose for later nights.',
    foxNotFoundNote: 'All three are innocent: the Fox loses their power for good.',
    foxCloses: 'The Fox closes their eyes again',

    actorTitle: 'The Actor takes the stage',
    actorNote: (cards: string) => `${cards} left. They play one tonight, or keep them all for later.`,
    actorSeeCards: 'See their cards',
    actorCardsTitle: 'The Actor’s cards',
    actorPlay: 'Play',
    actorDiscardNote: 'The card played is then discarded for good.',
    actorSkip: 'On reflection, they pass',

    monkeyTitle: 'The Learned Monkey opens their eyes',
    monkeyNote:
      'Hand them the phone: they turn cards over one by one and stop whenever they like. Land on a Werewolf and curiosity costs them their life.',
    monkeyOnce: 'Only once per game',
    monkeyOnceNote: 'If they pass, they can still use their power on a later night.',
    monkeyConsult: 'Look at some cards',
    monkeyCardsTitle: 'Village cards',
    monkeyWhich: 'Which card to turn over?',
    monkeyAllSeen: 'Every card has been looked at.',
    monkeyStop: 'Stop here',
    monkeyFlip: 'Turn the card over',
    monkeyFlipped: 'Card turned over',
    monkeyCaught: 'A Werewolf!',
    monkeyDies: 'The Learned Monkey’s curiosity costs them their life. The death is announced at dawn.',
    monkeyCloseEyes: 'Close their eyes',
    monkeyAnother: 'Turn over another card',

    wolvesTitle: 'The wolves choose their victim',
    wolvesAwake: (names: string) => `Pack awake: ${names}`,
    noWolfAlive: 'no wolf alive',
    devour: 'Devour',

    whiteTitle: 'The White Werewolf wakes up alone',
    whiteNote: 'Every other night, they may devour one of their own pack.',
    whiteNoPrey: 'No other wolf is alive.',

    crowTitle: 'The Raven marks its target',
    crowNote: 'They will start the day with two votes against them.',
    crowCaw: 'Caw',

    witchTitle: 'The Witch opens her eyes',
    witchVictim: 'The wolves’ victim',
    witchAlreadySaved: 'This victim is already safe tonight.',
    witchHeal: 'Healing potion',
    witchPoison: 'Poison potion',
    used: '(used)',
    applied: '✓ applied',
    witchEndNight: 'End the night',
    witchKillAsk: 'Who does the Witch poison?',
    witchKill: 'Poison',

    loversTitle: 'The lovers',
    loversPass: 'Quietly pass the phone to',
    loversSee: 'See my lover',
    loversYouLove: 'You are in love with',
    loversWarning: 'If one of you dies, the other dies of grief.',
    loversContinue: 'The night goes on',

    dawnOf: (n: number) => `Dawn of day ${n}`,
    puppetFalls: 'The puppet falls',
    elderHolds: 'The Elder holds on',
    puppetLead: (name: string) => `The wolves went for ${name}: it is their puppet that dies instead.`,
    elderLead: (name: string) => `The wolves went for ${name}: the old carcass survives this first bite.`,
    puppetNote: (name: string) => `${name} stays in the game, but cannot say a single word any more: gestures only.`,
    elderNote: (name: string) => `${name} stays in the game. The next bite will be fatal.`,

    colossusWakes: 'The Colossus wakes up',
    colossusIntro: 'The wolves devoured the Colossus. Hand them the phone.',
    colossusHint: 'They are about to see their attackers and take one down.',
    colossusDiscover: 'Reveal the pack',
    colossusStrikes: 'The Colossus strikes',
    colossusSub: 'One wolf goes to the grave with them',
    colossusAsk: 'Which Werewolf to take down?',
    colossusTake: 'Take them to the grave',

    maidTitle: 'The Devoted Servant',
    maidPass: 'Before anything is revealed, pass the phone to',
    maidNote:
      'She may take the place of an eliminated player without seeing their card: she inherits it, and the dead player’s role is never shown to the table. Once per game only.',
    maidTake: 'Take their place, without knowing what they were',
    maidFaceDown: 'card face down',
    maidStay: 'She stays herself',
    maidInherits: 'The Servant inherits',
    maidSwitchesCamp: 'You switch sides: you now play with the wolves.',
    maidCloses: 'She closes the card',

    verdict: 'The village’s verdict',
    gunshot: 'The gunshot',
    nobodyDied: 'Nobody died',
    villageIntact: 'The village wakes up unharmed.',
    theyLeaveUs: 'They leave us',
    heSheLeavesUs: 'They leave us',
    cardHidden: 'card not revealed',
    elderGrudge: 'The Elder’s grudge',
    elderGrudgeNote:
      'The village burned the Elder: every villager loses their powers. No village night step from now on.',

    hunterTitle: 'Last breath',
    hunterCould: (name: string) => `${name} could still shoot`,
    hunterNote: 'They take a player of their choice to the grave.',
    hunterShoot: 'Shoot',

    idiotTitle: 'The Village Idiot',
    idiotNote:
      'You don’t hang an innocent like that: they are spared, but lose their right to vote for the rest of the game.',

    scapegoatTitle: 'The Scapegoat',
    scapegoatIntro: (name: string) => `Burned over a tie, ${name} takes revenge. Hand them the phone.`,
    scapegoatAsk: 'Who loses their vote tomorrow?',
    scapegoatBanned: 'no vote',
    scapegoatVotes: 'votes',

    judgeTitle: 'The Stuttering Judge',
    judgeAsk: 'A second vote?',
    judgeNote:
      'The Judge may demand a second vote right away, once per game. The village votes again immediately.',
    judgeNightFalls: 'Night falls',
    judgeSecondVote: 'Second vote',

    day: (n: number) => `Day ${n}`,
    debateAndVote: 'Debate and vote',
    debateNote: 'The village debates, then picks a player to eliminate.',
    crowDesignated: (name: string) => `The Raven marked ${name}: they start with two votes against them.`,
    bannedToday: (names: string) => `Barred from voting by the Scapegoat: ${names}.`,
    tie: 'Tie',
    eliminate: 'Eliminate',

    badges: {
      innocent: 'innocent',
      mute: 'mute',
      noVote: 'no vote',
      dead: 'dead',
      extraVotes: '+2 votes',
      cannotVote: 'cannot vote',
      wolf: 'Werewolf',
      turned: 'turned',
      inLove: 'in love',
    },

    winners: {
      village: 'the Village',
      loups: 'the Werewolves',
      solitaire: 'the White Werewolf',
      amoureux: 'the Lovers',
    },
    reasonDecimated: 'The entire village has been wiped out.',
    reasonWhiteLast: 'The White Werewolf is the last one standing.',
    reasonLoversLast: 'The lovers are the last ones standing.',
    reasonWolvesDead: 'Every werewolf has been eliminated.',
    reasonWolvesParity: 'The wolves now match the villagers in number.',
  },

  result: {
    title: 'End of the round',
    victory: (who: string) => `Winner: ${who}`,
    points: 'Points',
    save: 'Save to the standings',
  },

  store: { removedPlayer: '(player removed)' },

  roles: {
    loup: {
      label: 'Werewolf',
      description: 'Every night, you devour a villager with your pack.',
      details:
        'Every night the app wakes the pack: the wolves recognise each other from the deal and pick a victim together. They win as soon as they match the rest of the village in number.',
    },
    villageois: {
      label: 'Villager',
      description: 'No power: your weapons are the debate and your vote.',
      details:
        'No night power, but their voice counts as much as anyone’s in the daytime vote. This is the filler role: any player without a special role is a villager.',
    },
    voyante: {
      label: 'Seer',
      description: 'Every night, you discover one player’s role.',
      details:
        'Every night the app shows them one player’s exact role — not just their side. It is up to them to leak the information without being spotted by the pack.',
    },
    sorciere: {
      label: 'Witch',
      description: 'You hold one healing potion and one poison potion, each usable once.',
      details:
        'The app shows her the wolves’ victim. Healing potion to save them, poison potion to eliminate someone else: one use each for the whole game.',
    },
    chasseur: {
      label: 'Hunter',
      description: 'If you die, you take a player of your choice with you.',
      details:
        'On their death — bite, vote or heartbreak — the app immediately has them pick a player who dies with them. One shot per game.',
    },
    cupidon: {
      label: 'Cupid',
      description: 'On the first night, you pick two lovers. If one dies, the other dies of grief.',
      details:
        'First night only. The app then privately shows each lover who the other is. If one dies, the other dies of grief. A wolf + village couple wins alone if they are the last ones left.',
    },
    petite_fille: {
      label: 'Little Girl',
      description: 'You can spy on the wolves during the night, at your own risk.',
      details:
        'A purely spoken role: she peeks during the wolves’ turn, at her own risk. The app opens no step for her — it is up to the narrator to keep an eye on her.',
    },
    salvateur: {
      label: 'Defender',
      description: 'Every night, you shield a player from the wolves (never the same one twice in a row).',
      details:
        'Every night they protect a player from the bite. The app forbids picking the same player two nights running. The shield is worthless against the poison potion.',
    },
    marionnettiste: {
      label: 'Puppeteer',
      description:
        'You have a second life: if the wolves devour you, your puppet dies instead. You stay in the game, but mute.',
      details:
        'A second life against the wolves only: the puppet dies instead, once. They stay in the game, marked “mute” in the lists, and communicate by gestures alone. The Witch’s poison kills them normally.',
    },
    colosse: {
      label: 'Colossus',
      description: 'If the wolves devour you, you wake up, see the pack and drag one of them to the grave.',
      details:
        'Only if devoured: the app shows them the pack and lets them choose the wolf they take down. Killed by the vote or the poison, they go alone.',
    },
    singe: {
      label: 'Learned Monkey',
      description: 'Once per game, you look at as many cards as you like. One wolf card and curiosity kills you.',
      details:
        'Once per game, on the night of their choice. They turn cards over one by one and stop whenever they want. On a wolf card they die — the death is announced at dawn.',
    },
    idiot: {
      label: 'Village Idiot',
      description: 'If the village condemns you, you are spared — but you lose your right to vote.',
      details:
        'The first vote against them turns their card over: they survive, everyone knows who they are, and the app marks them “no vote” for the rest of the game. The wolves can still devour them, and a second vote against them is final.',
    },
    ancien: {
      label: 'Elder',
      description: 'You survive the wolves’ first bite. But if the village kills you, everyone loses their powers.',
      details:
        'The wolves’ first attack does not kill them: the app announces they took the hit and they stay in the game. Eliminated by the village vote, however, their grudge strips every villager of their powers — the app then drops all village night steps. The Witch’s poison and the White Werewolf ignore their shield.',
    },
    bouc: {
      label: 'Scapegoat',
      description: 'On a tied vote, you are the one who burns. You then choose who votes the next day.',
      details:
        'The app adds a “Tie” button to the daytime vote while they are alive. On a tie they die in everyone’s place, then name the players barred from voting the following day — the app marks them “cannot vote” when the day comes.',
    },
    chienloup: {
      label: 'Wolf Dog',
      description: 'At the deal, you choose your side: plain villager, or member of the pack.',
      details:
        'When the app shows them their card, two buttons: stay in the village or join the pack. If they join the wolves, they immediately see their accomplices and count as a wolf until the end — both for the win and for the points.',
    },
    villageois2: {
      label: 'Villager-Villager',
      description: 'Your card is public: everyone knows you are innocent.',
      details:
        'At the deal, the app asks them to show their card to the whole table. They then carry the “innocent” badge in every list: impossible to suspect, but an obvious target.',
    },
    servante: {
      label: 'Devoted Servant',
      description: 'Before an eliminated card is revealed, you may take its place and inherit the role.',
      details:
        'On every wave of deaths, the app offers her the place of one of the eliminated, without seeing the card. She inherits the role and its powers — potions already drunk stay drunk, but her Hunter shot is intact — and the dead player’s card is never revealed. Once per game, and if she inherits a wolf card she switches sides.',
    },
    voleur: {
      label: 'Thief',
      description: 'On the first night, you may swap your card for one of the two middle cards.',
      details:
        'When they are in play, the app sets two cards aside at the deal. On the first night it shows them: they keep their own or take one of the two. If both middle cards are wolves, they are forced to take one.',
    },
    loupblanc: {
      label: 'White Werewolf',
      description: 'A lone wolf: you devour with the pack, but every other night you kill a wolf. You win alone.',
      details:
        'They wake with the pack like an ordinary wolf, then the app wakes them alone on every even night to devour a wolf of their choice (or pass). Their victim is protected by neither the Defender nor the Witch. They only win their “lone” side as the last survivor; if the wolves win first, they win with them.',
    },
    renard: {
      label: 'Fox',
      description: 'Every night, you sniff a player and their two neighbours. Find no wolf and you lose your nose.',
      details:
        'The app shows them a group of three players — the target and their two living neighbours — and simply answers yes or no to “is there a wolf”. Table order is the order the players were entered in. A negative answer costs them their power for good.',
    },
    corbeau: {
      label: 'Raven',
      description: 'Every night, you mark a player: they start the day with two votes against them.',
      details:
        'The app shows the marked player at the top of the day screen and tags them “+2 votes” in the list. It is up to the narrator to account for it when counting — the app does not count votes for you.',
    },
    sauvage: {
      label: 'Wild Child',
      description: 'On the first night, you pick a role model. If they die, you join the pack.',
      details:
        'The app has them pick a role model on the first night. While the model lives, they play as a villager. As soon as the model dies, the app wakes them privately the next night to announce the change and show them the pack: they then count as a wolf for the win and for the points.',
    },
    juge: {
      label: 'Stuttering Judge',
      description: 'Once per game, you can demand a second vote right after the first.',
      details:
        'As soon as the daytime vote is settled, the app asks whether they trigger their second vote. The village votes again at once, with a fresh debate timer. Once per game.',
    },
    comedien: {
      label: 'Actor',
      description: 'Three cards lie in front of you: each night you play one, which is then discarded.',
      details:
        'At the deal, the app draws three powers from those not already in play (Seer, Defender, Fox, Raven, Hunter). Each night they choose one, the app moves straight to the matching step, and the card is discarded. They may also pass to keep them.',
    },
  },
}
