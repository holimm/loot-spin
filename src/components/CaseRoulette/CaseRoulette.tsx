import { memo, useEffect, useLayoutEffect, useRef, type Ref } from 'react'
import type { OpeningPhase } from '../../hooks/useCaseOpening'
import {
  SPIN_DURATION_MS,
  SPIN_EASING,
  translateFor,
  type RestPosition,
  type SpinPlan,
} from '../../lib/roulette'
import type { StripEntry } from '../../types'
import { RewardCard } from '../RewardCard/RewardCard'

interface CaseRouletteProps {
  strip: StripEntry[]
  rest: RestPosition
  spin: SpinPlan | null
  phase: OpeningPhase
  reducedMotion: boolean
  onSettled: (spinId: number) => void
  ref?: Ref<HTMLElement>
}

const REDUCED_MOTION_DELAY_MS = 350

/**
 * Horizontal reward strip. Movement is driven imperatively through the Web
 * Animations API on a ref, so React renders once per spin — not per frame.
 * Geometry is measured at spin time, so landing is exact at any screen width.
 */
export const CaseRoulette = memo(function CaseRoulette({
  strip,
  rest,
  spin,
  phase,
  reducedMotion,
  onSettled,
  ref,
}: CaseRouletteProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false)
  // Latest values for use inside effects without re-triggering them.
  const latest = useRef({ rest, phase, reducedMotion, onSettled })
  useLayoutEffect(() => {
    latest.current = { rest, phase, reducedMotion, onSettled }
  })

  // Position or animate whenever a new strip / spin arrives.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const measure = (pos: RestPosition) => {
      const card = track.firstElementChild as HTMLElement | null
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
      return translateFor(pos, viewport.clientWidth, card?.offsetWidth ?? 0, gap)
    }
    const px = (x: number) => `translate3d(${x}px, 0, 0)`
    const { phase: currentPhase, reducedMotion: reduce } = latest.current

    if (!spin || currentPhase !== 'spinning') {
      track.style.transform = px(measure(latest.current.rest))
      return
    }

    const from = px(measure(spin.from))
    const to = px(measure(spin.to))

    if (reduce) {
      track.style.transform = to
      const timer = window.setTimeout(() => latest.current.onSettled(spin.id), REDUCED_MOTION_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    track.style.transform = from
    animatingRef.current = true
    const animation = track.animate([{ transform: from }, { transform: to }], {
      duration: SPIN_DURATION_MS,
      easing: SPIN_EASING,
      fill: 'forwards',
    })
    animation.onfinish = () => {
      animatingRef.current = false
      // Re-measure in case the viewport was resized mid-spin, then drop the fill.
      track.style.transform = px(measure(spin.to))
      animation.cancel()
      latest.current.onSettled(spin.id)
    }
    return () => {
      animation.onfinish = null
      animation.cancel()
      animatingRef.current = false
    }
    // `spin` keeps its identity when the phase moves to "revealed", so this runs
    // exactly once per spin; phase is read from `latest` to avoid restarting it.
  }, [strip, spin])

  // Keep the resting card centered when the layout width changes.
  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const observer = new ResizeObserver(() => {
      if (animatingRef.current || latest.current.phase === 'spinning') return
      const card = track.firstElementChild as HTMLElement | null
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
      const x = translateFor(latest.current.rest, viewport.clientWidth, card?.offsetWidth ?? 0, gap)
      track.style.transform = `translate3d(${x}px, 0, 0)`
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const landed = phase === 'revealed'

  return (
    <section
      ref={ref}
      aria-label="Reward roulette"
      aria-busy={phase === 'spinning'}
      className="frame-double relative scroll-mt-24 bg-ink-950/70 [--card-gap:0.625rem] [--card-w:6.75rem] sm:[--card-w:9.25rem] lg:[--card-w:10.25rem]"
    >
      <div
        ref={viewportRef}
        className="relative overflow-hidden py-5 sm:py-6"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
        }}
      >
        <div ref={trackRef} className="flex w-max gap-(--card-gap) will-change-transform">
          {strip.map((entry, index) => (
            <RewardCard
              key={entry.key}
              item={entry.item}
              variant="strip"
              state={!landed ? 'normal' : index === rest.index ? 'winner' : 'dimmed'}
            />
          ))}
        </div>
      </div>

      {/* Center marker */}
      <div className="pointer-events-none absolute inset-y-2 left-1/2 z-20 -translate-x-1/2" aria-hidden="true">
        <div className="absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-linear-to-b from-gold-200 via-gold-400 to-gold-200 shadow-[0_0_14px_2px_rgba(233,201,124,0.55)]" />
        <div className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[9px] border-t-[12px] border-x-transparent border-t-gold-300 drop-shadow-[0_0_6px_rgba(233,201,124,0.7)]" />
        <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[9px] border-b-[12px] border-x-transparent border-b-gold-300 drop-shadow-[0_0_6px_rgba(233,201,124,0.7)]" />
      </div>
    </section>
  )
})
