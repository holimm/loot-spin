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
 * sees fit). Silently degrades to in-memory state when storage is unavailable.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  parse: (value: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, parse))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore — persistence is a convenience, not a requirement.
    }
  }, [key, value])

  return [value, setValue]
}
