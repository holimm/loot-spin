import {
  CUSTOM_COLORS,
  CUSTOM_DEFAULT_NAME,
  CUSTOM_DEFAULT_WEIGHT,
  DEFAULT_PRIZES,
  MAX_CUSTOM_PRIZES,
  MAX_NAME_LENGTH,
  MAX_WEIGHT,
  PRIZE_ASSETS,
  PRIZE_IDS,
  defaultPrize,
  isBuiltInId,
} from '../data/prizes'
import type { CelebrationTier, Prize, PrizeConfig, PrizeSettings } from '../types'
import { pickWeighted, secureRandom, type Rng } from './random'

/** Largest stored image accepted (data URL length), to keep localStorage healthy. */
export const MAX_IMAGE_DATA_URL_LENGTH = 400_000

const CUSTOM_ID = /^custom-[a-z0-9]{4,32}$/
const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function defaultSettings(): PrizeSettings {
  return { version: 2, prizes: DEFAULT_PRIZES.map((p) => ({ ...p })) }
}

const clampWeight = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(MAX_WEIGHT, Math.max(0, Math.round(value))) : fallback

const cleanName = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, MAX_NAME_LENGTH) : fallback

export const isValidImage = (value: unknown): value is string =>
  typeof value === 'string' && /^data:image\/(webp|jpeg|png);base64,/.test(value) && value.length <= MAX_IMAGE_DATA_URL_LENGTH

function sanitizePrize(raw: unknown, customIndex: number): PrizeConfig | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string') return null

  if (isBuiltInId(r.id)) {
    const fallback = defaultPrize(r.id)
    return {
      id: r.id,
      name: cleanName(r.name, fallback.name),
      weight: clampWeight(r.weight, fallback.weight),
      enabled: typeof r.enabled === 'boolean' ? r.enabled : fallback.enabled,
      ...(r.removed === true ? { removed: true } : {}),
    }
  }

  if (!CUSTOM_ID.test(r.id)) return null
  return {
    id: r.id,
    custom: true,
    name: cleanName(r.name, CUSTOM_DEFAULT_NAME),
    weight: clampWeight(r.weight, CUSTOM_DEFAULT_WEIGHT),
    enabled: typeof r.enabled === 'boolean' ? r.enabled : true,
    // A missing or oversized photo falls back to the placeholder rather than dropping the prize.
    image: isValidImage(r.image) ? r.image : null,
    color: typeof r.color === 'string' && HEX_COLOR.test(r.color) ? r.color : CUSTOM_COLORS[customIndex % CUSTOM_COLORS.length],
  }
}

/**
 * Turn whatever was in storage into valid settings. Accepts version 1 (built-in
 * prizes only) and version 2 (with user-added prizes). Bad fields fall back to
 * defaults, invalid prizes are dropped, missing built-ins are restored, and
 * anything unrecognisable yields the full defaults.
 */
export function sanitizeSettings(raw: unknown): PrizeSettings {
  if (typeof raw !== 'object' || raw === null) return defaultSettings()
  const r = raw as Record<string, unknown>
  if ((r.version !== 1 && r.version !== 2) || !Array.isArray(r.prizes)) return defaultSettings()

  const builtIns = new Map<string, PrizeConfig>()
  const customs: PrizeConfig[] = []
  for (const item of r.prizes) {
    const prize = sanitizePrize(item, customs.length)
    if (!prize) continue
    if (prize.custom) {
      if (customs.length < MAX_CUSTOM_PRIZES && !customs.some((c) => c.id === prize.id)) customs.push(prize)
    } else if (!builtIns.has(prize.id)) {
      builtIns.set(prize.id, prize)
    }
  }
  // Built-ins keep the default order; user-added prizes follow in the order they were added.
  return { version: 2, prizes: [...PRIZE_IDS.map((id) => builtIns.get(id) ?? defaultPrize(id)), ...customs] }
}

/** Display name; an empty name (mid-edit) shows the default instead. */
export function prizeName(config: PrizeConfig): string {
  if (config.name.trim()) return config.name.trim()
  return isBuiltInId(config.id) ? defaultPrize(config.id).name : CUSTOM_DEFAULT_NAME
}

/** Image, color and effect for any prize, built-in or user-added. */
export function prizeLook(config: PrizeConfig): Pick<Prize, 'image' | 'color' | 'effect'> {
  if (isBuiltInId(config.id)) return PRIZE_ASSETS[config.id]
  return { image: config.image ?? null, color: config.color ?? CUSTOM_COLORS[0] }
}

/** Enabled, non-deleted prizes with weight > 0, with their chance among them. */
export function getActivePrizes(settings: PrizeSettings): Prize[] {
  const active = settings.prizes.filter((p) => !p.removed && p.enabled && p.weight > 0)
  const total = active.reduce((sum, p) => sum + p.weight, 0)
  return active.map((p) => ({ ...p, name: prizeName(p), ...prizeLook(p), chance: p.weight / total }))
}

export interface NewPrizeInput {
  name: string
  weight: number
  image: string | null
}

/** A new user-added prize, ready to append to the settings. */
export function createCustomPrize(input: NewPrizeInput, existing: PrizeConfig[], rng: Rng = secureRandom): PrizeConfig {
  const customCount = existing.filter((p) => p.custom).length
  const suffix = Math.floor(rng() * 36 ** 6).toString(36).padStart(6, '0')
  return {
    id: `custom-${Date.now().toString(36)}${suffix}`,
    custom: true,
    name: cleanName(input.name, CUSTOM_DEFAULT_NAME),
    weight: clampWeight(input.weight, CUSTOM_DEFAULT_WEIGHT),
    enabled: true,
    image: isValidImage(input.image) ? input.image : null,
    color: CUSTOM_COLORS[customCount % CUSTOM_COLORS.length],
  }
}

/** Draw a prize by weight. Returns null when nothing can be won. */
export function rollPrize(prizes: Prize[], rng: Rng = secureRandom): Prize | null {
  if (prizes.length === 0) return null
  return pickWeighted(
    rng,
    prizes.map((p) => ({ value: p, weight: p.weight })),
  )
}

/** Rarer prizes get bigger celebrations. Based on live odds, so it follows edits. */
export function celebrationTier(prize: Prize): CelebrationTier {
  if (prize.effect === 'better-luck') return 'gentle'
  if (prize.chance < 0.08) return 'big'
  if (prize.chance < 0.15) return 'medium'
  return 'small'
}

const percentFormat = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 1 })

export function formatPercent(chance: number): string {
  return percentFormat.format(chance)
}
