import { useCallback } from 'react'
import { MAX_NAME_LENGTH, MAX_WEIGHT } from '../data/prizes'
import { defaultSettings, sanitizeSettings } from '../lib/prizes'
import type { PrizeConfig, PrizeId } from '../types'
import { usePersistentState } from './usePersistentState'

const STORAGE_KEY = 'loot-spin:prize-settings:v1'

export type PrizePatch = Partial<Pick<PrizeConfig, 'name' | 'weight' | 'enabled'>>

/** Adult-editable prize settings, persisted in localStorage. */
export function usePrizeSettings() {
  const [settings, setSettings] = usePersistentState(STORAGE_KEY, defaultSettings(), sanitizeSettings)

  const updatePrize = useCallback(
    (id: PrizeId, patch: PrizePatch) => {
      setSettings((current) => ({
        ...current,
        prizes: current.prizes.map((p) => {
          if (p.id !== id) return p
          const next = { ...p, ...patch }
          next.name = next.name.slice(0, MAX_NAME_LENGTH)
          next.weight = Math.min(MAX_WEIGHT, Math.max(0, Math.round(next.weight) || 0))
          return next
        }),
      }))
    },
    [setSettings],
  )

  const reset = useCallback(() => setSettings(defaultSettings()), [setSettings])

  return { settings, updatePrize, reset }
}
