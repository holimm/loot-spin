import { useCallback, useEffect, useRef, useState } from 'react'
import { getCase } from '../data/cases'
import { secureRandom } from '../lib/random'
import { rollReward } from '../lib/rewards'
import { buildIdleStrip, buildSpinStrip, type RestPosition, type SpinPlan } from '../lib/roulette'
import type { Item, LootCase, StripEntry } from '../types'

export type OpeningPhase = 'idle' | 'spinning' | 'revealed'

export interface OpeningState {
  caseId: string
  strip: StripEntry[]
  rest: RestPosition
  /** The latest spin; the roulette animates it once while `phase` is "spinning". */
  spin: SpinPlan | null
  phase: OpeningPhase
  winner: Item | null
}

function idleState(lootCase: LootCase): OpeningState {
  const { strip, rest } = buildIdleStrip(lootCase, secureRandom)
  return { caseId: lootCase.id, strip, rest, spin: null, phase: 'idle', winner: null }
}

let spinSeq = 0

/**
 * Case-opening state machine: idle → spinning → revealed → (spinning | idle).
 * The reward is rolled *before* the strip is built, and the strip is built so
 * the winner sits exactly at the landing index.
 */
export function useCaseOpening(
  initialCase: LootCase,
  onReveal: (item: Item, lootCase: LootCase) => void,
) {
  const [state, setState] = useState(() => idleState(initialCase))
  // Mirror of `state` so callbacks stay stable and double-clicks are rejected
  // synchronously, before React re-renders.
  const stateRef = useRef(state)
  const onRevealRef = useRef(onReveal)

  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  const commit = useCallback((next: OpeningState) => {
    stateRef.current = next
    setState(next)
  }, [])

  /** Starts a spin. Returns the predetermined winner, or null if one is already running. */
  const open = useCallback(
    (lootCase: LootCase): Item | null => {
      const current = stateRef.current
      if (current.phase === 'spinning') return null

      const winner = rollReward(lootCase)
      const { strip, from, to } = buildSpinStrip(lootCase, winner, current.strip, current.rest, secureRandom)
      spinSeq += 1
      commit({
        caseId: lootCase.id,
        strip,
        rest: to,
        spin: { id: spinSeq, from, to },
        phase: 'spinning',
        winner,
      })
      return winner
    },
    [commit],
  )

  /** Called by the roulette when the spin animation for `spinId` has landed. */
  const settle = useCallback(
    (spinId: number) => {
      const current = stateRef.current
      if (current.phase !== 'spinning' || current.spin?.id !== spinId || !current.winner) return
      commit({ ...current, phase: 'revealed' })
      onRevealRef.current(current.winner, getCase(current.caseId))
    },
    [commit],
  )

  /** Shows a fresh idle strip for another case. Ignored mid-spin. */
  const reset = useCallback(
    (lootCase: LootCase) => {
      if (stateRef.current.phase === 'spinning') return
      commit(idleState(lootCase))
    },
    [commit],
  )

  return { ...state, open, settle, reset }
}
