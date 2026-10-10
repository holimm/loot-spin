import type { Prize, PrizeId, StripEntry } from '../types'
import { pickOne, randomInt, type Rng } from './random'

/** Cards kept on each side of the resting card so a new spin starts seamlessly. */
const CARRY_RADIUS = 8
/** How many cards the strip travels past before landing. */
const MIN_TRAVEL = 46
const MAX_TRAVEL = 54
/** Cards rendered after the winner so the strip never shows empty space. */
const TAIL = 8
const IDLE_LENGTH = 2 * CARRY_RADIUS + 1

/** Max distance (as a fraction of card width) the marker may land from card center. */
export const LANDING_SPREAD = 0.36

export const SPIN_DURATION_MS = 6200
/** Fast launch, long deceleration — the classic case-opening feel. */
export const SPIN_EASING = 'cubic-bezier(0.08, 0.62, 0.1, 1)'

/** Where the strip is resting: the index under the marker and its offset from card center. */
export interface RestPosition {
  index: number
  offset: number
}

export interface SpinPlan {
  id: number
  from: RestPosition
  to: RestPosition
}

let keySeq = 0
function entry(id: PrizeId): StripEntry {
  keySeq += 1
  return { key: `c${keySeq}`, id }
}

/**
 * Filler cards are picked evenly from the enabled prizes, NOT by weight, so
 * kids can't guess the odds from how often a prize scrolls by. Only the
 * winning card is drawn with the real weights.
 */
function filler(prizes: Prize[], rng: Rng): StripEntry {
  return entry(pickOne(rng, prizes).id)
}

export function buildIdleStrip(prizes: Prize[], rng: Rng): { strip: StripEntry[]; rest: RestPosition } {
  const strip = prizes.length ? Array.from({ length: IDLE_LENGTH }, () => filler(prizes, rng)) : []
  return { strip, rest: { index: CARRY_RADIUS, offset: 0 } }
}

/**
 * Build the strip for a spin. The cards currently on screen are carried over
 * at the start so the animation begins exactly where the last one stopped,
 * and the predetermined `winner` is placed at the landing index.
 */
export function buildSpinStrip(
  prizes: Prize[],
  winner: Prize,
  current: StripEntry[],
  rest: RestPosition,
  rng: Rng,
): { strip: StripEntry[]; from: RestPosition; to: RestPosition } {
  const carryStart = Math.max(0, rest.index - CARRY_RADIUS)
  const carried = current.slice(carryStart, rest.index + CARRY_RADIUS + 1)
  // An empty strip (no prizes were enabled before) starts from its first card.
  const fromIndex = carried.length ? rest.index - carryStart : 0
  const winIndex = fromIndex + randomInt(rng, MIN_TRAVEL, MAX_TRAVEL)

  const strip: StripEntry[] = [...carried]
  while (strip.length < winIndex) strip.push(filler(prizes, rng))
  strip.push(entry(winner.id))
  for (let i = 0; i < TAIL; i += 1) strip.push(filler(prizes, rng))

  const offset = (rng() * 2 - 1) * LANDING_SPREAD
  return {
    strip,
    from: { index: fromIndex, offset: carried.length ? rest.offset : 0 },
    to: { index: winIndex, offset },
  }
}

/**
 * Horizontal translation (px) that puts `position` under the center marker.
 * `offset` shifts the landing point within the card, in card widths.
 */
export function translateFor(position: RestPosition, viewportWidth: number, cardWidth: number, gap: number): number {
  const cardCenter = position.index * (cardWidth + gap) + cardWidth / 2
  return viewportWidth / 2 - (cardCenter + position.offset * cardWidth)
}
