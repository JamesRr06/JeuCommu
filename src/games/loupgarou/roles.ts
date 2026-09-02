import type { Camp } from '../../types'

export type RoleId =
  | 'loup'
  | 'villageois'
  | 'voyante'
  | 'sorciere'
  | 'chasseur'
  | 'cupidon'
  | 'petite_fille'
  | 'salvateur'
  | 'marionnettiste'
  | 'colosse'
  | 'singe'
  | 'idiot'
  | 'ancien'
  | 'bouc'
  | 'chienloup'
  | 'villageois2'
  | 'servante'
  | 'voleur'
  | 'loupblanc'
  | 'renard'
  | 'corbeau'
  | 'sauvage'
  | 'juge'
  | 'comedien'

export interface RoleDef {
  id: RoleId
  label: string
  camp: Extract<Camp, 'village' | 'loups'>
  description: string
  /** Explication complète, affichée dans l'infobulle de l'écran de composition. */
  details: string
  /** Rôle unique dans la partie (les loups et villageois sont multiples). */
  unique: boolean
}

export const ROLES: Record<RoleId, RoleDef> = {
  loup: {
    id: 'loup',
    label: 'Loup-Garou',
    camp: 'loups',
    description: 'Chaque nuit, tu dévores un villageois avec ta meute.',
    details:
      'Chaque nuit, l’app réveille la meute : les loups se reconnaissent dès la distribution et désignent ensemble une victime. Ils gagnent dès qu’ils sont aussi nombreux que le reste du village.',
    unique: false,
  },
  villageois: {
    id: 'villageois',
    label: 'Villageois',
    camp: 'village',
    description: 'Aucun pouvoir : ton arme, c’est le débat et ton vote.',
    details:
      'Aucun pouvoir de nuit, mais sa voix pèse autant que les autres au vote du jour. C’est le rôle de remplissage : tout joueur sans rôle spécial est villageois.',
    unique: false,
  },
  voyante: {
    id: 'voyante',
    label: 'Voyante',
    camp: 'village',
    description: 'Chaque nuit, tu découvres le rôle d’un joueur.',
    details:
      'Chaque nuit, l’app lui montre le rôle exact d’un joueur — pas seulement son camp. À elle de distiller l’information sans se faire repérer par la meute.',
    unique: true,
  },
  sorciere: {
    id: 'sorciere',
    label: 'Sorcière',
    camp: 'village',
    description: 'Tu possèdes une potion de vie et une potion de mort, une seule fois chacune.',
    details:
      'L’app lui montre la victime des loups. Potion de vie pour la sauver, potion de mort pour éliminer quelqu’un d’autre : une seule utilisation chacune sur toute la partie.',
    unique: true,
  },
  chasseur: {
    id: 'chasseur',
    label: 'Chasseur',
    camp: 'village',
    description: 'Si tu meurs, tu emportes un joueur de ton choix avec toi.',
    details:
      'À sa mort — morsure, vote ou chagrin d’amour — l’app lui fait aussitôt désigner un joueur qui meurt avec lui. Un seul tir dans la partie.',
    unique: true,
  },
  cupidon: {
    id: 'cupidon',
    label: 'Cupidon',
    camp: 'village',
    description: 'La première nuit, tu désignes deux amoureux. Si l’un meurt, l’autre meurt de chagrin.',
    details:
      'La première nuit seulement. L’app montre ensuite à chaque amoureux, en privé, qui est l’autre. Si l’un meurt, l’autre meurt de chagrin. Un couple loup + village gagne seul s’il reste en dernier.',
    unique: true,
  },
  petite_fille: {
    id: 'petite_fille',
    label: 'Petite Fille',
    camp: 'village',
    description: 'Tu peux espionner les loups pendant la nuit, à tes risques et périls.',
    details:
      'Rôle purement oral : elle entrouvre les yeux pendant le tour des loups, à ses risques et périls. L’app ne lui ouvre pas d’étape, c’est au narrateur de la surveiller.',
    unique: true,
  },
  salvateur: {
    id: 'salvateur',
    label: 'Salvateur',
    camp: 'village',
    description: 'Chaque nuit, tu protèges un joueur des loups (jamais le même deux nuits de suite).',
    details:
      'Chaque nuit, il protège un joueur de la morsure. L’app interdit de reprendre le même joueur deux nuits de suite. La protection ne vaut rien contre la potion de mort.',
    unique: true,
  },
  marionnettiste: {
    id: 'marionnettiste',
    label: 'Marionnettiste',
    camp: 'village',
    description:
      'Tu as une seconde vie : si les loups te dévorent, ta marionnette meurt à ta place. Tu restes en jeu, mais muet.',
    details:
      'Seconde vie contre les loups uniquement : la marionnette meurt à sa place, une seule fois. Il reste en jeu, marqué « muet » dans les listes, et ne communique plus que par gestes. Le poison de la Sorcière le tue normalement.',
    unique: true,
  },
  colosse: {
    id: 'colosse',
    label: 'Colosse',
    camp: 'village',
    description:
      'Si les loups te dévorent, tu te réveilles, découvres la meute et emportes l’un d’eux dans la tombe.',
    details:
      'Uniquement s’il est dévoré : l’app lui montre la meute et lui fait choisir le loup qu’il emporte. Mort par le vote ou par le poison, il part seul.',
    unique: true,
  },
  singe: {
    id: 'singe',
    label: 'Singe Savant',
    camp: 'village',
    description:
      'Une fois par partie, tu consultes autant de cartes que tu veux. Une carte de loup et ta curiosité te tue.',
    details:
      'Une seule fois dans la partie, la nuit de son choix. Il retourne les cartes une par une et s’arrête quand il veut. Sur une carte de loup, il meurt — la mort est annoncée à l’aube.',
    unique: true,
  },
  idiot: {
    id: 'idiot',
    label: 'Idiot du Village',
    camp: 'village',
    description:
      'Si le village te condamne, tu es épargné — mais tu perds ton droit de vote.',
    details:
      'Le premier vote qui le désigne retourne sa carte : il survit, tout le monde sait qui il est, et l’app le marque « sans voix » pour le reste de la partie. Les loups, eux, peuvent toujours le dévorer, et un second vote contre lui l’élimine pour de bon.',
    unique: true,
  },
  ancien: {
    id: 'ancien',
    label: 'Ancien',
    camp: 'village',
    description:
      'Tu survis à la première morsure des loups. Mais si le village te tue, tous perdent leurs pouvoirs.',
    details:
      'La première attaque des loups ne le tue pas : l’app annonce qu’il a encaissé et il reste en jeu. En revanche, éliminé par le vote du village, sa rancune prive tous les villageois de leurs pouvoirs — l’app supprime alors toutes les étapes de nuit du village. Le poison de la Sorcière et le Loup-Garou Blanc passent outre son bouclier.',
    unique: true,
  },
  bouc: {
    id: 'bouc',
    label: 'Bouc Émissaire',
    camp: 'village',
    description:
      'En cas d’égalité au vote, c’est toi qu’on brûle. Tu choisis alors qui votera le lendemain.',
    details:
      'L’app ajoute un bouton « Égalité » au vote du jour tant qu’il est vivant. En cas d’égalité il meurt à la place de tout le monde, puis désigne les joueurs privés de vote pour la journée suivante — l’app les marque « ne vote pas » le jour venu.',
    unique: true,
  },
  chienloup: {
    id: 'chienloup',
    label: 'Chien-Loup',
    camp: 'village',
    description:
      'À la distribution, tu choisis ton camp : simple villageois, ou membre de la meute.',
    details:
      'Au moment où l’app lui montre sa carte, deux boutons : rester au village ou rejoindre la meute. S’il rejoint les loups, il découvre aussitôt ses complices et compte comme loup jusqu’à la fin — pour la victoire comme pour les points.',
    unique: true,
  },
  villageois2: {
    id: 'villageois2',
    label: 'Villageois-Villageois',
    camp: 'village',
    description:
      'Ta carte est publique : tout le monde sait que tu es innocent.',
    details:
      'À la distribution, l’app lui demande de montrer sa carte à toute la table. Il porte ensuite le badge « innocent » dans toutes les listes : impossible de le soupçonner, mais il devient une cible évidente.',
    unique: true,
  },
  servante: {
    id: 'servante',
    label: 'Servante Dévouée',
    camp: 'village',
    description:
      'Avant qu’une carte éliminée ne soit révélée, tu peux prendre sa place et hériter de son rôle.',
    details:
      'À chaque vague de morts, l’app lui propose de prendre la place d’un des éliminés, sans voir sa carte. Elle hérite du rôle et de ses pouvoirs — les potions déjà bues restent bues, mais son tir de Chasseur est intact — et la carte du mort n’est jamais révélée. Une seule fois dans la partie, et si elle hérite d’une carte de loup, elle change de camp.',
    unique: true,
  },
  voleur: {
    id: 'voleur',
    label: 'Voleur',
    camp: 'village',
    description:
      'La première nuit, tu peux échanger ta carte contre l’une des deux cartes du milieu.',
    details:
      'Quand il est en jeu, l’app met deux cartes de côté à la distribution. La première nuit, elle les lui montre : il garde la sienne ou prend l’une des deux. Si les deux cartes du milieu sont des loups, il est obligé d’en prendre une.',
    unique: true,
  },
  loupblanc: {
    id: 'loupblanc',
    label: 'Loup-Garou Blanc',
    camp: 'loups',
    description:
      'Loup solitaire : tu dévores avec la meute, mais une nuit sur deux tu élimines un loup. Tu gagnes seul.',
    details:
      'Il se réveille avec la meute comme un loup ordinaire, puis l’app le réveille seul chaque nuit paire pour dévorer un loup de son choix (ou passer). Sa victime n’est protégée ni par le Salvateur ni par la Sorcière. Il ne gagne son camp « solitaire » que s’il est le dernier survivant ; si les loups gagnent avant, il gagne avec eux.',
    unique: true,
  },
  renard: {
    id: 'renard',
    label: 'Renard',
    camp: 'village',
    description:
      'Chaque nuit, tu flaires un joueur et ses deux voisins. Si aucun n’est loup, tu perds ton flair.',
    details:
      'L’app lui montre un groupe de trois joueurs — la cible et ses deux voisins vivants — et répond simplement oui ou non à « y a-t-il un loup ». L’ordre de la table est celui dans lequel les joueurs ont été saisis. Une réponse négative lui coûte définitivement son pouvoir.',
    unique: true,
  },
  corbeau: {
    id: 'corbeau',
    label: 'Corbeau',
    camp: 'village',
    description:
      'Chaque nuit, tu désignes un joueur : il commence la journée avec deux voix contre lui.',
    details:
      'L’app affiche le désigné en tête de l’écran du jour et le marque « +2 voix » dans la liste. C’est au narrateur d’en tenir compte au dépouillement — l’app ne compte pas les voix à sa place.',
    unique: true,
  },
  sauvage: {
    id: 'sauvage',
    label: 'Enfant Sauvage',
    camp: 'village',
    description:
      'La première nuit, tu choisis un modèle. S’il meurt, tu rejoins la meute.',
    details:
      'L’app lui fait désigner un modèle la première nuit. Tant que le modèle vit, il joue villageois. Dès que le modèle meurt, l’app le réveille en privé la nuit suivante pour lui annoncer sa transformation et lui montrer la meute : il compte alors comme loup pour la victoire et pour les points.',
    unique: true,
  },
  juge: {
    id: 'juge',
    label: 'Juge Bègue',
    camp: 'village',
    description:
      'Une fois dans la partie, tu peux exiger un second vote dans la foulée du premier.',
    details:
      'Dès que le vote du jour est résolu, l’app lui demande s’il déclenche son second vote. Le village revote aussitôt, avec un nouveau minuteur de débat. Une seule fois dans la partie.',
    unique: true,
  },
  comedien: {
    id: 'comedien',
    label: 'Comédien',
    camp: 'village',
    description:
      'Trois cartes sont posées devant toi : chaque nuit tu en joues une, qui est ensuite écartée.',
    details:
      'À la distribution, l’app tire trois pouvoirs parmi ceux qui ne sont pas déjà en jeu (Voyante, Salvateur, Renard, Corbeau, Chasseur). Chaque nuit il en choisit un, l’app enchaîne aussitôt sur l’étape correspondante, et la carte est écartée. Il peut aussi passer son tour pour les garder.',
    unique: true,
  },
}

/** Rôles spéciaux proposés dans l'écran de composition, dans l'ordre d'affichage. */
export const OPTIONAL_ROLES: RoleId[] = [
  'voyante',
  'sorciere',
  'chasseur',
  'cupidon',
  'salvateur',
  'petite_fille',
  'marionnettiste',
  'colosse',
  'singe',
  'idiot',
  'ancien',
  'bouc',
  'chienloup',
  'villageois2',
  'servante',
  'voleur',
  'loupblanc',
  'renard',
  'corbeau',
  'sauvage',
  'juge',
  'comedien',
]

