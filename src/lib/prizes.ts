import { DEFAULT_PRIZES, MAX_NAME_LENGTH, MAX_WEIGHT, PRIZE_ASSETS, PRIZE_IDS, defaultPrize } from '../data/prizes'
import type { CelebrationTier, Prize, PrizeConfig, PrizeId, PrizeSettings } from '../types'
import { pickWeighted, secureRandom, type Rng } from './random'

export function defaultSettings(): PrizeSettings {
  return { version: 1, prizes: DEFAULT_PRIZES.map((p) => ({ ...p })) }
}

const isPrizeId = (value: unknown): value is PrizeId =>
  typeof value === 'string' && (PRIZE_IDS as readonly string[]).includes(value)

function sanitizePrize(raw: unknown): PrizeConfig | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!isPrizeId(r.id)) return null
  const fallback = defaultPrize(r.id)
  const name = typeof r.name === 'string' && r.name.trim() ? r.name.trim().slice(0, MAX_NAME_LENGTH) : fallback.name
  const weight =
    typeof r.weight === 'number' && Number.isFinite(r.weight)
      ? Math.min(MAX_WEIGHT, Math.max(0, Math.round(r.weight)))
      : fallback.weight
  const enabled = typeof r.enabled === 'boolean' ? r.enabled : fallback.enabled
  return { id: r.id, name, weight, enabled }
}

/**
 * Turn whatever was in storage into valid settings. Bad fields fall back to
 * that prize's default, unknown prizes are dropped, missing prizes are
 * restored, and anything unrecognisable yields the full defaults.
 */
export function sanitizeSettings(raw: unknown): PrizeSettings {
  if (typeof raw !== 'object' || raw === null) return defaultSettings()
  const r = raw as Record<string, unknown>
  if (r.version !== 1 || !Array.isArray(r.prizes)) return defaultSettings()

  const byId = new Map<PrizeId, PrizeConfig>()
  for (const item of r.prizes) {
    const prize = sanitizePrize(item)
    if (prize && !byId.has(prize.id)) byId.set(prize.id, prize)
  }
  // Keep the default order so the wheel layout is stable.
  return { version: 1, prizes: PRIZE_IDS.map((id) => byId.get(id) ?? defaultPrize(id)) }
}

/** Display name; an empty name (mid-edit) shows the default instead. */
export function prizeName(config: PrizeConfig): string {
  return config.name.trim() || defaultPrize(config.id).name
}

/** Enabled prizes with weight > 0, with their chance among them. */
export function getActivePrizes(settings: PrizeSettings): Prize[] {
  const active = settings.prizes.filter((p) => p.enabled && p.weight > 0)
  const total = active.reduce((sum, p) => sum + p.weight, 0)
  return active.map((p) => ({ ...p, name: prizeName(p), ...PRIZE_ASSETS[p.id], chance: p.weight / total }))
}

/** Chance of a config row given the current settings (0 when disabled). */
export function chanceOf(settings: PrizeSettings, id: PrizeId): number {
  return getActivePrizes(settings).find((p) => p.id === id)?.chance ?? 0
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
