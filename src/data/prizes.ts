import banh from '../assets/banh.webp'
import chucMayMan from '../assets/chuc-may-man.webp'
import congDiem from '../assets/cong-diem.webp'
import dungCuHocTap from '../assets/dung-cu-hoc-tap.webp'
import gauBong from '../assets/gau-bong.webp'
import lego from '../assets/lego.webp'
import luotQuay from '../assets/luot-quay.webp'
import mocKhoa from '../assets/moc-khoa.webp'
import type { PrizeConfig, PrizeEffect, PrizeId } from '../types'

/** Default prizes and weights. Weights are relative, not percentages. */
export const DEFAULT_PRIZES: readonly PrizeConfig[] = [
  { id: 'banh', name: 'Bánh', weight: 40, enabled: true },
  { id: 'chuc-may-man', name: 'Chúc may mắn', weight: 30, enabled: true },
  { id: 'dung-cu-hoc-tap', name: 'Dụng cụ học tập', weight: 30, enabled: true },
  { id: 'moc-khoa', name: 'Móc khóa', weight: 20, enabled: true },
  { id: 'lego', name: 'Lego', weight: 20, enabled: true },
  { id: 'luot-quay', name: 'Lượt quay', weight: 20, enabled: true },
  { id: 'gau-bong', name: 'Gấu bông', weight: 10, enabled: true },
  { id: 'cong-diem', name: 'Cộng điểm', weight: 10, enabled: true },
]

export const PRIZE_IDS: readonly PrizeId[] = DEFAULT_PRIZES.map((p) => p.id)

/**
 * Fixed per-prize data. Images are bound to the prize id, never its name,
 * so renaming a prize in settings can't break its picture.
 */
export const PRIZE_ASSETS: Record<PrizeId, { image: string; color: string; effect?: PrizeEffect }> = {
  banh: { image: banh, color: '#ff9f1c' },
  'chuc-may-man': { image: chucMayMan, color: '#4cc9f0', effect: 'better-luck' },
  'dung-cu-hoc-tap': { image: dungCuHocTap, color: '#7bd389' },
  'moc-khoa': { image: mocKhoa, color: '#b983ff' },
  lego: { image: lego, color: '#ff6b6b' },
  'luot-quay': { image: luotQuay, color: '#ffd23f', effect: 'extra-spin' },
  'gau-bong': { image: gauBong, color: '#ff8fc7' },
  'cong-diem': { image: congDiem, color: '#3a86ff' },
}

export const MAX_WEIGHT = 999
export const MAX_NAME_LENGTH = 24

export function defaultPrize(id: PrizeId): PrizeConfig {
  const found = DEFAULT_PRIZES.find((p) => p.id === id)
  if (!found) throw new Error(`Unknown prize "${id}"`)
  return { ...found }
}
