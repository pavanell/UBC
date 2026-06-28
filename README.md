# Ultimate Baking Championships

A retro pixel-art baking competition game for browsers. Walk through a top-down kitchen, gather ingredients, complete cooking actions, and compete in a four-round championship judged by Josh and Nicole.

## Technology

- TypeScript (strict mode)
- Phaser 3
- Vite
- HTML/CSS UI overlays
- GitHub Actions → GitHub Pages

## Local development

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173/UBC/`).

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

This repo deploys automatically when changes are pushed to `main`.

### Enable Pages (one-time)

1. Open **Settings → Pages** on GitHub.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`; the workflow builds and deploys `dist/`.

### Repository name / base path

Deployment uses:

- **GitHub user/org:** `pavanell`
- **Repository name:** `UBC`

If you rename the repository, update the base path in:

- `vite.config.ts` — `repositoryName`
- `src/config/deployment.ts` — `REPOSITORY_NAME`
- `public/404.html` — `repo` variable

Live site: `https://pavanell.github.io/UBC/`

## Project structure

```text
src/
  config/          Deployment constants
  data/            Ingredients, recipes, kitchen layout, challenges
  scenes/          Phaser scenes (home room, kitchen)
  systems/         Cooking, judging, rating, AI contestants
  state/           Session state (in-memory for v1)
  ui/              HTML overlay panels
  gameFlow.ts      Screen flow and championship loop
  main.ts          Entry point
tests/             Unit and smoke tests
```

## Adding ingredients

Add entries to `src/data/ingredients.ts` following the `Ingredient` type in `src/types/index.ts`.

## Adding recipes

Add structured entries to `src/data/recipes.ts`. Include required ingredients, quantity ranges, techniques, and failure modes.

## Adding kitchen stations

Add stations to `src/data/kitchenLayout.ts` and wire interaction in `src/gameFlow.ts` → `handleStation()`.

## Replacing placeholder sprites

Procedural textures are generated in `src/utils/sprites.ts` inside `generatePlaceholderTextures()`. Replace with atlas images and update scene references.

## Game modes

| Mode | Description |
|------|-------------|
| Normal | 4-round championship, free ingredient choice |
| Hard | Same as Normal plus 3 required ingredients per round |
| Free Cook | Sandbox kitchen, no judges or timer |

## Known limitations (v1)

- Progress is **session-only** — refreshing the browser resets championship and recipe library progress.
- Placeholder pixel sprites (no external art assets).
- No music or sound effects.

## Deferred features

- User accounts and cloud saves
- Cross-device progress and save slots
- Shared recipe database
- Live AI image generation
- Sound, music, and spoken dialogue
- Native App Store / Google Play builds

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm test` | Run Vitest suite |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## License

Prototype for educational and demonstration purposes. All characters, judges, and branding are original.
