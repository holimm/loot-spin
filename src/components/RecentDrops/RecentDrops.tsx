import { Radio } from 'lucide-react'
import { memo, type CSSProperties } from 'react'
import { getRarity } from '../../data/rarities'
import { formatTimeAgo } from '../../lib/format'
import type { Drop } from '../../types'
import { ItemArt } from '../ItemArt/ItemArt'

interface RecentDropsProps {
  drops: Drop[]
  now: number
}

export const RecentDrops = memo(function RecentDrops({ drops, now }: RecentDropsProps) {
  return (
    <section id="drops" aria-labelledby="drops-title" className="panel flex scroll-mt-24 flex-col p-4 sm:p-6">
      <div className="flex items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow">Simulated feed</p>
          <h2 id="drops-title" className="section-title mt-1.5">
            Recent drops
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-emerald-300 uppercase">
          <Radio className="size-3" aria-hidden="true" />
          Live demo
        </span>
      </div>

      <ol className="mt-3 flex flex-col gap-2" aria-label="Most recent drops first">
        {drops.map((drop) => {
          const rarity = getRarity(drop.item.rarity)
          return (
            <li
              key={drop.id}
              className={`flex animate-drop-in items-center gap-3 overflow-hidden rounded-xl border bg-ink-950/40 py-1.5 pr-3 pl-1.5 ${
                drop.isOwn ? 'border-gold-500/60 bg-gold-700/15' : 'border-line'
              }`}
              style={{ '--rarity': rarity.color } as CSSProperties}
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-800">
                <ItemArt item={drop.item} sigil={false} className="w-full" />
                <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: rarity.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gold-100">{drop.item.name}</p>
                <p className="truncate text-xs text-subtle">
                  <span className={drop.isOwn ? 'font-semibold text-gold-300' : 'text-muted'}>{drop.user}</span>
                  {' · '}
                  {drop.caseName}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[0.62rem] font-semibold tracking-[0.12em] uppercase" style={{ color: rarity.color }}>
                  {rarity.label}
                </p>
                <p className="text-[0.68rem] text-subtle tabular-nums">{formatTimeAgo(drop.at, now)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
})
