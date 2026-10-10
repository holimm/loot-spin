import { Backpack, Coins, PackageOpen, X } from 'lucide-react'
import { memo, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { getRarity } from '../../data/rarities'
import { formatNumber } from '../../lib/format'
import type { Item, LootCase } from '../../types'
import { ItemArt } from '../ItemArt/ItemArt'

interface OpeningResultProps {
  open: boolean
  item: Item
  lootCase: LootCase
  canOpenAgain: boolean
  onClose: () => void
  onOpenAgain: () => void
}

/** Reward reveal built on the native <dialog>: focus trapping, Esc and inert background for free. */
export const OpeningResult = memo(function OpeningResult({
  open,
  item,
  lootCase,
  canOpenAgain,
  onClose,
  onOpenAgain,
}: OpeningResultProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  // Layout effect: open/close before paint so stale content never flashes.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      primaryRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const rarity = getRarity(item.rarity)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="result-title"
      aria-describedby="result-desc"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="result-dialog m-auto w-[min(26rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-gold-100 backdrop:bg-transparent"
    >
      {open && (
        <div
          className="frame-double relative animate-pop-in overflow-hidden bg-ink-850 px-5 pt-6 pb-5 text-center sm:px-7"
          style={{ '--rarity': rarity.color, '--case-glow': rarity.color } as CSSProperties}
        >
          <div
            className="pointer-events-none absolute -top-1/2 left-1/2 aspect-square w-[160%] -translate-x-1/2 animate-spin-slow opacity-25"
            style={{
              background: `repeating-conic-gradient(from 0deg, ${rarity.color} 0deg 6deg, transparent 6deg 24deg)`,
              maskImage: 'radial-gradient(circle, #000 0%, transparent 60%)',
              WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full text-muted transition hover:bg-ink-700 hover:text-gold-100"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <p className="relative text-[0.68rem] font-semibold tracking-[0.26em] uppercase" style={{ color: rarity.color }}>
            {rarity.label} · {rarity.tier}
          </p>
          <h2 id="result-title" className="relative mt-2 font-display text-2xl font-bold sm:text-3xl">
            {item.name}
          </h2>
          <p id="result-desc" className="relative mt-1.5 text-sm text-muted">
            Unboxed from {lootCase.name} · Value{' '}
            <span className="font-semibold text-gold-200 tabular-nums">{formatNumber(item.value)}</span> TKN
          </p>

          <div className="relative mx-auto mt-4 w-[78%] max-w-64">
            <ItemArt item={item} className="w-full" />
          </div>
          <div className="rarity-bar relative mx-auto h-[3px] w-3/4" aria-hidden="true" />

          <p className="relative mt-4 flex items-center justify-center gap-1.5 text-xs text-subtle">
            <Backpack className="size-3.5" aria-hidden="true" />
            Added to your demo inventory
          </p>

          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={onClose} className="btn-ghost h-12">
              Close
            </button>
            <button
              ref={primaryRef}
              type="button"
              onClick={onOpenAgain}
              disabled={!canOpenAgain}
              aria-label={`Open another ${lootCase.name} for ${formatNumber(lootCase.cost)} demo tokens`}
              className="btn-gold h-12 px-3 text-sm"
            >
              <PackageOpen className="size-4" aria-hidden="true" />
              Again
              <span className="flex items-center gap-0.5 text-xs tracking-normal tabular-nums">
                <Coins className="size-3" aria-hidden="true" />
                {formatNumber(lootCase.cost)}
              </span>
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
})
