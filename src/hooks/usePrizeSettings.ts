import { useCallback } from 'react'
import { MAX_CUSTOM_PRIZES, MAX_NAME_LENGTH, MAX_WEIGHT } from '../data/prizes'
import { createCustomPrize, defaultSettings, isValidImage, sanitizeSettings, type NewPrizeInput } from '../lib/prizes'
import type { PrizeConfig, PrizeId } from '../types'
import { usePersistentState } from './usePersistentState'

/** Same key as before: version 1 data stored here is migrated on load. */
const STORAGE_KEY = 'loot-spin:prize-settings:v1'

export type PrizePatch = Partial<Pick<PrizeConfig, 'name' | 'weight' | 'enabled' | 'image'>>

/** Editable prize settings, persisted in localStorage. */
export function usePrizeSettings() {
  const [settings, setSettings, saveFailed] = usePersistentState(STORAGE_KEY, defaultSettings(), sanitizeSettings)

  const updatePrize = useCallback(
    (id: PrizeId, patch: PrizePatch) => {
      setSettings((current) => ({
        ...current,
        prizes: current.prizes.map((p) => {
          if (p.id !== id) return p
          const next = { ...p, ...patch }
          next.name = next.name.slice(0, MAX_NAME_LENGTH)
          next.weight = Math.min(MAX_WEIGHT, Math.max(0, Math.round(next.weight) || 0))
          // Only user-added prizes carry their own photo.
          if (!p.custom) delete next.image
          else if (next.image !== null && !isValidImage(next.image)) next.image = p.image ?? null
          return next
        }),
      }))
    },
    [setSettings],
  )

  /** Adds a user prize and returns its id, or null when the limit is reached. */
  const addPrize = useCallback(
    (input: NewPrizeInput): PrizeId | null => {
      if (settings.prizes.filter((p) => p.custom).length >= MAX_CUSTOM_PRIZES) return null
      const prize = createCustomPrize(input, settings.prizes)
      setSettings((current) => ({ ...current, prizes: [...current.prizes, prize] }))
      return prize.id
    },
    [settings.prizes, setSettings],
  )

  /**
   * Deletes a prize. User-added prizes are dropped for good (photo included);
   * built-in prizes are marked removed so they can be restored later.
   */
  const removePrize = useCallback(
    (id: PrizeId) =>
      setSettings((current) => ({
        ...current,
        prizes: current.prizes
          .filter((p) => !(p.custom && p.id === id))
          .map((p) => (p.id === id && !p.custom ? { ...p, removed: true } : p)),
      })),
    [setSettings],
  )

  /** Brings back a deleted built-in prize with its previous name and weight. */
  const restorePrize = useCallback(
    (id: PrizeId) =>
      setSettings((current) => ({
        ...current,
        prizes: current.prizes.map((p) => {
          if (p.id !== id) return p
          const { removed: _removed, ...rest } = p
          return rest
        }),
      })),
    [setSettings],
  )

  const reset = useCallback(() => setSettings(defaultSettings()), [setSettings])

  return { settings, saveFailed, updatePrize, addPrize, removePrize, restorePrize, reset }
}
