# Hộp Quà May Mắn

A joyful, Counter-Strike–style loot box for kids, built with React, Vite and TypeScript. After a kid answers a question correctly, they open the box: a strip of prize cards races past a marker, slows down, and stops on their prize. The prize list can be edited right on the main screen.

The app is a static single-page site deployed to GitHub Pages, with no backend. Prize settings are saved in the browser's `localStorage`.

## Features

- **Loot box opening**: a horizontal strip of prize cards that launches fast, slows down, and lands on the prize. The prize is drawn by weight *before* the animation, and the strip is built so it always lands on that prize.
- **Odds hidden from kids**: the filler cards in the strip are picked evenly from the enabled prizes, so how often a prize scrolls past says nothing about its chance. Only the winning card uses the real weights.
- **Big, tablet-friendly controls**: a large "MỞ QUÀ!" button, with layouts for phones and for tablets in portrait and landscape.
- **Celebrations by rarity** (rarity only shows after a prize is won):
  - **under 8% chance**: "SIÊU HIẾM!", star bursts, side cannons, light rays and a wiggling prize
  - **under 15%**: a medium burst
  - **everything else**: a small burst
  - **"Chúc may mắn"**: an encouraging message and no confetti
- **Special prizes**:
  - **Lượt quay**: the reveal offers "Mở tiếp!", which starts a free extra opening right away.
  - **Cộng điểm**: shown as a prize. The app has no scoring system, so the teacher adds the points.
- **Editable prize list**: tap **Các phần quà** under the open button to show the list. Each prize can be renamed, turned on or off, and have its weight changed, with the live percentage next to it. "Khôi phục mặc định" resets everything. The list is locked while a box is opening.
- **Add your own prizes**: up to 24 extra prizes, each with a name, a weight and an optional photo from the device. Photos are shrunk in the browser (max 320px) and saved with the prize. A prize without a photo gets a colorful gift-box picture. Added prizes can be renamed or re-photographed.
- **Delete any prize**: every prize has a red delete button (tap twice to confirm). Deleted added prizes are gone for good. Deleted built-in prizes appear under "Đã xóa", where one tap brings them back with their name and weight.
- **Sound effects**: a whoosh when the box opens, a tick each time a card passes the marker (fast at first, slowing down with the strip), and a reveal jingle sized to the prize's rarity. Sounds are generated in the browser, with no audio files. The speaker button in the header turns sound on or off, and the choice is remembered.
- **Accessible**: keyboard support, visible focus, Vietnamese screen-reader text, and support for `prefers-reduced-motion` (no long scroll and no confetti).

## Prizes and odds

Weights are relative, not percentages. A prize's chance is its weight divided by the total weight of all enabled prizes.

| Prize           | Image                 | Default weight | Chance |
| --------------- | --------------------- | -------------- | ------ |
| Bánh            | `banh.webp`           | 40             | 22.2%  |
| Chúc may mắn    | `chuc-may-man.webp`   | 30             | 16.7%  |
| Dụng cụ học tập | `dung-cu-hoc-tap.webp`| 30             | 16.7%  |
| Móc khóa        | `moc-khoa.webp`       | 20             | 11.1%  |
| Lego            | `lego.webp`           | 20             | 11.1%  |
| Lượt quay       | `luot-quay.webp`      | 20             | 11.1%  |
| Gấu bông        | `gau-bong.webp`       | 10             | 5.6%   |
| Cộng điểm       | `cong-diem.webp`      | 10             | 5.6%   |

Images live in `src/assets/` and are linked to each prize by a fixed `id` in `src/data/prizes.ts`, never by its name. Renaming a prize in settings can't break its image.

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### Install and run

```bash
npm install
```

```bash
npm run dev
```

Then open the URL that Vite prints (http://localhost:5173 by default).

## Available Scripts

| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Start the Vite dev server                              |
| `npm run build`     | Type-check and build the production bundle to `dist/`  |
| `npm run typecheck` | Run the TypeScript project build without emitting      |
| `npm run lint`      | Lint with Oxlint                                       |
| `npm run preview`   | Serve the production build locally                     |

## Editing prizes

1. Tap **Các phần quà** below the "MỞ QUÀ!" button to show the prize list. Tap it again to hide it.
2. Edit names, on/off switches and weights. The percentage next to each prize updates live, and changes save automatically.
3. To add a prize, tap **Thêm phần quà** at the end of the list. Enter a name and weight, and optionally tap the gift box to choose a photo. The live percentage shows what its chance will be.
4. Added prizes are tagged **Tự thêm**; tap the photo to change it.
5. Tap a prize's red trash button twice to delete it. Deleted built-in prizes are listed under **Đã xóa** with a restore button; deleted added prizes can't be brought back.
6. **Khôi phục mặc định** asks for a second tap, then restores the defaults above. This also deletes all added prizes, and the confirm button says how many.

There is no PIN: anyone using the device can edit the prizes. The list starts hidden and never shows odds on the opening screen itself.

## Saved data

All reads and writes are wrapped in `try/catch`. If storage is empty, unavailable or broken, the app falls back to the defaults.

| Key                               | Contents |
| --------------------------------- | -------- |
| `loot-spin:prize-settings:v1`     | `{ "version": 2, "prizes": [{ "id", "name", "weight", "enabled", "custom"?, "removed"?, "image"?, "color"? }, …] }` |
| `loot-spin:sound:v1`              | `true` / `false` — sound on or off |

When loading, saved settings are cleaned up field by field in `sanitizeSettings()` (`src/lib/prizes.ts`):

- Version 1 data (from before prizes could be added) is migrated automatically.
- A missing or invalid field falls back to that prize's default.
- Weights are rounded and clamped to 0–999.
- Missing built-in prizes are restored. Unknown ids, duplicates and anything beyond 24 added prizes are dropped.
- An added prize's photo must be a WebP, JPEG or PNG data URL under about 400 KB; anything else is replaced by the gift-box picture.
- Data from an unknown version, or that can't be read at all, is replaced by the defaults.

Each added photo takes roughly 20–40 KB, so 24 of them fit easily in the browser's storage. If a save does fail (for example, storage is full), the prize list shows a warning that changes will be lost on reload.

## Project Structure

```text
src/
├── assets/                  # Prize images (*.webp)
├── components/
│   ├── Header/
│   ├── LootStrip/           # The scrolling prize strip and center marker
│   ├── PhotoPicker/         # Tap-to-choose photo for added prizes
│   ├── PrizeEditor/         # Collapsible, editable prize list + "add prize" form
│   ├── PrizeImage/          # Prize photo or gift-box placeholder
│   └── PrizeReveal/         # Reveal popup + confetti
├── data/prizes.ts           # Default prizes, weights, images, colors, effects
├── hooks/                   # Opening state machine, prize settings, storage
├── lib/                     # Pure logic: odds, draw, strip building, photo resizing, sound, confetti
├── types/
├── App.tsx
├── index.css                # Tailwind theme tokens + shared styles
└── main.tsx
```

### How an opening works

1. `rollPrize()` (`src/lib/prizes.ts`) draws a prize from the enabled prizes by weight, using `crypto.getRandomValues`.
2. `buildSpinStrip()` (`src/lib/roulette.ts`) carries over the cards on screen, adds evenly picked filler cards, and places the drawn prize at the landing spot.
3. `LootStrip` measures the card size at that moment and animates the strip once with the Web Animations API. React doesn't re-render during the animation, and the landing stays exact at any screen size, even if the tablet is rotated mid-opening.
4. When the strip stops, the winning card glows and the reveal popup opens with a celebration sized by `celebrationTier()`.

Taps during an opening are ignored, and the prize list is locked until it stops.

### Adding a built-in prize in code

Prizes added in the app are saved in the browser only. To ship a prize with the app for everyone:

1. Put the image in `src/assets/`.
2. Add its `id` to `PrizeId` in `src/types/index.ts`.
3. In `src/data/prizes.ts`, add a row to `DEFAULT_PRIZES` and an entry to `PRIZE_ASSETS` (image, color and optional effect).

The strip and the prize list pick it up automatically.

## Deploying to GitHub Pages

Deployment runs automatically through `.github/workflows/deploy.yml` on every push to `main`. You can also run it manually from the **Actions** tab.

### One-time setup

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.

> The workflow fails at **Configure GitHub Pages** until Pages is enabled with GitHub Actions as the source.

### What the workflow does

1. Checks out the repository.
2. Sets up Node.js.
3. Runs `actions/configure-pages`, which reports the site's base path.
4. Installs dependencies with `npm ci`.
5. Builds with `npm run build`, passing that base path as `BASE_PATH`.
6. Uploads `dist/` and deploys it with `actions/deploy-pages`.

The site is then available at `https://<username>.github.io/<repository>/`.

### Base path

`vite.config.ts` reads the base path from the `BASE_PATH` environment variable:

| `BASE_PATH`                 | Resulting `base` | Use case                                           |
| --------------------------- | ---------------- | -------------------------------------------------- |
| unset, `""` or `/`          | `/`              | Local dev, custom domain, `<user>.github.io` repo  |
| `loot-spin` or `/loot-spin` | `/loot-spin/`    | Project site `https://<user>.github.io/loot-spin/` |
| `./`                        | `./`             | Relative, portable build                           |

In CI no setup is needed. The workflow passes the base path that GitHub Pages reports, so the repository name is never hardcoded. To force a value, add a repository variable named `BASE_PATH` under **Settings → Secrets and variables → Actions → Variables**.

To test a sub-path build locally:

```bash
BASE_PATH=/loot-spin npm run build
```

```bash
BASE_PATH=/loot-spin npm run preview
```

Then open http://localhost:4173/loot-spin/.

## License

No license has been specified yet. All rights reserved unless a license is added to this repository.
