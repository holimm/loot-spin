import { ChevronDown, RotateCcw } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import type { PrizePatch } from '../../hooks/usePrizeSettings'
import { getActivePrizes } from '../../lib/prizes'
import type { PrizeId, PrizeSettings } from '../../types'
import { PrizeEditorRow } from './PrizeEditorRow'

interface PrizeEditorProps {
  settings: PrizeSettings
  /** Locked while opening: removing a prize would change the cards under the marker. */
  disabled: boolean
  onUpdate: (id: PrizeId, patch: PrizePatch) => void
  onReset: () => void
}

/** The prize list, hidden behind a toggle and editable in place. Changes save automatically. */
export const PrizeEditor = memo(function PrizeEditor({ settings, disabled, onUpdate, onReset }: PrizeEditorProps) {
  const active = useMemo(() => getActivePrizes(settings), [settings])
  const chances = useMemo(() => new Map(active.map((p) => [p.id, p.chance])), [active])
  const totalWeight = active.reduce((sum, p) => sum + p.weight, 0)
  const [expanded, setExpanded] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 4000)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

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
              {active.length}/{settings.prizes.length}
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
            {confirmReset ? 'Bấm lần nữa để khôi phục' : 'Khôi phục mặc định'}
          </button>
        </div>

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
            {settings.prizes.map((config) => (
              <PrizeEditorRow key={config.id} config={config} chance={chances.get(config.id) ?? 0} onChange={onUpdate} />
            ))}
          </ul>
        </fieldset>
      </div>
    </section>
  )
})
