import { ShieldCheck } from 'lucide-react'
import { NAV_LINKS } from '../../data/navigation'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line/80 bg-ink-950/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-base font-bold tracking-[0.14em] text-gold-200">LOOT SPIN</p>
          <p className="mt-2 flex max-w-xl items-start gap-2 text-xs leading-relaxed text-subtle">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
            A frontend demo. Tokens and items are simulated, free and have no monetary value — there are no
            purchases, payouts or real-money gambling. Rewards are rolled in your browser for illustration only.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="rounded transition hover:text-gold-100">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
