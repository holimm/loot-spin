import confetti, { type CreateTypes } from 'canvas-confetti'
import { RotateCw, Sparkles, X } from 'lucide-react'
import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import { celebrate } from '../../lib/celebrate'
import type { CelebrationTier, Prize } from '../../types'
import { PrizeImage } from '../PrizeImage/PrizeImage'

interface PrizeRevealProps {
  open: boolean
  prize: Prize
  tier: CelebrationTier
  onClose: () => void
  onSpinAgain: () => void
}

const HEADLINES: Record<CelebrationTier, string> = {
  big: 'SIÊU HIẾM!',
  medium: 'Tuyệt vời quá!',
  small: 'Chúc mừng bạn!',
  gentle: 'Không sao đâu!',
}

/** Prize reveal on the native <dialog>: focus trap, Esc and inert page for free. */
export const PrizeReveal = memo(function PrizeReveal({ open, prize, tier, onClose, onSpinAgain }: PrizeRevealProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const fireRef = useRef<CreateTypes | null>(null)

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

  // The canvas must live inside the dialog: a modal dialog sits in the top
  // layer, above any page-level confetti canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const fire = confetti.create(canvas, { resize: true, useWorker: false, disableForReducedMotion: true })
    fireRef.current = fire
    return () => {
      fire.reset()
      fireRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open || !fireRef.current) return
    return celebrate(fireRef.current, tier)
  }, [open, tier, prize])

  const extraSpin = prize.effect === 'extra-spin'
  const rare = tier === 'big' || tier === 'medium'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="reveal-title"
      aria-describedby="reveal-desc"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="dialog-backdrop m-0 h-dvh text-ink max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0"
    >
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-20 h-full w-full" aria-hidden="true" />

      {open && (
        <div
          className="relative z-10 flex min-h-full items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="card relative w-full max-w-md animate-pop overflow-hidden px-5 pt-6 pb-6 text-center sm:px-8">
            {rare && (
              <div
                className="pointer-events-none absolute -top-1/3 left-1/2 aspect-square w-[180%] -translate-x-1/2 animate-spin-slow"
                style={{
                  background: `repeating-conic-gradient(${prize.color}55 0deg 10deg, transparent 10deg 24deg)`,
                  maskImage: 'radial-gradient(circle, #000 0%, transparent 62%)',
                  WebkitMaskImage: 'radial-gradient(circle, #000 0%, transparent 62%)',
                }}
                aria-hidden="true"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 grid size-12 place-items-center rounded-full bg-ink/5 text-ink-soft transition hover:bg-ink/10"
              aria-label="Đóng"
            >
              <X className="size-6" aria-hidden="true" />
            </button>

            <p
              className={`relative font-display font-extrabold ${
                tier === 'big'
                  ? 'inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#ff5c8d] via-[#ffb03a] to-[#b983ff] px-5 py-1 text-2xl tracking-wide text-white shadow-md'
                  : 'text-xl text-grape'
              }`}
            >
              {tier === 'big' && <Sparkles className="size-6" aria-hidden="true" />}
              {HEADLINES[tier]}
              {tier === 'big' && <Sparkles className="size-6" aria-hidden="true" />}
            </p>

            <div
              className={`relative mx-auto mt-4 aspect-square w-[min(72vw,19rem)] overflow-hidden rounded-[2rem] border-[6px] bg-white shadow-lg ${
                tier === 'big' ? 'animate-wiggle' : ''
              }`}
              style={{ borderColor: prize.color }}
            >
              <PrizeImage image={prize.image} color={prize.color} alt={prize.name} fit="contain" className="h-full w-full" />
            </div>

            <h2 id="reveal-title" className="relative mt-4 font-display text-4xl leading-tight font-extrabold sm:text-5xl">
              {prize.name}
            </h2>
            <p id="reveal-desc" className="relative mt-1 text-lg font-semibold text-ink-soft">
              {extraSpin
                ? 'Bạn được mở thêm 1 lần nữa!'
                : tier === 'gentle'
                  ? 'Lần sau bạn sẽ may mắn hơn nhé!'
                  : 'Bạn giỏi quá, phần quà này là của bạn!'}
            </p>

            <div className="relative mt-6">
              {extraSpin ? (
                <button ref={primaryRef} type="button" onClick={onSpinAgain} className="btn-sun h-16 w-full text-2xl">
                  <RotateCw className="size-7" aria-hidden="true" />
                  Mở tiếp!
                </button>
              ) : (
                <button ref={primaryRef} type="button" onClick={onClose} className="btn-candy h-16 w-full text-2xl">
                  Xong
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
})
