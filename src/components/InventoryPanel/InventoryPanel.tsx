import { Backpack, PackageOpen, Trash2 } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { getItem } from '../../data/items'
import { getRarity } from '../../data/rarities'
import { formatNumber } from '../../lib/format'
import type { InventoryEntry, Item } from '../../types'
import { RewardCard } from '../RewardCard/RewardCard'

interface InventoryPanelProps {
  entries: InventoryEntry[]
  onClear: () => void
}

interface Stack {
  item: Item
  count: number
  lastAt: number
}

function toStacks(entries: InventoryEntry[]): Stack[] {
  const byId = new Map<string, Stack>()
  for (const entry of entries) {
    const item = getItem(entry.itemId)
    if (!item) continue
    const stack = byId.get(item.id)
    if (stack) {
      stack.count += 1
      stack.lastAt = Math.max(stack.lastAt, entry.obtainedAt)
    } else {
      byId.set(item.id, { item, count: 1, lastAt: entry.obtainedAt })
    }
  }
  return [...byId.values()].sort(
    (a, b) => getRarity(b.item.rarity).rank - getRarity(a.item.rarity).rank || b.lastAt - a.lastAt,
  )
}

export const InventoryPanel = memo(function InventoryPanel({ entries, onClear }: InventoryPanelProps) {
  const stacks = useMemo(() => toStacks(entries), [entries])
  const totalValue = useMemo(() => stacks.reduce((sum, s) => sum + s.item.value * s.count, 0), [stacks])
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const timer = window.setTimeout(() => setConfirming(false), 3000)
    return () => window.clearTimeout(timer)
  }, [confirming])

  return (
    <section id="inventory" aria-labelledby="inventory-title" className="panel scroll-mt-24 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow">This session</p>
          <h2 id="inventory-title" className="section-title mt-1.5 flex items-center gap-2.5">
            <Backpack className="size-6 text-gold-400" aria-hidden="true" />
            Inventory
          </h2>
        </div>
        {entries.length > 0 && (
          <div className="flex items-center gap-3">
            <dl className="flex gap-4 text-right">
              <div>
                <dt className="text-[0.65rem] tracking-[0.16em] text-subtle uppercase">Items</dt>
                <dd className="font-semibold text-gold-100 tabular-nums">{entries.length}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] tracking-[0.16em] text-subtle uppercase">Value</dt>
                <dd className="font-semibold text-gold-100 tabular-nums">{formatNumber(totalValue)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                if (confirming) onClear()
                setConfirming(!confirming)
              }}
              className={`btn-ghost h-9 px-3 text-xs ${confirming ? 'border-red-400/60 text-red-200' : ''}`}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {confirming ? 'Confirm clear' : 'Clear'}
            </button>
          </div>
        )}
      </div>

      {stacks.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-12 text-center">
          <div className="grid size-16 place-items-center rounded-2xl border border-dashed border-line-strong text-gold-500">
            <PackageOpen className="size-8" aria-hidden="true" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-gold-100">Your inventory is empty</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Open a case and every item you unbox will be collected here.</p>
          <a href="#open" className="btn-ghost mt-5 h-10">
            Go to cases
          </a>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stacks.map((stack) => (
            <li key={stack.item.id} className="animate-drop-in">
              <RewardCard item={stack.item} count={stack.count} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
})
