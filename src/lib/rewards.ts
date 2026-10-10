import { getCaseItems } from '../data/cases'
import { RARITIES, RARITY_ORDER } from '../data/rarities'
import type { Item, LootCase, RarityId } from '../types'
import { pickOne, pickWeighted, secureRandom, type Rng } from './random'

export interface RarityOdds {
  rarity: RarityId
  /** Probability in [0, 1] of rolling this rarity. */
  chance: number
  items: Item[]
}

const oddsCache = new WeakMap<LootCase, RarityOdds[]>()

/**
 * Normalised rarity odds for a case. Only rarities that actually have items
 * in the pool are considered, so odds always sum to 1.
 */
export function getCaseOdds(lootCase: LootCase): RarityOdds[] {
  const cached = oddsCache.get(lootCase)
  if (cached) return cached

  const items = getCaseItems(lootCase)
  const tiers = RARITY_ORDER.map((rarity) => ({
    rarity,
    weight: lootCase.rarityWeights[rarity] ?? RARITIES[rarity].defaultWeight,
    items: items.filter((i) => i.rarity === rarity),
  })).filter((t) => t.items.length > 0 && t.weight > 0)

  const total = tiers.reduce((sum, t) => sum + t.weight, 0)
  const odds = tiers.map((t) => ({ rarity: t.rarity, chance: t.weight / total, items: t.items }))
  oddsCache.set(lootCase, odds)
  return odds
}

/** Probability of a specific item: its tier's chance split evenly across the tier. */
export function getItemChance(lootCase: LootCase, item: Item): number {
  const tier = getCaseOdds(lootCase).find((t) => t.rarity === item.rarity)
  return tier ? tier.chance / tier.items.length : 0
}

/**
 * Roll a reward: pick a rarity tier by weight, then an item uniformly within it.
 * Demo only — a real system must roll on a trusted server.
 */
export function rollReward(lootCase: LootCase, rng: Rng = secureRandom): Item {
  const tier = pickWeighted(
    rng,
    getCaseOdds(lootCase).map((t) => ({ value: t, weight: t.chance })),
  )
  return pickOne(rng, tier.items)
}
