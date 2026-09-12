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

/**
 * Fiche d'un rôle, réduite à ce qui ne dépend pas de la langue.
 * Libellé, résumé et explication détaillée vivent dans les dictionnaires (i18n/roles).
 */
export interface RoleDef {
  id: RoleId
  camp: Extract<Camp, 'village' | 'loups'>
  /** Rôle unique dans la partie (les loups et villageois sont multiples). */
  unique: boolean
}

export const ROLES: Record<RoleId, RoleDef> = {
  loup: { id: 'loup', camp: 'loups', unique: false },
  villageois: { id: 'villageois', camp: 'village', unique: false },
  voyante: { id: 'voyante', camp: 'village', unique: true },
  sorciere: { id: 'sorciere', camp: 'village', unique: true },
  chasseur: { id: 'chasseur', camp: 'village', unique: true },
  cupidon: { id: 'cupidon', camp: 'village', unique: true },
  petite_fille: { id: 'petite_fille', camp: 'village', unique: true },
  salvateur: { id: 'salvateur', camp: 'village', unique: true },
  marionnettiste: { id: 'marionnettiste', camp: 'village', unique: true },
  colosse: { id: 'colosse', camp: 'village', unique: true },
  singe: { id: 'singe', camp: 'village', unique: true },
  idiot: { id: 'idiot', camp: 'village', unique: true },
  ancien: { id: 'ancien', camp: 'village', unique: true },
  bouc: { id: 'bouc', camp: 'village', unique: true },
  chienloup: { id: 'chienloup', camp: 'village', unique: true },
  villageois2: { id: 'villageois2', camp: 'village', unique: true },
  servante: { id: 'servante', camp: 'village', unique: true },
  voleur: { id: 'voleur', camp: 'village', unique: true },
  loupblanc: { id: 'loupblanc', camp: 'loups', unique: true },
  renard: { id: 'renard', camp: 'village', unique: true },
  corbeau: { id: 'corbeau', camp: 'village', unique: true },
  sauvage: { id: 'sauvage', camp: 'village', unique: true },
  juge: { id: 'juge', camp: 'village', unique: true },
  comedien: { id: 'comedien', camp: 'village', unique: true },
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

