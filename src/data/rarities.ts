import type { Rarity, RarityId } from '../types'

/**
 * Single source of truth for rarity tiers. Components read colors and labels
 * from here — never hardcode a rarity color elsewhere.
 */
export const RARITIES: Record<RarityId, Rarity> = {
  consumer: {
    id: 'consumer',
    label: 'Consumer',
    tier: 'Common',
    rank: 0,
    color: '#b0c3d9',
    defaultWeight: 52,
  },
  industrial: {
    id: 'industrial',
    label: 'Industrial',
    tier: 'Uncommon',
    rank: 1,
    color: '#5e98d9',
    defaultWeight: 26,
  },
  milspec: {
    id: 'milspec',
    label: 'Mil-Spec',
    tier: 'Rare',
    rank: 2,
    color: '#5b7bff',
    defaultWeight: 13,
  },
  restricted: {
    id: 'restricted',
    label: 'Restricted',
    tier: 'Epic',
    rank: 3,
    color: '#9a5cff',
    defaultWeight: 6,
  },
  classified: {
    id: 'classified',
    label: 'Classified',
    tier: 'Legendary',
    rank: 4,
    color: '#d84ae9',
    defaultWeight: 2.4,
  },
  covert: {
    id: 'covert',
    label: 'Covert',
    tier: 'Mythic',
    rank: 5,
    color: '#ef5350',
    defaultWeight: 0.6,
  },
}

export const RARITY_ORDER: RarityId[] = (Object.values(RARITIES) as Rarity[])
  .sort((a, b) => a.rank - b.rank)
  .map((r) => r.id)

export function getRarity(id: RarityId): Rarity {
  return RARITIES[id]
}

/** Rarities at or above this rank get the animated glow treatment. */
export const GLOW_FROM_RANK = 3
