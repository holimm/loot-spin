import { Minus, Plus, Trash2 } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { CUSTOM_DEFAULT_NAME, MAX_NAME_LENGTH, MAX_WEIGHT, defaultPrize, isBuiltInId } from '../../data/prizes'
import type { PrizePatch } from '../../hooks/usePrizeSettings'
import { formatPercent, prizeLook } from '../../lib/prizes'
import type { PrizeConfig, PrizeId } from '../../types'
import { PhotoPicker } from '../PhotoPicker/PhotoPicker'
import { PrizeImage } from '../PrizeImage/PrizeImage'

interface PrizeEditorRowProps {
  config: PrizeConfig
  chance: number
  onChange: (id: PrizeId, patch: PrizePatch) => void
  onRemove: (id: PrizeId) => void
}

const WEIGHT_STEP = 5

const EFFECT_HINTS = {
  'extra-spin': 'Tặng bạn thêm 1 lần mở quà ngay',
  'better-luck': 'Không có quà, chỉ động viên bạn',
} as const

export const PrizeEditorRow = memo(function PrizeEditorRow({ config, chance, onChange, onRemove }: PrizeEditorRowProps) {
  const { id, name, weight, enabled, custom } = config
  const look = prizeLook(config)
  const fallbackName = isBuiltInId(id) ? defaultPrize(id).name : CUSTOM_DEFAULT_NAME
  const displayName = name.trim() || fallbackName
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => {
    if (!confirmRemove) return
    const timer = window.setTimeout(() => setConfirmRemove(false), 4000)
    return () => window.clearTimeout(timer)
  }, [confirmRemove])
  // Raw text while the weight field is being edited; null otherwise.
  const [draft, setDraft] = useState<string | null>(null)
  const nameId = `name-${id}`
  const weightId = `weight-${id}`

  const setWeight = (value: number) => onChange(id, { weight: Math.min(MAX_WEIGHT, Math.max(0, value)) })

  return (
    <li className={`card flex flex-col gap-3 p-3 transition sm:gap-4 sm:p-4 ${enabled ? '' : 'bg-white/60'}`}>
      <div className="flex items-center gap-3">
        {custom ? (
          <PhotoPicker
            image={look.image}
            color={look.color}
            onPick={(image) => onChange(id, { image })}
            label={`Đổi ảnh cho ${displayName}`}
          />
        ) : (
          <PrizeImage
            image={look.image}
            color={look.color}
            fit="contain"
            className={`size-16 shrink-0 rounded-2xl border-4 bg-white transition ${enabled ? '' : 'grayscale'}`}
            borderColor={look.color}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <label htmlFor={nameId} className="text-xs font-bold tracking-wide text-ink-soft uppercase">
              Tên phần quà
            </label>
            {custom && <span className="rounded-full bg-sun/40 px-2 py-0.5 text-[0.65rem] font-extrabold text-ink">Tự thêm</span>}
          </div>
          <input
            id={nameId}
            type="text"
            autoComplete="off"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder={fallbackName}
            onChange={(e) => onChange(id, { name: e.target.value })}
            onBlur={() => !name.trim() && onChange(id, { name: fallbackName })}
            className="mt-0.5 h-11 w-full rounded-xl border-2 border-ink/10 bg-white px-3 text-lg font-bold outline-none focus:border-grape"
          />
          {look.effect && <p className="mt-1 text-xs font-semibold text-grape">{EFFECT_HINTS[look.effect]}</p>}
        </div>
      </div>

      {/* Two fixed rows so nothing wraps awkwardly on phones: on/off + delete, then weight + odds. */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={`Bật phần quà ${displayName}`}
            onClick={() => onChange(id, { enabled: !enabled })}
            className="flex items-center gap-2 rounded-full py-1 pr-2 font-bold"
          >
            <span className={`relative h-9 w-16 rounded-full transition-colors ${enabled ? 'bg-mint' : 'bg-ink/20'}`}>
              <span
                className={`absolute top-1 left-1 size-7 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-7' : ''}`}
              />
            </span>
            <span className={enabled ? 'text-ink' : 'text-ink-soft'}>{enabled ? 'Đang bật' : 'Đang tắt'}</span>
          </button>
          <button
            type="button"
            onClick={() => (confirmRemove ? onRemove(id) : setConfirmRemove(true))}
            className={`btn-red h-11 shrink-0 text-sm sm:h-12 ${confirmRemove ? 'px-3 ring-4 ring-[#ef5350]/35 sm:px-4' : 'w-11 sm:w-12'}`}
            aria-label={confirmRemove ? `Bấm lần nữa để xóa ${displayName}` : `Xóa ${displayName}`}
          >
            <Trash2 className="size-5" aria-hidden="true" />
            {confirmRemove && 'Xóa?'}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor={weightId} className="sr-only">
              Trọng số của {displayName}
            </label>
            <button
              type="button"
              onClick={() => setWeight(weight - WEIGHT_STEP)}
              disabled={weight <= 0}
              className="btn-white size-11 text-xl sm:size-12"
              aria-label={`Giảm trọng số ${displayName}`}
            >
              <Minus className="size-5" aria-hidden="true" />
            </button>
            <input
              id={weightId}
              type="text"
              inputMode="numeric"
              value={draft ?? String(weight)}
              onFocus={(e) => {
                setDraft(String(weight))
                e.currentTarget.select()
              }}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, String(MAX_WEIGHT).length)
                setDraft(digits)
                if (digits !== '') setWeight(Number(digits))
              }}
              onBlur={() => setDraft(null)}
              className="h-11 w-14 rounded-xl border-2 border-ink/10 bg-white text-center font-display text-2xl font-extrabold outline-none focus:border-grape sm:h-12 sm:w-16"
            />
            <button
              type="button"
              onClick={() => setWeight(weight + WEIGHT_STEP)}
              disabled={weight >= MAX_WEIGHT}
              className="btn-white size-11 text-xl sm:size-12"
              aria-label={`Tăng trọng số ${displayName}`}
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          </div>
          <output
            htmlFor={weightId}
            className={`min-w-20 rounded-full px-3 py-1.5 text-center font-display text-xl font-extrabold tabular-nums ${
              chance > 0 ? 'bg-grape/10 text-grape' : 'bg-ink/5 text-ink-soft'
            }`}
            aria-label={`Tỉ lệ thực tế: ${formatPercent(chance)}`}
          >
            {formatPercent(chance)}
          </output>
        </div>
      </div>
    </li>
  )
})
