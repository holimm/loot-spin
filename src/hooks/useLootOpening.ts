import { useCallback, useEffect, useRef, useState } from 'react'
import { rollPrize } from '../lib/prizes'
import { secureRandom } from '../lib/random'
import { buildIdleStrip, buildSpinStrip, type RestPosition, type SpinPlan } from '../lib/roulette'
import type { Prize, StripEntry } from '../types'

export type OpeningPhase = 'idle' | 'spinning' | 'revealed'

interface OpeningState {
  phase: OpeningPhase
  strip: StripEntry[]
  rest: RestPosition
  /** The latest spin; the strip animates it once while `phase` is "spinning". */
  plan: SpinPlan | null
  winner: Prize | null
}

function idleState(prizes: Prize[]): OpeningState {
  const { strip, rest } = buildIdleStrip(prizes, secureRandom)
  return { phase: 'idle', strip, rest, plan: null, winner: null }
}

let spinSeq = 0

/**
 * Loot box state machine: idle → spinning → revealed → spinning…
 * The prize is drawn *before* the strip is built, and the strip is built so
 * that prize sits exactly at the landing index.
 */
export function useLootOpening(prizes: Prize[], onReveal: (prize: Prize) => void) {
  const [state, setState] = useState(() => idleState(prizes))
  // Mirror of `state` so a double tap is rejected before React re-renders.
  const stateRef = useRef(state)
  const onRevealRef = useRef(onReveal)

  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  const commit = useCallback((next: OpeningState) => {
    stateRef.current = next
    setState(next)
  }, [])

  // Rebuild the idle strip when the set of enabled prizes changes (not on renames).
  const activeKey = prizes.map((p) => p.id).join(',')
  const lastKey = useRef(activeKey)
  useEffect(() => {
    if (lastKey.current === activeKey) return
    lastKey.current = activeKey
    if (stateRef.current.phase !== 'spinning') commit(idleState(prizes))
  }, [activeKey, prizes, commit])

  /** Starts an opening. Returns the drawn prize, or null if busy or nothing is enabled. */
  const open = useCallback((): Prize | null => {
    const current = stateRef.current
    if (current.phase === 'spinning') return null
    const winner = rollPrize(prizes)
    if (!winner) return null

    const { strip, from, to } = buildSpinStrip(prizes, winner, current.strip, current.rest, secureRandom)
    spinSeq += 1
    commit({ phase: 'spinning', strip, rest: to, plan: { id: spinSeq, from, to }, winner })
    return winner
  }, [prizes, commit])

  /** Called by the strip when the animation for `spinId` has landed. */
  const settle = useCallback(
    (spinId: number) => {
      const current = stateRef.current
      if (current.phase !== 'spinning' || current.plan?.id !== spinId || !current.winner) return
      commit({ ...current, phase: 'revealed' })
      onRevealRef.current(current.winner)
    },
    [commit],
  )

  return { ...state, open, settle }
}
