import { useCallback, useEffect, useState } from 'react'
import { CASES } from '../data/cases'
import { RARITIES } from '../data/rarities'
import { DEMO_USERS, RECENT_DROPS_LIMIT, RECENT_DROPS_SEED } from '../data/recentDrops'
import { pickOne, randomInt, seededRandom, type Rng } from '../lib/random'
import { rollReward } from '../lib/rewards'
import type { Drop, Item } from '../types'

let dropSeq = 0

/** Mock drop: keeps the rarer of two rolls so the feed stays lively. */
function simulateDrop(rng: Rng, at: number): Drop {
  const lootCase = pickOne(rng, CASES)
  const a = rollReward(lootCase, rng)
  const b = rollReward(lootCase, rng)
  const item = RARITIES[a.rarity].rank >= RARITIES[b.rarity].rank ? a : b
  dropSeq += 1
  return { id: `d${dropSeq}`, user: pickOne(rng, DEMO_USERS), item, caseName: lootCase.name, at }
}

function initialDrops(): Drop[] {
  const rng = seededRandom(RECENT_DROPS_SEED)
  const now = Date.now()
  let at = now
  return Array.from({ length: RECENT_DROPS_LIMIT }, () => {
    at -= randomInt(rng, 6, 48) * 1000
    return simulateDrop(rng, at)
  })
}

/** Client-side simulation of a live feed — no backend involved. */
export function useRecentDrops() {
  const [state, setState] = useState(() => ({ drops: initialDrops(), now: Date.now() }))

  useEffect(() => {
    let timer: number
    const tick = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) {
          const now = Date.now()
          setState((s) => ({
            drops: [simulateDrop(Math.random, now), ...s.drops].slice(0, RECENT_DROPS_LIMIT),
            now,
          }))
        }
        tick()
      }, randomInt(Math.random, 3500, 7000))
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [])

  const addOwnDrop = useCallback((item: Item, caseName: string) => {
    const now = Date.now()
    dropSeq += 1
    const drop: Drop = { id: `d${dropSeq}`, user: 'You', item, caseName, at: now, isOwn: true }
    setState((s) => ({ drops: [drop, ...s.drops].slice(0, RECENT_DROPS_LIMIT), now }))
  }, [])

  return { drops: state.drops, now: state.now, addOwnDrop }
}
