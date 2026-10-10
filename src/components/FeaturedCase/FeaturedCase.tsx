import { Coins, Loader2, PackageOpen } from 'lucide-react'
import { memo } from 'react'
import { getRarity } from '../../data/rarities'
import type { OpeningPhase } from '../../hooks/useCaseOpening'
import { formatChance, formatNumber } from '../../lib/format'
import { getCaseOdds } from '../../lib/rewards'
import type { LootCase } from '../../types'
import { CaseArt } from '../CaseArt/CaseArt'

interface FeaturedCaseProps {
  lootCase: LootCase
  phase: OpeningPhase
  canAfford: boolean
  totalOpens: number
  onOpen: () => void
  onRefill: () => void
}

export const FeaturedCase = memo(function FeaturedCase({
  lootCase,
  phase,
  canAfford,
  totalOpens,
  onOpen,
  onRefill,
}: FeaturedCaseProps) {
  const odds = getCaseOdds(lootCase)
  const spinning = phase === 'spinning'
  const topValue = Math.max(...odds.flatMap((t) => t.items.map((i) => i.value)))

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10">
      <div className="relative mx-auto w-full max-w-[15rem] sm:max-w-[18rem] md:max-w-[22rem]">
        <div
          className="absolute inset-[12%] rounded-full blur-3xl transition-colors duration-700"
          style={{ background: lootCase.theme.glow, opacity: 0.22 }}
          aria-hidden="true"
        />
        <CaseArt
          key={lootCase.id}
          theme={lootCase.theme}
          animated
          className="relative aspect-[6/5] w-full animate-pop-in"
        />
      </div>

      <div className="min-w-0 text-center md:text-left">
        <p className="eyebrow">{lootCase.tagline}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-wide text-gold-100 sm:text-4xl lg:text-[2.75rem]">
          {lootCase.name}
        </h1>
        <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-muted sm:text-[0.95rem] md:mx-0">
          {lootCase.description}
        </p>

        <dl className="mx-auto mt-4 grid max-w-md grid-cols-3 divide-x divide-line rounded-xl border border-line bg-ink-950/50 md:mx-0">
          <div className="px-3 py-2">
            <dt className="text-[0.65rem] tracking-[0.18em] text-subtle uppercase">Cost</dt>
            <dd className="mt-1 flex items-center justify-center gap-1 font-semibold text-gold-200 tabular-nums md:justify-start">
              <Coins className="size-3.5" aria-hidden="true" />
              {formatNumber(lootCase.cost)}
            </dd>
          </div>
          <div className="px-3 py-2">
            <dt className="text-[0.65rem] tracking-[0.18em] text-subtle uppercase">Items</dt>
            <dd className="mt-1 font-semibold text-gold-200 tabular-nums">{lootCase.itemIds.length}</dd>
          </div>
          <div className="px-3 py-2">
            <dt className="text-[0.65rem] tracking-[0.18em] text-subtle uppercase">Top prize</dt>
            <dd className="mt-1 font-semibold text-gold-200 tabular-nums">{formatNumber(topValue)}</dd>
          </div>
        </dl>

        <div className="mx-auto mt-4 max-w-md md:mx-0">
          <div className="flex h-2 overflow-hidden rounded-full bg-ink-950" aria-hidden="true">
            {odds.map((t) => (
              <div
                key={t.rarity}
                className="h-full transition-[width] duration-700"
                style={{ width: `${t.chance * 100}%`, background: getRarity(t.rarity).color, minWidth: 3 }}
              />
            ))}
          </div>
          <ul className="mt-2.5 flex flex-wrap justify-center gap-x-3.5 gap-y-1.5 md:justify-start" aria-label="Drop odds by rarity">
            {odds.map((t) => {
              const r = getRarity(t.rarity)
              return (
                <li key={t.rarity} className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden="true" />
                  {r.label}
                  <span className="font-semibold text-gold-100 tabular-nums">{formatChance(t.chance)}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 md:items-start">
          <button
            type="button"
            onClick={onOpen}
            disabled={spinning || !canAfford}
            aria-label={spinning ? 'Opening case' : `Open ${lootCase.name} for ${formatNumber(lootCase.cost)} demo tokens`}
            className="btn-gold h-14 w-full max-w-md text-base sm:text-lg"
          >
            {spinning ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Opening…
              </>
            ) : (
              <>
                <PackageOpen className="size-5" aria-hidden="true" />
                Open case
                <span className="ml-1 flex items-center gap-1 rounded-md bg-ink-950/15 px-2 py-0.5 text-sm tracking-normal tabular-nums">
                  <Coins className="size-3.5" aria-hidden="true" />
                  {formatNumber(lootCase.cost)}
                </span>
              </>
            )}
          </button>
          {!canAfford && !spinning ? (
            <p className="text-xs text-muted">
              Not enough demo tokens.{' '}
              <button type="button" onClick={onRefill} className="font-semibold text-gold-300 underline underline-offset-2">
                Refill for free
              </button>
            </p>
          ) : (
            <p className="text-xs text-subtle">
              <span className="font-semibold text-gold-200 tabular-nums">{formatNumber(totalOpens)}</span> crates
              opened (simulated) · demo tokens only
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
