import type { CreateTypes } from 'canvas-confetti'
import type { CelebrationTier } from '../types'

const COLORS = ['#ff5c8d', '#ffd23f', '#4cc9f0', '#7bd389', '#b983ff', '#ff9f1c']
const BIG_DURATION_MS = 2600

/**
 * Fire confetti sized to the prize's rarity. Returns a function that stops
 * any ongoing effect.
 */
export function celebrate(fire: CreateTypes, tier: CelebrationTier): () => void {
  let frame = 0
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 0 }

  switch (tier) {
    case 'gentle':
      // "Better luck next time": an encouraging message, no confetti.
      break
    case 'small':
      fire({ ...base, particleCount: 90, spread: 80, startVelocity: 42, origin: { y: 0.6 } })
      break
    case 'medium':
      fire({ ...base, particleCount: 110, spread: 70, angle: 60, startVelocity: 55, origin: { x: 0, y: 0.75 } })
      fire({ ...base, particleCount: 110, spread: 70, angle: 120, startVelocity: 55, origin: { x: 1, y: 0.75 } })
      fire({ ...base, particleCount: 60, spread: 360, startVelocity: 30, shapes: ['star'], scalar: 1.3, origin: { y: 0.45 } })
      break
    case 'big': {
      fire({ ...base, particleCount: 200, spread: 360, startVelocity: 45, shapes: ['star', 'circle'], scalar: 1.4, origin: { y: 0.45 } })
      // Continuous side cannons for a couple of seconds.
      const end = performance.now() + BIG_DURATION_MS
      const loop = () => {
        fire({ ...base, particleCount: 7, angle: 60, spread: 60, startVelocity: 60, origin: { x: 0, y: 0.8 } })
        fire({ ...base, particleCount: 7, angle: 120, spread: 60, startVelocity: 60, origin: { x: 1, y: 0.8 } })
        if (performance.now() < end) frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
      break
    }
  }

  return () => {
    cancelAnimationFrame(frame)
    fire.reset()
  }
}
