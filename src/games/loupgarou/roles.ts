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

export interface RoleDef {
  id: RoleId
  label: string
  camp: Extract<Camp, 'village' | 'loups'>
  description: string
  /** Rôle unique dans la partie (les loups et villageois sont multiples). */
  unique: boolean
}

export const ROLES: Record<RoleId, RoleDef> = {
  loup: {
    id: 'loup',
    label: 'Loup-Garou',
    camp: 'loups',
    description: 'Chaque nuit, tu dévores un villageois avec ta meute.',
    unique: false,
  },
  villageois: {
    id: 'villageois',
    label: 'Villageois',
    camp: 'village',
    description: 'Aucun pouvoir : ton arme, c’est le débat et ton vote.',
    unique: false,
  },
  voyante: {
    id: 'voyante',
    label: 'Voyante',
    camp: 'village',
    description: 'Chaque nuit, tu découvres le rôle d’un joueur.',
    unique: true,
  },
  sorciere: {
    id: 'sorciere',
    label: 'Sorcière',
    camp: 'village',
    description: 'Tu possèdes une potion de vie et une potion de mort, une seule fois chacune.',
    unique: true,
  },
  chasseur: {
    id: 'chasseur',
    label: 'Chasseur',
    camp: 'village',
    description: 'Si tu meurs, tu emportes un joueur de ton choix avec toi.',
    unique: true,
  },
  cupidon: {
    id: 'cupidon',
    label: 'Cupidon',
    camp: 'village',
    description: 'La première nuit, tu désignes deux amoureux. Si l’un meurt, l’autre meurt de chagrin.',
    unique: true,
  },
  petite_fille: {
    id: 'petite_fille',
    label: 'Petite Fille',
    camp: 'village',
    description: 'Tu peux espionner les loups pendant la nuit, à tes risques et périls.',
    unique: true,
  },
  salvateur: {
    id: 'salvateur',
    label: 'Salvateur',
    camp: 'village',
    description: 'Chaque nuit, tu protèges un joueur des loups (jamais le même deux nuits de suite).',
    unique: true,
  },
}

/** Rôles spéciaux proposés dans l'écran de composition, dans l'ordre d'affichage. */
export const OPTIONAL_ROLES: RoleId[] = ['voyante', 'sorciere', 'chasseur', 'cupidon', 'salvateur', 'petite_fille']

export function roleCamp(id: RoleId): Extract<Camp, 'village' | 'loups'> {
  return ROLES[id].camp
}
