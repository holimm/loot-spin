import { useCallback, useEffect } from 'react'
import { setMuted } from '../lib/sound'
import { usePersistentState } from './usePersistentState'

const STORAGE_KEY = 'loot-spin:sound:v1'

const parseEnabled = (value: unknown): boolean => (typeof value === 'boolean' ? value : true)

/** Sound on/off, remembered in localStorage (default: on). */
export function useSoundSetting() {
  const [enabled, setEnabled] = usePersistentState(STORAGE_KEY, true, parseEnabled)

  useEffect(() => {
    setMuted(!enabled)
  }, [enabled])

  const toggle = useCallback(() => setEnabled((on) => !on), [setEnabled])
  return { soundOn: enabled, toggleSound: toggle }
}
