import { memo, useId, type CSSProperties } from 'react'
import { getRarity } from '../../data/rarities'
import type { Item } from '../../types'

interface ItemArtProps {
  item: Item
  className?: string
  /** Draw the rotating rarity sigil behind the icon. */
  sigil?: boolean
}

/**
 * Original item artwork composed from an icon glyph, the item's material tint
 * and its rarity light. Pure SVG/CSS — nothing to load, so no layout shift.
 */
export const ItemArt = memo(function ItemArt({ item, className = '', sigil = true }: ItemArtProps) {
  const gradientId = `ia${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const rarity = getRarity(item.rarity)
  const Icon = item.art.icon
  const [light, dark] = item.art.tint

  return (
    <div
      className={`relative grid aspect-square place-items-center ${className}`}
      style={{ '--rarity': rarity.color } as CSSProperties}
      aria-hidden="true"
    >
      <div className="rarity-wash absolute inset-0" />
      {sigil && (
        <div
          className="absolute aspect-square w-[58%] rotate-45 rounded-[18%] border"
          style={{
            borderColor: `color-mix(in oklab, ${rarity.color} 30%, transparent)`,
            background: `linear-gradient(135deg, color-mix(in oklab, ${rarity.color} 14%, transparent), transparent 60%)`,
          }}
        />
      )}
      <div className="absolute bottom-[14%] h-[7%] w-[46%] rounded-[50%] bg-black/55 blur-[6px]" />
      <Icon
        aria-hidden="true"
        className="relative h-[54%] w-[54%]"
        stroke={`url(#${gradientId})`}
        strokeWidth={1.6}
        style={{ filter: `drop-shadow(0 0 10px ${dark}) drop-shadow(0 2px 2px rgba(0,0,0,.6))` }}
      >
        <defs>
          {/* userSpaceOnUse: bounding-box units break on perfectly straight strokes. */}
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0" stopColor={light} />
            <stop offset="0.55" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
        </defs>
      </Icon>
    </div>
  )
})
