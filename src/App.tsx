import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { CaseRoulette } from './components/CaseRoulette/CaseRoulette'
import { CaseSelector } from './components/CaseSelector/CaseSelector'
import { FeaturedCase } from './components/FeaturedCase/FeaturedCase'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { InventoryPanel } from './components/InventoryPanel/InventoryPanel'
import { OpeningResult } from './components/OpeningResult/OpeningResult'
import { RecentDrops } from './components/RecentDrops/RecentDrops'
import { RewardGrid } from './components/RewardGrid/RewardGrid'
import { CASES, DEFAULT_CASE_ID, getCase } from './data/cases'
import { getRarity } from './data/rarities'
import { useCaseOpening } from './hooks/useCaseOpening'
import { useDemoWallet } from './hooks/useDemoWallet'
import { useInventory } from './hooks/useInventory'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { useRecentDrops } from './hooks/useRecentDrops'
import type { Item, LootCase } from './types'

/** Mock global counter shown above the cases. */
const SIMULATED_TOTAL_OPENS = 1_284_377
/** Pause on the highlighted winner before the result modal appears. */
const REVEAL_DELAY_MS = 700
const HEADER_OFFSET_PX = 64

export default function App() {
  const [caseId, setCaseId] = useState(DEFAULT_CASE_ID)
  const lootCase = getCase(caseId)
  const reducedMotion = usePrefersReducedMotion()
  const { balance, spend, refill } = useDemoWallet()
  const inventory = useInventory()
  const { drops, now, addOwnDrop } = useRecentDrops()
  const [resultOpen, setResultOpen] = useState(false)
  // Snapshot of the last reveal, so the modal never shows a winner before its spin lands.
  const [revealed, setRevealed] = useState<{ item: Item; lootCase: LootCase } | null>(null)
  const [sessionOpens, setSessionOpens] = useState(0)
  const rouletteRef = useRef<HTMLElement>(null)
  const revealTimer = useRef<number | undefined>(undefined)

  const addToInventory = inventory.add
  const handleReveal = useCallback(
    (item: Item, revealedCase: LootCase) => {
      addToInventory(item.id, revealedCase.id)
      addOwnDrop(item, revealedCase.name)
      setRevealed({ item, lootCase: revealedCase })
      window.clearTimeout(revealTimer.current)
      revealTimer.current = window.setTimeout(() => setResultOpen(true), reducedMotion ? 150 : REVEAL_DELAY_MS)
    },
    [addToInventory, addOwnDrop, reducedMotion],
  )

  const opening = useCaseOpening(lootCase, handleReveal)
  const { open: openCase, reset: resetRoulette, settle } = opening
  const spinning = opening.phase === 'spinning'
  const canAfford = balance >= lootCase.cost

  useEffect(() => () => window.clearTimeout(revealTimer.current), [])

  const startOpening = useCallback(() => {
    if (balance < lootCase.cost) return
    const winner = openCase(lootCase)
    if (!winner) return // a spin is already running
    spend(lootCase.cost)
    setResultOpen(false)
    setSessionOpens((n) => n + 1)

    const roulette = rouletteRef.current
    if (roulette) {
      const rect = roulette.getBoundingClientRect()
      if (rect.top < HEADER_OFFSET_PX || rect.bottom > window.innerHeight) {
        roulette.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
      }
    }
  }, [balance, lootCase, openCase, spend, reducedMotion])

  const selectCase = useCallback(
    (next: LootCase) => {
      if (spinning || next.id === caseId) return
      setCaseId(next.id)
      resetRoulette(next)
    },
    [spinning, caseId, resetRoulette],
  )

  const closeResult = useCallback(() => {
    window.clearTimeout(revealTimer.current)
    setResultOpen(false)
  }, [])

  const openAgain = useCallback(() => {
    closeResult()
    startOpening()
  }, [closeResult, startOpening])

  const status =
    opening.phase === 'spinning'
      ? `Opening ${lootCase.name}…`
      : opening.phase === 'revealed' && opening.winner
        ? `You unboxed ${opening.winner.name}, ${getRarity(opening.winner.rarity).label} grade.`
        : ''

  return (
    <div id="top" className="relative min-h-dvh" style={{ '--case-glow': lootCase.theme.glow } as CSSProperties}>
      <div className="atmosphere pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-gold-300 px-4 py-2 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <Header balance={balance} inventoryCount={inventory.entries.length} onRefill={refill} />

      <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6">
        <section id="open" aria-label="Open a case" className="scroll-mt-20 pt-4 sm:pt-6">
          <CaseSelector cases={CASES} selectedId={caseId} disabled={spinning} onSelect={selectCase} />

          <div className="panel mt-3 p-4 sm:mt-4 sm:p-6 lg:px-8 lg:py-7">
            <FeaturedCase
              lootCase={lootCase}
              phase={opening.phase}
              canAfford={canAfford}
              totalOpens={SIMULATED_TOTAL_OPENS + sessionOpens}
              onOpen={startOpening}
              onRefill={refill}
            />
            <div className="mt-6 sm:mt-7">
              <CaseRoulette
                ref={rouletteRef}
                strip={opening.strip}
                rest={opening.rest}
                spin={opening.spin}
                phase={opening.phase}
                reducedMotion={reducedMotion}
                onSettled={settle}
              />
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {status}
            </p>
          </div>
        </section>

        <div className="mt-8 sm:mt-10">
          <RewardGrid lootCase={lootCase} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
          <InventoryPanel entries={inventory.entries} onClear={inventory.clear} />
          <RecentDrops drops={drops} now={now} />
        </div>
      </main>

      <Footer />

      {revealed && (
        <OpeningResult
          open={resultOpen}
          item={revealed.item}
          lootCase={revealed.lootCase}
          canOpenAgain={!spinning && balance >= revealed.lootCase.cost}
          onClose={closeResult}
          onOpenAgain={openAgain}
        />
      )}
    </div>
  )
}
