import {
  Anchor,
  Anvil,
  Axe,
  Bird,
  BookOpen,
  Compass,
  Crown,
  Diamond,
  Droplets,
  Eye,
  Feather,
  Fish,
  Flame,
  FlaskConical,
  Gem,
  Hammer,
  Hexagon,
  Hourglass,
  KeyRound,
  Leaf,
  MoonStar,
  Orbit,
  Pickaxe,
  ScrollText,
  Shell,
  Shield,
  ShieldHalf,
  Ship,
  Skull,
  Sparkle,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Sword,
  Swords,
  Telescope,
  WandSparkles,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Item, RarityId } from '../types'

function item(
  id: string,
  name: string,
  rarity: RarityId,
  value: number,
  kind: string,
  icon: LucideIcon,
  tint: [string, string],
): Item {
  return { id, name, rarity, value, kind, art: { icon, tint } }
}

// Tints are the item's own material colors; the rarity color is applied separately.
const IRON: [string, string] = ['#e7ecf3', '#7d8796']
const STEEL: [string, string] = ['#d9e6f5', '#5c7591']
const BRONZE: [string, string] = ['#f3c58b', '#9a5b2a']
const EMBER: [string, string] = ['#ffd27a', '#e2481f']
const GOLD: [string, string] = ['#fff1b8', '#c98f22']
const ARCANE: [string, string] = ['#e6d4ff', '#7b46e0']
const MOON: [string, string] = ['#f3f0ff', '#8b8fd8']
const VERDANT: [string, string] = ['#d6ffd9', '#3a9f5b']
const PARCHMENT: [string, string] = ['#fbecc8', '#b38a4f']
const SEA: [string, string] = ['#c9fbff', '#1f8fa8']
const ABYSS: [string, string] = ['#9ef0d9', '#126e72']
const BONE: [string, string] = ['#f4efe3', '#9b8f78']
const CORAL: [string, string] = ['#ffd0c2', '#e0624a']
const DAWN: [string, string] = ['#fff6d6', '#f39b3a']
const SKY: [string, string] = ['#f2fbff', '#6aa9e8']
const ROSE: [string, string] = ['#ffd6ea', '#e04a8f']

const ITEM_LIST: Item[] = [
  // ── Ember Forge ─────────────────────────────────────────────
  item('rusty-shortsword', 'Rusty Shortsword', 'consumer', 6, 'Blade', Sword, BRONZE),
  item('oak-buckler', 'Oak Buckler', 'consumer', 8, 'Shield', Shield, PARCHMENT),
  item('woodcutter-axe', "Woodcutter's Axe", 'consumer', 9, 'Axe', Axe, IRON),
  item('smith-hammer', "Smith's Hammer", 'industrial', 22, 'Tool', Hammer, STEEL),
  item('deepvein-pick', 'Deepvein Pickaxe', 'industrial', 26, 'Tool', Pickaxe, BRONZE),
  item('twin-ember-blades', 'Twin Ember Blades', 'milspec', 64, 'Blade', Swords, EMBER),
  item('bulwark-of-cinders', 'Bulwark of Cinders', 'milspec', 72, 'Shield', ShieldHalf, EMBER),
  item('runed-anvil', 'Runed Anvil', 'restricted', 185, 'Relic', Anvil, STEEL),
  item('dragonfire-torch', 'Dragonfire Torch', 'restricted', 210, 'Relic', Flame, EMBER),
  item('forge-king-crown', 'Crown of the Forge King', 'classified', 640, 'Crown', Crown, GOLD),
  item('heart-of-the-mountain', 'Heart of the Mountain', 'covert', 2400, 'Gem', Gem, EMBER),

  // ── Arcane Reliquary ────────────────────────────────────────
  item('apprentice-scroll', 'Apprentice Scroll', 'consumer', 14, 'Scroll', ScrollText, PARCHMENT),
  item('minor-mana-flask', 'Minor Mana Flask', 'consumer', 16, 'Potion', FlaskConical, SKY),
  item('owl-quill', 'Owl Feather Quill', 'consumer', 18, 'Tool', Feather, BONE),
  item('moonleaf', 'Moonleaf Sprig', 'industrial', 42, 'Herb', Leaf, VERDANT),
  item('orbiting-wisp', 'Orbiting Wisp', 'industrial', 48, 'Familiar', Orbit, ARCANE),
  item('grimoire-of-sparks', 'Grimoire of Sparks', 'milspec', 120, 'Tome', BookOpen, ARCANE),
  item('chrono-glass', 'Chrono Sandglass', 'milspec', 135, 'Relic', Hourglass, GOLD),
  item('wand-of-starfall', 'Wand of Starfall', 'restricted', 380, 'Wand', WandSparkles, MOON),
  item('all-seeing-eye', 'All-Seeing Eye', 'restricted', 420, 'Relic', Eye, ARCANE),
  item('lunar-sigil', 'Lunar Sigil', 'classified', 1250, 'Sigil', MoonStar, MOON),
  item('prism-of-infinity', 'Prism of Infinity', 'covert', 5200, 'Artifact', Sparkles, ROSE),

  // ── Abyssal Coffer ──────────────────────────────────────────
  item('tidepool-shell', 'Tidepool Shell', 'consumer', 28, 'Curio', Shell, CORAL),
  item('barnacled-anchor', 'Barnacled Anchor', 'consumer', 32, 'Salvage', Anchor, IRON),
  item('glimmerfin', 'Glimmerfin', 'consumer', 30, 'Catch', Fish, SEA),
  item('drowned-compass', 'Drowned Compass', 'industrial', 82, 'Tool', Compass, BRONZE),
  item('galleon-in-a-bottle', 'Galleon in a Bottle', 'industrial', 95, 'Curio', Ship, SEA),
  item('tidecaller-charm', 'Tidecaller Charm', 'milspec', 240, 'Charm', Waves, SEA),
  item('pearls-of-the-deep', 'Pearls of the Deep', 'milspec', 265, 'Gem', Droplets, MOON),
  item('drowned-king-skull', "Drowned King's Skull", 'restricted', 760, 'Relic', Skull, BONE),
  item('lockers-key', "Key to the Locker", 'restricted', 820, 'Key', KeyRound, ABYSS),
  item('leviathan-scale', 'Leviathan Scale', 'classified', 2600, 'Armor', Hexagon, ABYSS),
  item('abyssal-heart', 'Abyssal Heart', 'covert', 9800, 'Gem', Diamond, ABYSS),

  // ── Celestial Vault ─────────────────────────────────────────
  item('stardust-pouch', 'Stardust Pouch', 'industrial', 160, 'Curio', Star, GOLD),
  item('storm-shard', 'Storm Shard', 'industrial', 175, 'Shard', Zap, SKY),
  item('sun-medallion', 'Sun Medallion', 'milspec', 420, 'Amulet', Sun, DAWN),
  item('zephyr-charm', 'Zephyr Charm', 'milspec', 450, 'Charm', Wind, SKY),
  item('halo-of-dawn', 'Halo of Dawn', 'restricted', 1300, 'Relic', Sunrise, DAWN),
  item('phoenix-plume', 'Phoenix Plume', 'restricted', 1450, 'Plume', Bird, EMBER),
  item('star-crown', 'Starforged Crown', 'classified', 4400, 'Crown', Crown, SKY),
  item('astral-astrolabe', 'Astral Astrolabe', 'classified', 4800, 'Relic', Telescope, MOON),
  item('eternal-star', 'Eternal Star', 'covert', 16000, 'Artifact', Sparkle, DAWN),
]

export const ITEMS: Record<string, Item> = Object.fromEntries(ITEM_LIST.map((i) => [i.id, i]))

export function getItem(id: string): Item | undefined {
  return ITEMS[id]
}
