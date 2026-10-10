import { Minus, Plus, X } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { CUSTOM_DEFAULT_WEIGHT, MAX_NAME_LENGTH, MAX_WEIGHT } from '../../data/prizes'
import { formatPercent, type NewPrizeInput } from '../../lib/prizes'
import { PhotoPicker } from '../PhotoPicker/PhotoPicker'

interface AddPrizeDialogProps {
  /** Color the new prize will get, for the placeholder preview. */
  color: string
  /** Sum of the weights of currently enabled prizes, for the live percentage. */
  activeWeight: number
  onAdd: (input: NewPrizeInput) => void
  onCancel: () => void
}

const WEIGHT_STEP = 5

/** Form for a new prize. Mount to open; unmount to close. */
export function AddPrizeDialog({ color, activeWeight, onAdd, onCancel }: AddPrizeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [weight, setWeight] = useState(CUSTOM_DEFAULT_WEIGHT)
  const [weightText, setWeightText] = useState(String(CUSTOM_DEFAULT_WEIGHT))
  const [image, setImage] = useState<string | null>(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    nameRef.current?.focus()
  }, [])

  const changeWeight = (value: number) => {
    const next = Math.min(MAX_WEIGHT, Math.max(0, value))
    setWeight(next)
    setWeightText(String(next))
  }

  const canAdd = name.trim().length > 0
  const chance = weight > 0 ? weight / (activeWeight + weight) : 0

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-prize-title"
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      className="dialog-backdrop m-auto w-[min(28rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-ink"
    >
      <form
        className="card relative px-4 pt-5 pb-4 sm:px-5 sm:pt-6 sm:pb-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (canAdd) onAdd({ name, weight, image })
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10"
          aria-label="Đóng"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <h2 id="add-prize-title" className="font-display text-2xl font-extrabold">
          Thêm phần quà
        </h2>

        <div className="mt-4 flex items-start gap-3 sm:gap-4">
          <PhotoPicker image={image} color={color} onPick={setImage} label="Chọn ảnh cho phần quà" className="size-20 sm:size-24" />
          <div className="min-w-0 flex-1">
            <label htmlFor="new-prize-name" className="text-xs font-bold tracking-wide text-ink-soft uppercase">
              Tên phần quà
            </label>
            <input
              ref={nameRef}
              id="new-prize-name"
              type="text"
              autoComplete="off"
              required
              value={name}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Ví dụ: Bút chì màu"
              onChange={(e) => setName(e.target.value)}
              className="mt-0.5 h-12 w-full rounded-xl border-2 border-ink/10 bg-white px-3 text-lg font-bold outline-none focus:border-grape"
            />
            <p className="mt-1 text-xs font-semibold text-ink-soft">
              {image ? 'Chạm vào ảnh để đổi ảnh khác.' : 'Chạm vào hình hộp quà để chọn ảnh (không bắt buộc).'}
            </p>
          </div>
        </div>

        <label htmlFor="new-prize-weight" className="mt-5 block text-xs font-bold tracking-wide text-ink-soft uppercase">
          Trọng số
        </label>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeWeight(weight - WEIGHT_STEP)}
              disabled={weight <= 0}
              className="btn-white size-11 sm:size-12"
              aria-label="Giảm trọng số"
            >
              <Minus className="size-5" aria-hidden="true" />
            </button>
            <input
              id="new-prize-weight"
              type="text"
              inputMode="numeric"
              value={weightText}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, String(MAX_WEIGHT).length)
                setWeightText(digits)
                if (digits !== '') setWeight(Math.min(MAX_WEIGHT, Number(digits)))
              }}
              onBlur={() => setWeightText(String(weight))}
              className="h-11 w-14 rounded-xl border-2 border-ink/10 bg-white text-center font-display text-2xl font-extrabold outline-none focus:border-grape sm:h-12 sm:w-16"
            />
            <button
              type="button"
              onClick={() => changeWeight(weight + WEIGHT_STEP)}
              disabled={weight >= MAX_WEIGHT}
              className="btn-white size-11 sm:size-12"
              aria-label="Tăng trọng số"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          </div>
          <output
            htmlFor="new-prize-weight"
            className="rounded-full bg-grape/10 px-3 py-1.5 font-display text-xl font-extrabold text-grape tabular-nums"
            aria-label={`Tỉ lệ dự kiến: ${formatPercent(chance)}`}
          >
            {formatPercent(chance)}
          </output>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className="btn-white h-14 text-lg">
            Hủy
          </button>
          <button type="submit" disabled={!canAdd} className="btn-candy h-14 text-lg">
            <Plus className="size-5" aria-hidden="true" />
            Thêm
          </button>
        </div>
      </form>
    </dialog>
  )
}
