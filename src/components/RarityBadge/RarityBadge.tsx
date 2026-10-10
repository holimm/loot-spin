import type { CSSProperties } from 'react'
import { getRarity } from '../../data/rarities'
import type { RarityId } from '../../types'

interface RarityBadgeProps {
  rarity: RarityId
  /** "tag" is the boxed label used on cards; "text" is a bare colored label. */
  variant?: 'tag' | 'text'
  showTier?: boolean
  className?: string
}

export function RarityBadge({ rarity, variant = 'tag', showTier = false, className = '' }: RarityBadgeProps) {
  const r = getRarity(rarity)
  const label = showTier ? `${r.label} · ${r.tier}` : r.label
  const style = { '--rarity': r.color, color: r.color } as CSSProperties

  if (variant === 'text') {
    return (
      <span className={`text-[0.65rem] font-semibold tracking-[0.16em] uppercase ${className}`} style={style}>
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-[4px] border bg-ink-950/75 px-1.5 py-0.5 text-[0.6rem] leading-none font-semibold tracking-[0.14em] uppercase backdrop-blur-sm ${className}`}
      style={{ ...style, borderColor: `color-mix(in oklab, ${r.color} 45%, transparent)` }}
    >
      {label}
    </span>
  )
}
