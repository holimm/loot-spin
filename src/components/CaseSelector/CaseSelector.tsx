import { Coins } from 'lucide-react'
import { memo, type CSSProperties } from 'react'
import { formatNumber } from '../../lib/format'
import type { LootCase } from '../../types'
import { CaseArt } from '../CaseArt/CaseArt'

interface CaseSelectorProps {
  cases: LootCase[]
  selectedId: string
  disabled: boolean
  onSelect: (lootCase: LootCase) => void
}

export const CaseSelector = memo(function CaseSelector({ cases, selectedId, disabled, onSelect }: CaseSelectorProps) {
  return (
    <div className="-mx-4 sm:mx-0">
      <ul
        aria-label="Choose a case"
        className="scrollbar-none relative flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {cases.map((c) => {
          const selected = c.id === selectedId
          return (
            <li key={c.id} className="w-[15.5rem] shrink-0 snap-start sm:w-auto">
              <button
                type="button"
                onClick={() => onSelect(c)}
                disabled={disabled && !selected}
                aria-pressed={selected}
                className={[
                  'group flex w-full items-center gap-3 rounded-full border py-1.5 pr-4 pl-1.5 text-left transition duration-300',
                  selected
                    ? 'border-gold-400/80 bg-linear-to-r from-gold-700/40 to-ink-800/90 shadow-[0_0_24px_-8px_var(--glow)]'
                    : 'border-line bg-ink-800/70 hover:border-line-strong hover:bg-ink-700/80',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                ].join(' ')}
                style={{ '--glow': c.theme.glow } as CSSProperties}
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-ink-950/70"
                  aria-hidden="true"
                >
                  <CaseArt theme={c.theme} className="size-11" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-sm font-semibold ${selected ? 'text-gold-100' : 'text-muted group-hover:text-gold-100'}`}
                  >
                    {c.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-subtle tabular-nums">
                    <Coins className="size-3 text-gold-400" aria-hidden="true" />
                    {formatNumber(c.cost)}
                    <span className="sr-only"> demo tokens</span>
                    <span aria-hidden="true">·</span>
                    {c.itemIds.length} items
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
