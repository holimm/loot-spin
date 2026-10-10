/** A source of uniformly distributed numbers in [0, 1). */
export type Rng = () => number

const buffer = new Uint32Array(1)

/** Uses the Web Crypto API when available; falls back to Math.random. */
export const secureRandom: Rng = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(buffer)
    return buffer[0] / 0x1_0000_0000
  }
  return Math.random()
}

/** Small deterministic PRNG — used for reproducible mock data. */
export function seededRandom(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x1_0000_0000
  }
}

export function randomInt(rng: Rng, min: number, maxInclusive: number): number {
  return min + Math.floor(rng() * (maxInclusive - min + 1))
}

export function pickOne<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]
}

export function pickWeighted<T>(rng: Rng, entries: readonly { value: T; weight: number }[]): T {
  const total = entries.reduce((sum, e) => sum + e.weight, 0)
  let roll = rng() * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll < 0) return entry.value
  }
  return entries[entries.length - 1].value
}
