import { memo, useEffect, useLayoutEffect, useMemo, useRef, type Ref } from 'react'
import type { OpeningPhase } from '../../hooks/useLootOpening'
import { SPIN_DURATION_MS, SPIN_EASING, translateFor, type RestPosition, type SpinPlan } from '../../lib/roulette'
import type { Prize, PrizeId, StripEntry } from '../../types'

interface LootStripProps {
  prizes: Prize[]
  strip: StripEntry[]
  rest: RestPosition
  plan: SpinPlan | null
  phase: OpeningPhase
  reducedMotion: boolean
  onSettled: (spinId: number) => void
  ref?: Ref<HTMLElement>
}

const REDUCED_MOTION_DELAY_MS = 300

const StripCard = memo(function StripCard({ prize, state }: { prize: Prize; state: 'normal' | 'winner' | 'dimmed' }) {
  return (
    <div
      className={[
        'relative w-(--card-w) shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md transition-[opacity,transform,filter] duration-500',
        state === 'winner' ? 'z-10 scale-110 animate-winner' : '',
        state === 'dimmed' ? 'scale-95 opacity-40 saturate-50' : '',
      ].join(' ')}
    >
      <img src={prize.image} alt="" draggable={false} className="aspect-square w-full rounded-xl object-cover" />
      <p className="line-clamp-2 flex h-[2.6em] items-center justify-center px-1.5 text-center font-display text-sm leading-[1.2] font-extrabold sm:text-base">
        {prize.name}
      </p>
      <div className="h-2" style={{ background: prize.color }} />
    </div>
  )
})

/**
 * Counter-Strike style horizontal strip. Movement is driven imperatively with
 * the Web Animations API on a ref, so React renders once per opening — not
 * per frame. Geometry is measured at spin time, so landing is exact at any size.
 */
export const LootStrip = memo(function LootStrip({ prizes, strip, rest, plan, phase, reducedMotion, onSettled, ref }: LootStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false)
  const latest = useRef({ rest, phase, reducedMotion, onSettled })
  useLayoutEffect(() => {
    latest.current = { rest, phase, reducedMotion, onSettled }
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
    const px = (x: number) => `translate3d(${x}px, 0, 0)`
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
    animation.onfinish = () => {
      animatingRef.current = false
      // Re-measure in case the screen was resized or rotated mid-spin.
      track.style.transform = px(measure(plan.to))
      animation.cancel()
      latest.current.onSettled(plan.id)
    }
    return () => {
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
      track.style.transform = `translate3d(${translateFor(latest.current.rest, viewport.clientWidth, card?.offsetWidth ?? 0, gap)}px, 0, 0)`
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
      className="relative scroll-mt-4 rounded-[2rem] border-[6px] border-white bg-linear-to-b from-[#fff4c7] via-[#ffe1ef] to-[#d9f2ff] shadow-[0_14px_34px_-14px_rgba(43,45,66,0.4)] [--card-gap:0.75rem] [--card-w:7.25rem] sm:[--card-w:9.5rem] lg:[--card-w:11rem]"
    >
      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-[1.6rem] py-6 sm:py-8"
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
        <div className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[18px] border-x-transparent border-t-candy drop-shadow-[0_2px_0_#fff]" />
        <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[14px] border-b-[18px] border-x-transparent border-b-candy drop-shadow-[0_-2px_0_#fff]" />
      </div>
    </section>
  )
})
