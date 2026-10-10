import { Gift } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header/Header'
import { LootStrip } from './components/LootStrip/LootStrip'
import { PrizeEditor } from './components/PrizeEditor/PrizeEditor'
import { PrizeReveal } from './components/PrizeReveal/PrizeReveal'
import { useLootOpening } from './hooks/useLootOpening'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { usePrizeSettings } from './hooks/usePrizeSettings'
import { celebrationTier, getActivePrizes } from './lib/prizes'
import type { CelebrationTier, Prize } from './types'

/** Pause on the highlighted card before the reveal pops up. */
const REVEAL_DELAY_MS = 700

export default function App() {
  const { settings, updatePrize, reset } = usePrizeSettings()
  const reducedMotion = usePrefersReducedMotion()
  const prizes = useMemo(() => getActivePrizes(settings), [settings])
  const stripRef = useRef<HTMLElement>(null)

  // Snapshot of the last revealed prize, so the reveal never shows a prize early.
  const [reveal, setReveal] = useState<{ prize: Prize; tier: CelebrationTier } | null>(null)
  const [revealOpen, setRevealOpen] = useState(false)
  const revealTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  const handleReveal = useCallback(
    (prize: Prize) => {
      setReveal({ prize, tier: celebrationTier(prize) })
      window.clearTimeout(revealTimer.current)
      revealTimer.current = window.setTimeout(() => setRevealOpen(true), reducedMotion ? 150 : REVEAL_DELAY_MS)
    },
    [reducedMotion],
  )

  const opening = useLootOpening(prizes, handleReveal)
  const { open } = opening
  const spinning = opening.phase === 'spinning'
  const canOpen = !spinning && prizes.length > 0

  const startOpening = useCallback(() => {
    if (!open()) return
    // Make sure the strip is on screen (the editor below may be scrolled into view).
    const strip = stripRef.current
    if (strip) {
      const rect = strip.getBoundingClientRect()
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        strip.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
      }
    }
  }, [open, reducedMotion])

  const closeReveal = useCallback(() => {
    window.clearTimeout(revealTimer.current)
    setRevealOpen(false)
  }, [])

  // "Lượt quay": the free extra opening starts right away.
  const openAgain = useCallback(() => {
    closeReveal()
    startOpening()
  }, [closeReveal, startOpening])

  const status = spinning
    ? 'Đang mở quà…'
    : opening.phase === 'revealed' && opening.winner
      ? `Bạn nhận được: ${opening.winner.name}!`
      : ''

  return (
    <div className="relative min-h-dvh">
      <div className="confetti-backdrop pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-4 pb-12 sm:px-6">
        <section aria-labelledby="open-title" className="flex flex-col items-center gap-5">
          <h1 id="open-title" className="text-center font-display text-3xl leading-tight font-extrabold sm:text-4xl">
            Bạn giỏi lắm! Mở quà nào!
          </h1>

          <div className="w-full">
            <LootStrip
              ref={stripRef}
              prizes={prizes}
              strip={opening.strip}
              rest={opening.rest}
              plan={opening.plan}
              phase={opening.phase}
              reducedMotion={reducedMotion}
              onSettled={opening.settle}
            />
          </div>

          <button type="button" onClick={startOpening} disabled={!canOpen} className="btn-candy h-20 w-full max-w-md text-3xl">
            <Gift className="size-8" aria-hidden="true" />
            {spinning ? 'Đang mở…' : 'MỞ QUÀ!'}
          </button>
          {prizes.length === 0 && (
            <p className="text-center font-bold text-candy-dark" role="alert">
              Chưa có phần quà nào được bật. Hãy bật ít nhất một phần quà ở bên dưới nhé!
            </p>
          )}
        </section>

        <div className="mt-12">
          <PrizeEditor settings={settings} disabled={spinning} onUpdate={updatePrize} onReset={reset} />
        </div>
      </main>

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {reveal && (
        <PrizeReveal
          open={revealOpen}
          prize={reveal.prize}
          tier={reveal.tier}
          onClose={closeReveal}
          onSpinAgain={openAgain}
        />
      )}
    </div>
  )
}
