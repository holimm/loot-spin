import { ChevronDown, Plus, RotateCcw, TriangleAlert, Undo2 } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { CUSTOM_COLORS, MAX_CUSTOM_PRIZES } from '../../data/prizes'
import type { PrizePatch } from '../../hooks/usePrizeSettings'
import { getActivePrizes, prizeName, type NewPrizeInput } from '../../lib/prizes'
import type { PrizeId, PrizeSettings } from '../../types'
import { AddPrizeDialog } from './AddPrizeDialog'
import { PrizeEditorRow } from './PrizeEditorRow'

interface PrizeEditorProps {
  settings: PrizeSettings
  /** Locked while opening: removing a prize would change the cards under the marker. */
  disabled: boolean
  /** The latest change couldn't be saved to the browser (e.g. storage full). */
  saveFailed: boolean
  onUpdate: (id: PrizeId, patch: PrizePatch) => void
  onAdd: (input: NewPrizeInput) => PrizeId | null
  onRemove: (id: PrizeId) => void
  onRestore: (id: PrizeId) => void
  onReset: () => void
}

/** The prize list, hidden behind a toggle and editable in place. Changes save automatically. */
export const PrizeEditor = memo(function PrizeEditor({
  settings,
  disabled,
  saveFailed,
  onUpdate,
  onAdd,
  onRemove,
  onRestore,
  onReset,
}: PrizeEditorProps) {
  const active = useMemo(() => getActivePrizes(settings), [settings])
  const chances = useMemo(() => new Map(active.map((p) => [p.id, p.chance])), [active])
  const totalWeight = active.reduce((sum, p) => sum + p.weight, 0)
  const customCount = settings.prizes.filter((p) => p.custom).length
  const listed = settings.prizes.filter((p) => !p.removed)
  const removed = settings.prizes.filter((p) => p.removed)
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [justAdded, setJustAdded] = useState<PrizeId | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 4000)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  // Bring a newly added prize into view so it's obvious where it went.
  useEffect(() => {
    if (!justAdded) return
    const input = document.getElementById(`name-${justAdded}`)
    input?.closest('li')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [justAdded])

  const handleAdd = (input: NewPrizeInput) => {
    setJustAdded(onAdd(input))
    setAdding(false)
  }

  return (
    <section className="flex w-full flex-col items-center">
      <h2 className="font-display">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="prize-editor"
          onClick={() => setExpanded(!expanded)}
          className="btn-white h-14 px-6 text-xl"
        >
          Các phần quà
          <ChevronDown className={`size-6 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h2>

      <div id="prize-editor" hidden={!expanded} className="mt-5 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-soft">
            Tổng trọng số <span className="font-extrabold text-grape">{totalWeight}</span> · Đang bật{' '}
            <span className="font-extrabold text-grape">
              {active.length}/{listed.length}
            </span>{' '}
            · Tỉ lệ = trọng số ÷ tổng trọng số · Tự động lưu
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (confirmReset) onReset()
              setConfirmReset(!confirmReset)
            }}
            className={`${confirmReset ? 'btn-candy' : 'btn-white'} h-12 px-5 text-base`}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            {confirmReset
              ? customCount > 0
                ? `Bấm lần nữa · xóa ${customCount} phần quà tự thêm`
                : 'Bấm lần nữa để khôi phục'
              : 'Khôi phục mặc định'}
          </button>
        </div>

        {removed.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Phần quà đã xóa">
            <span className="text-sm font-bold text-ink-soft">Đã xóa:</span>
            {removed.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => onRestore(p.id)}
                className="btn-white h-10 px-3 text-sm"
                aria-label={`Khôi phục ${prizeName(p)}`}
              >
                <Undo2 className="size-4" aria-hidden="true" />
                {prizeName(p)}
              </button>
            ))}
          </div>
        )}

        {saveFailed && (
          <p className="mt-3 flex items-center gap-2 rounded-2xl bg-candy/10 px-4 py-3 text-sm font-bold text-candy-dark" role="alert">
            <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
            Không lưu được vào trình duyệt (có thể đã hết dung lượng). Thay đổi sẽ mất khi tải lại trang. Hãy xóa bớt phần quà có ảnh.
          </p>
        )}
        {disabled && (
          <p className="mt-2 text-sm font-bold text-grape" role="status">
            Đang mở quà, đợi một chút rồi chỉnh tiếp nhé.
          </p>
        )}

        {/* A disabled fieldset disables every control inside it. */}
        <fieldset disabled={disabled} className={`mt-4 min-w-0 transition ${disabled ? 'opacity-60' : ''}`}>
          <legend className="sr-only">Chỉnh sửa phần quà</legend>
          {/* Two per row; phones keep one because the weight controls don't fit in half the width. */}
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {listed.map((config) => (
              <PrizeEditorRow
                key={config.id}
                config={config}
                chance={chances.get(config.id) ?? 0}
                onChange={onUpdate}
                onRemove={onRemove}
              />
            ))}
            <li className="flex">
              {customCount < MAX_CUSTOM_PRIZES ? (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-grape/40 bg-white/50 font-display text-xl font-extrabold text-grape transition hover:border-grape hover:bg-white"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-grape text-white">
                    <Plus className="size-7" aria-hidden="true" />
                  </span>
                  Thêm phần quà
                </button>
              ) : (
                <p className="flex min-h-36 w-full items-center justify-center rounded-3xl border-4 border-dashed border-ink/15 px-4 text-center font-bold text-ink-soft">
                  Đã đủ {MAX_CUSTOM_PRIZES} phần quà tự thêm. Hãy xóa bớt để thêm mới.
                </p>
              )}
            </li>
          </ul>
        </fieldset>
      </div>

      {adding && (
        <AddPrizeDialog
          color={CUSTOM_COLORS[customCount % CUSTOM_COLORS.length]}
          activeWeight={totalWeight}
          onAdd={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}
    </section>
  )
})
