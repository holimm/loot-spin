import { memo } from 'react'
import { getCaseItems } from '../../data/cases'
import { getRarity } from '../../data/rarities'
import { formatChance } from '../../lib/format'
import { getItemChance } from '../../lib/rewards'
import type { LootCase } from '../../types'
import { RewardCard } from '../RewardCard/RewardCard'

interface RewardGridProps {
  lootCase: LootCase
}

export const RewardGrid = memo(function RewardGrid({ lootCase }: RewardGridProps) {
  const items = [...getCaseItems(lootCase)].sort(
    (a, b) => getRarity(b.rarity).rank - getRarity(a.rarity).rank || b.value - a.value,
  )

  return (
    <section id="rewards" aria-labelledby="rewards-title" className="panel scroll-mt-24 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-4">
        <div>
          <p className="eyebrow">Possible rewards</p>
          <h2 id="rewards-title" className="section-title mt-1.5">
            What's inside?
          </h2>
        </div>
        <p className="text-sm text-muted">
          {items.length} items in <span className="text-gold-200">{lootCase.name}</span>
        </p>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
        {items.map((item) => (
          <li key={item.id}>
            <RewardCard
              item={item}
              footer={
                <p className="text-[0.68rem] text-subtle">
                  Chance <span className="font-semibold text-muted tabular-nums">{formatChance(getItemChance(lootCase, item))}</span>
                </p>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
})
