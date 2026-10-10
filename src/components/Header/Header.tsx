import { Backpack, Coins, RotateCcw } from 'lucide-react'
import { memo } from 'react'
import { NAV_LINKS } from '../../data/navigation'
import { STARTING_TOKENS } from '../../hooks/useDemoWallet'
import { formatNumber } from '../../lib/format'

interface HeaderProps {
  balance: number
  inventoryCount: number
  onRefill: () => void
}

export const Header = memo(function Header({ balance, inventoryCount, onRefill }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="Loot Spin home">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={36} height={36} className="size-9" />
          <span className="hidden flex-col leading-none min-[420px]:flex">
            <span className="font-display text-lg font-bold tracking-[0.14em] text-gold-200">LOOT SPIN</span>
            <span className="mt-1 text-[0.6rem] tracking-[0.3em] text-subtle uppercase">Mystery Crate Forge</span>
          </span>
        </a>

        <nav aria-label="Primary" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-ink-700 hover:text-gold-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div
            className="flex h-10 items-center gap-2 rounded-full border border-gold-600/50 bg-ink-800/80 pr-1 pl-3"
            title="Demo tokens — free and worthless"
          >
            <Coins className="size-4 text-gold-300" aria-hidden="true" />
            <span className="text-sm font-semibold text-gold-100 tabular-nums">
              <span className="sr-only">Demo token balance: </span>
              {formatNumber(balance)}
            </span>
            <button
              type="button"
              onClick={onRefill}
              disabled={balance >= STARTING_TOKENS}
              className="grid size-8 place-items-center rounded-full text-gold-300 transition hover:bg-ink-600 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label={`Refill demo tokens to ${formatNumber(STARTING_TOKENS)}`}
              title="Refill demo tokens"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>

          <a
            href="#inventory"
            className="relative grid size-10 place-items-center rounded-full border border-line-strong bg-ink-800/80 text-gold-200 transition hover:border-gold-500/70"
            aria-label={`Inventory, ${inventoryCount} items`}
          >
            <Backpack className="size-[18px]" aria-hidden="true" />
            {inventoryCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-300 px-1 text-[0.65rem] font-bold text-ink-950 tabular-nums">
                {inventoryCount > 99 ? '99+' : inventoryCount}
              </span>
            )}
          </a>

          <div className="hidden items-center gap-2.5 border-l border-line pl-3 sm:flex">
            <div
              className="grid size-9 place-items-center rounded-full bg-linear-to-br from-arcane to-gold-500 font-display text-sm font-bold text-ink-950"
              aria-hidden="true"
            >
              G
            </div>
            <div className="hidden leading-tight xl:block">
              <p className="text-sm font-semibold text-gold-100">Guest Forger</p>
              <p className="text-[0.68rem] text-subtle">Demo profile</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})
