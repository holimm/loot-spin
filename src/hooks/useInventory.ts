import { useCallback } from 'react'
import { getItem } from '../data/items'
import type { InventoryEntry } from '../types'
import { usePersistentState } from './usePersistentState'

const STORAGE_KEY = 'loot-spin:inventory:v1'
const MAX_ENTRIES = 500

function isInventory(value: unknown): value is InventoryEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (e) =>
        typeof e === 'object' &&
        e !== null &&
        typeof e.uid === 'string' &&
        typeof e.itemId === 'string' &&
        typeof e.caseId === 'string' &&
        typeof e.obtainedAt === 'number' &&
        getItem(e.itemId) !== undefined,
    )
  )
}

let uidSeq = 0

/** Demo inventory — client-side only, not a trustworthy record of rewards. */
export function useInventory() {
  const [entries, setEntries] = usePersistentState<InventoryEntry[]>(STORAGE_KEY, [], isInventory)

  const add = useCallback(
    (itemId: string, caseId: string) => {
      uidSeq += 1
      const entry: InventoryEntry = {
        uid: `${Date.now().toString(36)}-${uidSeq}`,
        itemId,
        caseId,
        obtainedAt: Date.now(),
      }
      setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES))
    },
    [setEntries],
  )

  const clear = useCallback(() => setEntries([]), [setEntries])

  return { entries, add, clear }
}
