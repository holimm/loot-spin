export type PrizeId =
  | 'banh'
  | 'chuc-may-man'
  | 'dung-cu-hoc-tap'
  | 'moc-khoa'
  | 'lego'
  | 'luot-quay'
  | 'gau-bong'
  | 'cong-diem'

/** Prize behaviour beyond "show the prize". */
export type PrizeEffect = 'extra-spin' | 'better-luck'

/** The editable part of a prize, as stored in localStorage. */
export interface PrizeConfig {
  id: PrizeId
  name: string
  /** Relative weight; chance = weight / total of enabled weights. */
  weight: number
  enabled: boolean
}

export interface PrizeSettings {
  version: 1
  prizes: PrizeConfig[]
}

/** A prize ready to draw: settings merged with its fixed image, color and effect. */
export interface Prize extends PrizeConfig {
  image: string
  color: string
  effect?: PrizeEffect
  /** Probability in [0, 1] among enabled prizes. */
  chance: number
}

/** One card in the roulette strip. `key` is unique per strip position. */
export interface StripEntry {
  key: string
  id: PrizeId
}

/** Size of the reveal celebration. */
export type CelebrationTier = 'gentle' | 'small' | 'medium' | 'big'
