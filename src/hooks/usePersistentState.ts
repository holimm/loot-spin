import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function readStorage<T>(key: string, fallback: T, parse: (value: unknown) => T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return parse(JSON.parse(raw))
  } catch {
    // Storage disabled, quota errors or corrupt JSON — start from the fallback.
    return fallback
  }
}

/**
 * `useState` backed by localStorage. Reads once on mount and passes the stored
 * value through `parse`, which must return a valid value (falling back as it
 * sees fit). Degrades to in-memory state when storage is unavailable; the
 * third value is true while the latest value could not be saved (e.g. storage
 * full), so the UI can warn.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  parse: (value: unknown) => T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, parse))
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    let failed = false
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      failed = true
    }
    // Reports the outcome of the external write above; React bails out when unchanged.
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveFailed(failed)
  }, [key, value])

  return [value, setValue, saveFailed]
}
