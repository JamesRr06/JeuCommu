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
]

export function roleCamp(id: RoleId): Extract<Camp, 'village' | 'loups'> {
  return ROLES[id].camp
}
