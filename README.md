# Loot Spin

An interactive gacha / loot box opening experience built with React, Vite and TypeScript, featuring an animated reward roulette, rarity tiers and a session inventory. It is a static single-page app deployed to GitHub Pages.

> **Demo only.** Tokens and items are simulated, free and have no monetary value. There are no purchases, payouts or real-money gambling, and rewards are rolled in the browser for illustration.

## Features

- **Roulette opening**: a horizontal reward strip that launches fast, slows down and lands on the predetermined winner, then highlights it and opens a reveal modal.
- **Rarity system**: six tiers (Consumer → Covert) with consistent colors, labels and glows, configured in one module.
- **Case selection**: four themed cases, each with its own artwork, cost, reward pool and rarity odds.
- **Possible rewards**: every item in the selected case, with value and drop chance.
- **Demo inventory**: unboxed items stack by type, persisted in `localStorage` with safe fallbacks.
- **Recent drops**: a deterministic, client-side simulated feed that your own unboxings join.
- **Responsive and accessible**: works from 320px up, has keyboard-accessible controls, visible focus states and a native `<dialog>` modal, and respects `prefers-reduced-motion`.
- **No external images**: all artwork is original inline SVG, and fonts are self-hosted through Fontsource.

## Tech Stack

- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) v4 (via `@tailwindcss/vite`, configured in `src/index.css`)
- [Lucide](https://lucide.dev/) icons
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting
- GitHub Actions + GitHub Pages for hosting

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### Install and run

```bash
git clone <repository-url>
cd loot-spin
npm install
npm run dev
```

Then open the URL that Vite prints (http://localhost:5173 by default).

## Available Scripts

| Command             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                            |
| `npm run build`     | Type-check and build the production bundle to `dist/` |
| `npm run typecheck` | Run the TypeScript project build without emitting     |
| `npm run lint`      | Lint with Oxlint                                     |
| `npm run preview`   | Serve the production build locally                   |

## Project Structure

```text
loot-spin/
├── .github/workflows/deploy.yml   # Build + deploy to GitHub Pages
├── public/                        # Static files copied as-is (favicon)
├── src/
│   ├── components/                # UI components, one folder each
│   │   ├── CaseArt/               # Themed SVG chest illustration
│   │   ├── CaseRoulette/          # Spinning reward strip (core animation)
│   │   ├── CaseSelector/
│   │   ├── FeaturedCase/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── InventoryPanel/
│   │   ├── ItemArt/               # Item artwork (icon + tint + rarity light)
│   │   ├── OpeningResult/         # Reward reveal modal
│   │   ├── RarityBadge/
│   │   ├── RecentDrops/
│   │   ├── RewardCard/
│   │   └── RewardGrid/
│   ├── data/                      # Cases, items, rarities, mock feed data
│   ├── hooks/                     # Opening state machine, inventory, wallet, feed
│   ├── lib/                       # Pure logic: RNG, reward rolls, strip geometry
│   ├── types/
│   ├── App.tsx
│   ├── index.css                  # Tailwind theme tokens + shared styles
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

## How It Works

1. **Roll first.** When you click **Open case**, `rollReward()` (`src/lib/rewards.ts`) picks a rarity tier using the case's weights, then an item uniformly within that tier. This happens *before* any animation.
2. **Build the strip.** `buildSpinStrip()` (`src/lib/roulette.ts`) carries over the cards currently on screen, so the spin starts seamlessly where the last one stopped. It then adds filler cards rolled with the same odds and places the winner at the landing index, with a small random offset so the marker doesn't always hit dead center.
3. **Animate imperatively.** `CaseRoulette` measures the card width, gap and viewport at spin time and runs a single Web Animations API transform. React renders once per spin, not once per frame. When the animation finishes, the position is re-measured, which keeps the landing exact even if the window was resized mid-spin.
4. **Reveal.** The winner is highlighted, added to the inventory and the recent-drops feed, and the result modal opens.

`useCaseOpening` guards the flow with a synchronous lock, so extra clicks during a spin are ignored. With `prefers-reduced-motion: reduce`, the strip jumps straight to the winner.

### Adding a case

1. Add the items to `src/data/items.ts` (name, rarity, value, icon and tint).
2. Append a case to `CASES` in `src/data/cases.ts` with its theme colors, emblem, cost, `itemIds` and `rarityWeights`.

The selector, featured case, odds, reward grid and roulette pick it up automatically. Rarity colors and labels live only in `src/data/rarities.ts`.

## Deploying to GitHub Pages

Deployment runs automatically through `.github/workflows/deploy.yml` on every push to `main`. You can also run it manually from the **Actions** tab.

### One-time setup

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.

> The workflow fails at **Configure GitHub Pages** until Pages is enabled with GitHub Actions as the source.

### What the workflow does

1. Checks out the repository.
2. Sets up Node.js (with the npm cache).
3. Runs `actions/configure-pages`, which reports the site's base path.
4. Installs dependencies from the lockfile with `npm ci`.
5. Builds with `npm run build`, passing the base path as `BASE_PATH`.
6. Uploads `dist/` with `actions/upload-pages-artifact`.
7. Deploys it with `actions/deploy-pages` to the `github-pages` environment.

The site is then available at `https://<username>.github.io/<repository>/`.

### Base path

Vite needs to know the sub-path the site is served from. `vite.config.ts` reads it from the `BASE_PATH` environment variable and normalizes it:

| `BASE_PATH`                    | Resulting `base` | Use case                                         |
| ------------------------------ | ---------------- | ------------------------------------------------ |
| unset, `""` or `/`             | `/`              | Local dev, custom domain, `<user>.github.io` repo |
| `loot-spin` or `/loot-spin`    | `/loot-spin/`    | Project site `https://<user>.github.io/loot-spin/` |
| `./`                           | `./`             | Relative, portable build                         |

In CI you don't need to configure anything. The workflow passes the base path that GitHub Pages reports, which is `/<repository>` for a project site and empty for a custom domain or user site. The repository name is never hardcoded, so renaming the repo or adding a custom domain keeps working.

To force a specific value, add a repository variable named `BASE_PATH` under **Settings → Secrets and variables → Actions → Variables**. It takes precedence over the detected value.

### Custom domain

Configure the domain under **Settings → Pages → Custom domain**. On the next deployment the detected base path becomes empty and the site builds for `/`.

### Testing a sub-path build locally

```bash
BASE_PATH=/loot-spin npm run build
```

```bash
BASE_PATH=/loot-spin npm run preview
```

Then open http://localhost:4173/loot-spin/.

## Development Notes

- Case definitions, item metadata, rarity configuration, reward selection and UI components are kept in separate modules.
- Persistence (`usePersistentState`) validates stored data and falls back to in-memory state when storage is unavailable or corrupt.
- Client-side reward selection is for demonstration only. A real system with valuable or tradable rewards would need server-authoritative rolls, validation and appropriate security controls.

## License

No license has been specified yet. All rights reserved unless a license is added to this repository.
