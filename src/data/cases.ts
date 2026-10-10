import { Flame, Gem, MoonStar, Sun } from 'lucide-react'
import type { Item, LootCase } from '../types'
import { ITEMS } from './items'

/**
 * Case catalogue. To add a case: define its items in `items.ts`, then append
 * an entry here — the UI picks it up automatically.
 */
export const CASES: LootCase[] = [
  {
    id: 'ember-forge',
    name: 'Ember Forge Chest',
    tagline: 'Dwarven Forge · Starter',
    description:
      'Iron-banded and still warm from the anvil. Packed with smithing gear, blades and the occasional crown-grade relic.',
    cost: 100,
    theme: { body: '#4a2a1c', trim: '#d9a54e', glow: '#ff8a3d', emblem: Flame },
    itemIds: [
      'rusty-shortsword',
      'oak-buckler',
      'woodcutter-axe',
      'smith-hammer',
      'deepvein-pick',
      'twin-ember-blades',
      'bulwark-of-cinders',
      'runed-anvil',
      'dragonfire-torch',
      'forge-king-crown',
      'heart-of-the-mountain',
    ],
    rarityWeights: {
      consumer: 52,
      industrial: 26,
      milspec: 13,
      restricted: 6.2,
      classified: 2.2,
      covert: 0.6,
    },
  },
  {
    id: 'arcane-reliquary',
    name: 'Arcane Reliquary',
    tagline: 'Mage Tower · Mystic',
    description:
      'A sealed reliquary humming with stored spells. Better odds on rare tomes, wands and sigils than a common chest.',
    cost: 250,
    theme: { body: '#2b1f4d', trim: '#c7b7ff', glow: '#9a6bff', emblem: MoonStar },
    itemIds: [
      'apprentice-scroll',
      'minor-mana-flask',
      'owl-quill',
      'moonleaf',
      'orbiting-wisp',
      'grimoire-of-sparks',
      'chrono-glass',
      'wand-of-starfall',
      'all-seeing-eye',
      'lunar-sigil',
      'prism-of-infinity',
    ],
    rarityWeights: {
      consumer: 44,
      industrial: 28,
      milspec: 16,
      restricted: 8.5,
      classified: 2.8,
      covert: 0.7,
    },
  },
  {
    id: 'abyssal-coffer',
    name: 'Abyssal Coffer',
    tagline: 'Sunken Fleet · Deep',
    description:
      'Hauled up from a wreck no map remembers. Barnacled salvage on the outside, leviathan relics hiding within.',
    cost: 500,
    theme: { body: '#0f3438', trim: '#7fe0cf', glow: '#2fd1c0', emblem: Gem },
    itemIds: [
      'tidepool-shell',
      'barnacled-anchor',
      'glimmerfin',
      'drowned-compass',
      'galleon-in-a-bottle',
      'tidecaller-charm',
      'pearls-of-the-deep',
      'drowned-king-skull',
      'lockers-key',
      'leviathan-scale',
      'abyssal-heart',
    ],
    rarityWeights: {
      consumer: 40,
      industrial: 30,
      milspec: 17,
      restricted: 9,
      classified: 3.2,
      covert: 0.8,
    },
  },
  {
    id: 'celestial-vault',
    name: 'Celestial Vault',
    tagline: 'Sky Citadel · Premium',
    description:
      'Forged from fallen starlight. No commons inside — every pull is Industrial grade or better, with a shot at the Eternal Star.',
    cost: 1000,
    theme: { body: '#3a3350', trim: '#ffe3a1', glow: '#ffd37a', emblem: Sun },
    itemIds: [
      'stardust-pouch',
      'storm-shard',
      'sun-medallion',
      'zephyr-charm',
      'halo-of-dawn',
      'phoenix-plume',
      'star-crown',
      'astral-astrolabe',
      'eternal-star',
    ],
    rarityWeights: {
      industrial: 55,
      milspec: 28,
      restricted: 12,
      classified: 4,
      covert: 1,
    },
  },
]

export const DEFAULT_CASE_ID = CASES[0].id

export function getCase(id: string): LootCase {
  return CASES.find((c) => c.id === id) ?? CASES[0]
}

export function getCaseItems(lootCase: LootCase): Item[] {
  return lootCase.itemIds.map((id) => {
    const found = ITEMS[id]
    if (!found) throw new Error(`Case "${lootCase.id}" references unknown item "${id}"`)
    return found
  })
}
