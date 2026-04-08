# Color Game

A color memory game clone of [dialed.gg](https://dialed.gg) — we show you colors, you recreate them from memory. It's harder than you think.

**Play now:** [xpos587.github.io/color-game](https://xpos587.github.io/color-game/)

## How it works

1. **Memorize** — a color is shown for a few seconds
2. **Recreate** — adjust hue, saturation, and brightness sliders to match
3. **Score** — see how close you got (0–10 per round, 5 rounds)

Supports easy and hard mode (hard = shorter memorize time, stricter scoring).

## Tech stack

- **Next.js 16** (static export) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Bun** — package manager and runtime
- **Biome** — linting and formatting
- **ast-grep** — structural lint rules (e.g. no `useEffect`)
- **Lefthook** — git hooks (pre-commit lint, commit message convention)
- **GitHub Actions** — CI + deploy to GitHub Pages

## Getting started

```bash
bun install
bun run dev
```

Open [localhost:3000/color-game](http://localhost:3000/color-game).

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run lint` | Biome + ast-grep check |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format with Biome |
| `bun run typecheck` | TypeScript check |
| `bun run check` | lint + typecheck + build |

Or use [Taskfile](https://taskfile.dev):

```bash
task dev       # start dev server
task lint      # lint check
task check     # full quality gate
```

## Project structure

```
src/
├── app/              # Next.js app router
│   ├── globals.css   # Global styles + animations
│   ├── layout.tsx    # Root layout (fonts, metadata)
│   └── page.tsx      # Entry point → GameShell
├── components/
│   ├── game/         # Screen components (Intro, Countdown, Memorize, Picker, Result, Total)
│   ├── picker/       # HSB strip + handle
│   └── ui/           # Shared UI (AnimatedScore, ColorSwatch, ModeToggle)
├── hooks/            # useDrag, useGameLoop, useSound, useTimer
├── lib/              # color math, sound engine, useMountEffect
└── types/            # Game types
```

## Architecture notes

- **No `useEffect`** — enforced by ast-grep rules. Use `useMountEffect` for mount-only sync, inline computation for derived state, event handlers for user actions, `key` prop for resets.
- **Sound engine** — Web Audio API with eager `AudioContext` creation and user-gesture unlock. Speech synthesis for robot voice feedback.
- **Static export** — `output: "export"` in next.config.ts, deployed via GitHub Pages with `basePath: "/color-game"`.

## License

[MIT](LICENSE)
