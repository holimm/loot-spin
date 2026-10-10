import { useCallback } from 'react'
import { usePersistentState } from './usePersistentState'

const STORAGE_KEY = 'loot-spin:tokens:v1'
export const STARTING_TOKENS = 5000

const isBalance = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

/** Mock token balance. Tokens are free, have no value and can be refilled at any time. */
export function useDemoWallet() {
  const [balance, setBalance] = usePersistentState(STORAGE_KEY, STARTING_TOKENS, isBalance)

  const spend = useCallback(
    (amount: number) => setBalance((b) => Math.max(0, b - amount)),
    [setBalance],
  )
  const refill = useCallback(() => setBalance(STARTING_TOKENS), [setBalance])

  return { balance, spend, refill }
}
