import { memo, type CSSProperties, type ReactNode } from 'react'
import { getRarity } from '../../data/rarities'
import { formatNumber } from '../../lib/format'
import type { Item } from '../../types'
import { ItemArt } from '../ItemArt/ItemArt'
import { RarityBadge } from '../RarityBadge/RarityBadge'

interface RewardCardProps {
  item: Item
  /** "strip" is the roulette card; "grid" is the catalogue / inventory card. */
  variant?: 'strip' | 'grid'
  /** Strip only: landed winner or a dimmed neighbour. */
  state?: 'normal' | 'winner' | 'dimmed'
  /** Grid only: extra line under the value row (drop chance, count…). */
  footer?: ReactNode
  /** Grid only: stack count badge. */
  count?: number
}

export const RewardCard = memo(function RewardCard({
  item,
  variant = 'grid',
  state = 'normal',
  footer,
  count,
}: RewardCardProps) {
  const rarity = getRarity(item.rarity)
  const style = { '--rarity': rarity.color } as CSSProperties

  if (variant === 'strip') {
    return (
      <div
        className={[
          'relative w-(--card-w) shrink-0 overflow-hidden rounded-lg border bg-linear-to-b from-ink-700 to-ink-850 transition-[opacity,filter,transform] duration-500',
          state === 'winner' ? 'z-10 scale-[1.05] animate-winner border-transparent' : 'border-line',
          state === 'dimmed' ? 'opacity-35 saturate-50' : '',
        ].join(' ')}
        style={style}
      >
        <RarityBadge rarity={item.rarity} className="absolute top-2 left-2 z-10" />
        <ItemArt item={item} className="-mb-1 w-full" />
        <p className="line-clamp-2 h-[2.5em] px-2.5 font-display text-[0.72rem] leading-[1.25] font-semibold text-gold-100 sm:text-[0.8rem]">
          {item.name}
        </p>
        <div className="h-3" />
        <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: rarity.color }} />
      </div>
    )
  }

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-linear-to-b from-ink-700/80 to-ink-850 transition duration-300 hover:-translate-y-1 hover:border-(--rarity)/60 hover:shadow-[0_18px_40px_-18px_var(--rarity)]"
      style={style}
    >
      <div className="rarity-bar h-[3px]" />
      <div className="relative bg-ink-950/40">
        <ItemArt item={item} className="w-full transition duration-500 group-hover:scale-[1.06]" />
        {count !== undefined && count > 1 && (
          <span className="absolute top-2 right-2 rounded-md border border-line-strong bg-ink-950/80 px-1.5 py-0.5 text-xs font-semibold text-gold-200 tabular-nums">
            ×{count}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 pt-2.5">
        <p className="text-[0.68rem] tracking-wide text-subtle">{item.kind}</p>
        <h3 className="font-display text-sm leading-snug font-semibold text-gold-100 sm:text-[0.95rem]">{item.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-semibold text-gold-200 tabular-nums">
            {formatNumber(item.value)} <span className="text-[0.65rem] font-medium text-subtle">TKN</span>
          </span>
          <RarityBadge rarity={item.rarity} variant="text" />
        </div>
        {footer}
      </div>
    </article>
  )
})
