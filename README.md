# Loot Spin

An interactive gacha and loot box opening experience built with Next.js, featuring animated reveals, rarity tiers, and collectible rewards.

## Features

- **Animated Loot Openings** — Smooth roulette animations with suspenseful reward reveals.
- **Rarity System** — Multiple rarity tiers with distinct colors and visual effects.
- **Case Selection** — Explore different cases, each with its own theme and reward pool.
- **Collectible Rewards** — Discover items with unique artwork, names, and rarity levels.
- **Inventory System** — Keep track of collected items throughout your session.
- **Recent Drops** — Browse recently revealed rewards.
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices.
- **Modern UI** — Dark gaming aesthetic with atmospheric effects and polished interactions.

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework
- [React](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Lucide](https://lucide.dev/) — Icons

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm, pnpm, Yarn, or another compatible package manager

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd loot-spin
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run the linter, if configured        |

The available scripts depend on the repository's `package.json`.

## Project Structure

```text
loot-spin/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable UI components
│   ├── data/               # Cases, items, and mock data
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and game logic
│   └── types/              # TypeScript definitions
├── package.json
└── README.md
```

The structure may evolve as the project grows.

## How It Works

1. Select a loot box with a unique collection of possible rewards.
2. Start the opening animation.
3. Watch the reward roulette slow down and reveal the winning item.
4. Discover the item's rarity and details.
5. View your collected rewards in the inventory.
6. Open another loot box and continue collecting.

## Development Notes

Loot Spin is designed to support an extensible case and reward system. Case definitions, item metadata, rarity configurations, and reward selection logic should remain separate from presentation components.

The current experience can use mock data and client-side state, making it suitable for prototyping and UI experimentation without requiring a backend.

Client-side reward selection is intended for demonstration purposes only. A production implementation requiring valuable or tradable rewards would need server-authoritative reward generation, validation, and appropriate security controls.

## Roadmap

- [ ] Add more loot box themes and reward collections.
- [ ] Improve opening animations and reward reveal effects.
- [ ] Add item filtering and sorting to the inventory.
- [ ] Introduce opening history and collection statistics.
- [ ] Add sound effects and optional animation settings.
- [ ] Explore backend integration for persistent user inventories.

## License

No license has been specified yet. All rights reserved unless a license is added to this repository.
