import { memo, useEffect, useLayoutEffect, useMemo, useRef, type Ref } from 'react'
import type { OpeningPhase } from '../../hooks/useLootOpening'
import { SPIN_DURATION_MS, SPIN_EASING, translateFor, type RestPosition, type SpinPlan } from '../../lib/roulette'
import type { Prize, PrizeId, StripEntry } from '../../types'
import { PrizeImage } from '../PrizeImage/PrizeImage'

interface LootStripProps {
  prizes: Prize[]
  strip: StripEntry[]
  rest: RestPosition
  plan: SpinPlan | null
  phase: OpeningPhase
  reducedMotion: boolean
  onSettled: (spinId: number) => void
  /** Called each time a new card passes the marker while the strip moves. */
  onTick?: () => void
  ref?: Ref<HTMLElement>
}

const REDUCED_MOTION_DELAY_MS = 300

const StripCard = memo(function StripCard({ prize, state }: { prize: Prize; state: 'normal' | 'winner' | 'dimmed' }) {
  const winner = state === 'winner'
  return (
    <div
      data-winner={winner || undefined}
      className={[
        'relative w-(--card-w) shrink-0 transition-[opacity,scale,filter] duration-500',
        winner ? 'z-10 scale-110' : '',
        state === 'dimmed' ? 'scale-95 opacity-40 saturate-50' : '',
      ].join(' ')}
    >
      {/* The glow is its own layer and pulses only its opacity, so the card (and its text)
          is never repainted while it pulses — repainting scaled text made it twitch. */}
      {winner && (
        <div
          className="absolute inset-0 animate-winner rounded-xl shadow-[0_0_0_5px_var(--color-sun),0_0_32px_10px_rgba(255,210,63,0.8)] sm:rounded-2xl"
          aria-hidden="true"
        />
      )}
      <div className="relative overflow-hidden rounded-xl border-[3px] border-white bg-white shadow-md sm:rounded-2xl sm:border-4">
        <PrizeImage image={prize.image} color={prize.color} className="aspect-square w-full rounded-lg sm:rounded-xl" />
        <p className="line-clamp-2 flex h-[2.6em] items-center justify-center px-1 text-center font-display text-[0.8rem] leading-[1.2] font-extrabold sm:px-1.5 sm:text-base">
          {prize.name}
        </p>
        <div className="h-1.5 sm:h-2" style={{ background: prize.color }} />
      </div>
    </div>
  )
})

/**
 * Counter-Strike style horizontal strip. Movement is driven imperatively with
 * the Web Animations API on a ref, so React renders once per opening — not
 * per frame. Geometry is measured at spin time, so landing is exact at any size.
 */
export const LootStrip = memo(function LootStrip({ prizes, strip, rest, plan, phase, reducedMotion, onSettled, onTick, ref }: LootStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false)
  const latest = useRef({ rest, phase, reducedMotion, onSettled, onTick })
  useLayoutEffect(() => {
    latest.current = { rest, phase, reducedMotion, onSettled, onTick }
  })

  const byId = useMemo(() => new Map<PrizeId, Prize>(prizes.map((p) => [p.id, p])), [prizes])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const measure = (pos: RestPosition) => {
      const card = track.firstElementChild as HTMLElement | null
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
      return translateFor(pos, viewport.clientWidth, card?.offsetWidth ?? 0, gap)
    }
    // Whole pixels: text resting on a fractional offset renders blurry and can shimmer.
    const px = (x: number) => `translate3d(${Math.round(x)}px, 0, 0)`
    const { phase: currentPhase, reducedMotion: reduce } = latest.current

    if (!plan || currentPhase !== 'spinning') {
      track.style.transform = px(measure(latest.current.rest))
      return
    }

    const from = px(measure(plan.from))
    const to = px(measure(plan.to))
    if (reduce) {
      track.style.transform = to
      const timer = window.setTimeout(() => latest.current.onSettled(plan.id), REDUCED_MOTION_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    track.style.transform = from
    animatingRef.current = true
    const animation = track.animate([{ transform: from }, { transform: to }], {
      duration: SPIN_DURATION_MS,
      easing: SPIN_EASING,
      fill: 'forwards',
    })
    // Follow the live position and tick whenever a new card crosses the marker.
    const card = track.firstElementChild as HTMLElement | null
    const step = (card?.offsetWidth ?? 0) + (Number.parseFloat(getComputedStyle(track).columnGap) || 0)
    let lastIndex = -1
    let frame = 0
    const follow = () => {
      if (step > 0) {
        const x = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41
        const index = Math.floor((viewport.clientWidth / 2 - x) / step)
        if (lastIndex !== -1 && index !== lastIndex) latest.current.onTick?.()
        lastIndex = index
      }
      frame = requestAnimationFrame(follow)
    }
    frame = requestAnimationFrame(follow)

    animation.onfinish = () => {
      cancelAnimationFrame(frame)
      animatingRef.current = false
      // Re-measure in case the screen was resized or rotated mid-spin.
      track.style.transform = px(measure(plan.to))
      animation.cancel()
      latest.current.onSettled(plan.id)
    }
    return () => {
      cancelAnimationFrame(frame)
      animation.onfinish = null
      animation.cancel()
      animatingRef.current = false
    }
    // `plan` keeps its identity when the phase moves on, so this runs once per opening.
  }, [strip, plan])

  // Keep the resting card centered when the width changes (e.g. tablet rotation).
  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const observer = new ResizeObserver(() => {
      if (animatingRef.current || latest.current.phase === 'spinning') return
      const card = track.firstElementChild as HTMLElement | null
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
      track.style.transform = `translate3d(${Math.round(translateFor(latest.current.rest, viewport.clientWidth, card?.offsetWidth ?? 0, gap))}px, 0, 0)`
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const landed = phase === 'revealed'

  return (
    <section
      ref={ref}
      aria-label="Dải phần quà"
      aria-busy={phase === 'spinning'}
      className="relative scroll-mt-4 rounded-3xl border-4 border-white bg-linear-to-b from-[#fff4c7] via-[#ffe1ef] to-[#d9f2ff] shadow-[0_14px_34px_-14px_rgba(43,45,66,0.4)] [--card-gap:0.5rem] [--card-w:6.5rem] sm:rounded-[2rem] sm:border-[6px] sm:[--card-gap:0.75rem] sm:[--card-w:9.5rem] lg:[--card-w:11rem]"
    >
      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-[1.25rem] py-5 sm:rounded-[1.6rem] sm:py-8"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        }}
      >
        <div ref={trackRef} className="flex w-max gap-(--card-gap) will-change-transform">
          {strip.map((entry, index) => {
            const prize = byId.get(entry.id)
            if (!prize) return null
            return (
              <StripCard
                key={entry.key}
                prize={prize}
                state={!landed ? 'normal' : index === rest.index ? 'winner' : 'dimmed'}
              />
            )
          })}
        </div>
      </div>

      {/* Center marker */}
      <div className="pointer-events-none absolute inset-y-1 left-1/2 z-20 -translate-x-1/2" aria-hidden="true">
        <div className="absolute inset-y-3 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-candy shadow-[0_0_0_3px_#fff,0_0_16px_rgba(236,59,114,0.6)]" />
        <div className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[11px] border-t-[14px] border-x-transparent border-t-candy sm:border-x-[14px] sm:border-t-[18px] drop-shadow-[0_2px_0_#fff]" />
        <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[11px] border-b-[14px] border-x-transparent border-b-candy sm:border-x-[14px] sm:border-b-[18px] drop-shadow-[0_-2px_0_#fff]" />
      </div>
    </section>
  )
})
