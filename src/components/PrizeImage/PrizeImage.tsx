import { Gift } from 'lucide-react'
import { memo } from 'react'

interface PrizeImageProps {
  image: string | null
  color: string
  /** Accessible name; omit for decorative use. */
  alt?: string
  fit?: 'cover' | 'contain'
  className?: string
  borderColor?: string
}

/** A prize's photo, or a bright gift-box placeholder when it has none. */
export const PrizeImage = memo(function PrizeImage({ image, color, alt = '', fit = 'cover', className = '', borderColor }: PrizeImageProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        draggable={false}
        className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
        style={borderColor ? { borderColor } : undefined}
      />
    )
  }
  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`grid place-items-center ${className}`}
      style={{ background: `radial-gradient(circle at 50% 35%, #ffffffcc, transparent 60%), ${color}`, borderColor }}
    >
      <Gift className="h-1/2 w-1/2 text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.18)]" strokeWidth={2.2} aria-hidden="true" />
    </div>
  )
})
