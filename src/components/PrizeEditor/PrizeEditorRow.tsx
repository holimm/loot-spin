import { Minus, Plus } from 'lucide-react'
import { memo, useState } from 'react'
import { MAX_NAME_LENGTH, MAX_WEIGHT, PRIZE_ASSETS, defaultPrize } from '../../data/prizes'
import type { PrizePatch } from '../../hooks/usePrizeSettings'
import { formatPercent } from '../../lib/prizes'
import type { PrizeConfig, PrizeId } from '../../types'

interface PrizeEditorRowProps {
  config: PrizeConfig
  chance: number
  onChange: (id: PrizeId, patch: PrizePatch) => void
}

const WEIGHT_STEP = 5

const EFFECT_HINTS = {
  'extra-spin': 'Tặng bạn thêm 1 lần mở quà ngay',
  'better-luck': 'Không có quà, chỉ động viên bạn',
} as const

export const PrizeEditorRow = memo(function PrizeEditorRow({ config, chance, onChange }: PrizeEditorRowProps) {
  const { id, name, weight, enabled } = config
  const asset = PRIZE_ASSETS[id]
  const fallbackName = defaultPrize(id).name
  // Raw text while the weight field is being edited; null otherwise.
  const [draft, setDraft] = useState<string | null>(null)
  const nameId = `name-${id}`
  const weightId = `weight-${id}`

  const setWeight = (value: number) => onChange(id, { weight: Math.min(MAX_WEIGHT, Math.max(0, value)) })

  return (
    <li className={`card flex flex-col gap-4 p-4 transition ${enabled ? '' : 'bg-white/60'}`}>
      <div className="flex items-center gap-3">
        <img
          src={asset.image}
          alt=""
          className={`size-16 shrink-0 rounded-2xl border-4 bg-white object-contain transition ${enabled ? '' : 'grayscale'}`}
          style={{ borderColor: asset.color }}
        />
        <div className="min-w-0 flex-1">
          <label htmlFor={nameId} className="text-xs font-bold tracking-wide text-ink-soft uppercase">
            Tên phần quà
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder={fallbackName}
            onChange={(e) => onChange(id, { name: e.target.value })}
            onBlur={() => !name.trim() && onChange(id, { name: fallbackName })}
            className="mt-0.5 h-11 w-full rounded-xl border-2 border-ink/10 bg-white px-3 text-lg font-bold outline-none focus:border-grape"
          />
          {asset.effect && <p className="mt-1 text-xs font-semibold text-grape">{EFFECT_HINTS[asset.effect]}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Bật phần quà ${name || fallbackName}`}
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

        <div className="flex items-center gap-2">
          <label htmlFor={weightId} className="sr-only">
            Trọng số của {name || fallbackName}
          </label>
          <button
            type="button"
            onClick={() => setWeight(weight - WEIGHT_STEP)}
            disabled={weight <= 0}
            className="btn-white size-12 text-xl"
            aria-label={`Giảm trọng số ${name || fallbackName}`}
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
            className="h-12 w-16 rounded-xl border-2 border-ink/10 bg-white text-center font-display text-2xl font-extrabold outline-none focus:border-grape"
          />
          <button
            type="button"
            onClick={() => setWeight(weight + WEIGHT_STEP)}
            disabled={weight >= MAX_WEIGHT}
            className="btn-white size-12 text-xl"
            aria-label={`Tăng trọng số ${name || fallbackName}`}
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
    </li>
  )
})
