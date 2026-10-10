import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function readStorage<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return validate(parsed) ? parsed : fallback
  } catch {
    // Storage disabled, quota errors or corrupt JSON — start fresh.
    return fallback
  }
}

/**
 * `useState` backed by localStorage. Reads once on mount, validates the stored
 * shape, and silently degrades to in-memory state when storage is unavailable.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, validate))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore — persistence is a convenience, not a requirement.
    }
  }, [key, value])

  return [value, setValue]
}
