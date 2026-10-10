/** The prizes that ship with the app (bundled images). */
export type BuiltInPrizeId =
  | 'banh'
  | 'chuc-may-man'
  | 'dung-cu-hoc-tap'
  | 'moc-khoa'
  | 'lego'
  | 'luot-quay'
  | 'gau-bong'
  | 'cong-diem'

/** A built-in id, or `custom-…` for prizes added by the user. */
export type PrizeId = string

/** Prize behaviour beyond "show the prize". */
export type PrizeEffect = 'extra-spin' | 'better-luck'

/** The editable part of a prize, as stored in localStorage. */
export interface PrizeConfig {
  id: PrizeId
  name: string
  /** Relative weight; chance = weight / total of enabled weights. */
  weight: number
  enabled: boolean
  /** Added by the user rather than shipped with the app. */
  custom?: boolean
  /** Built-in prizes only: deleted from the list (kept so it can be restored). */
  removed?: boolean
  /** Custom prizes only: downscaled photo as a data URL, or null for the placeholder. */
  image?: string | null
  /** Custom prizes only: card and border color. */
  color?: string
}

export interface PrizeSettings {
  version: 2
  prizes: PrizeConfig[]
}

/** A prize ready to draw: settings merged with its image, color and effect. */
export interface Prize extends PrizeConfig {
  /** Image URL, or null to draw the gift-box placeholder. */
  image: string | null
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
