import type { LucideIcon } from 'lucide-react'

export type RarityId =
  | 'consumer'
  | 'industrial'
  | 'milspec'
  | 'restricted'
  | 'classified'
  | 'covert'

export interface Rarity {
  id: RarityId
  /** Grade name shown on badges, e.g. "Mil-Spec". */
  label: string
  /** Plain-language tier, e.g. "Rare". */
  tier: string
  /** 0 = most common. Used for sorting. */
  rank: number
  /** Base color for borders, text and glows. */
  color: string
  /** Default drop weight; cases may override it. */
  defaultWeight: number
}

/** Visual description of an item; rendered by <ItemArt />. */
export interface ItemArtwork {
  icon: LucideIcon
  /** Two-stop gradient for the icon stroke: [light, dark]. */
  tint: [string, string]
}

export interface Item {
  id: string
  name: string
  rarity: RarityId
  /** Mock value in demo tokens. */
  value: number
  /** Short flavour category, e.g. "Blade". */
  kind: string
  art: ItemArtwork
}

export interface CaseTheme {
  /** Main body color of the crate. */
  body: string
  /** Metal trim color. */
  trim: string
  /** Light leaking from the seam and the backdrop glow. */
  glow: string
  /** Emblem shown on the lock plate. */
  emblem: LucideIcon
}

export interface LootCase {
  id: string
  name: string
  tagline: string
  description: string
  /** Mock cost in demo tokens. */
  cost: number
  theme: CaseTheme
  itemIds: string[]
  /** Per-rarity drop weights. Rarities missing from the pool are ignored. */
  rarityWeights: Partial<Record<RarityId, number>>
}

/** One card in the roulette strip. `key` is unique per strip position. */
export interface StripEntry {
  key: string
  item: Item
}

export interface Drop {
  id: string
  user: string
  item: Item
  caseName: string
  /** Epoch milliseconds. */
  at: number
  isOwn?: boolean
}

export interface InventoryEntry {
  /** Unique per unboxing. */
  uid: string
  itemId: string
  caseId: string
  obtainedAt: number
}
