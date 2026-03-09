# ⚡ PokéBattle - Type Effectiveness Arena

A single-page React application that loads random Pokémon from the [PokéAPI](https://pokeapi.co), compares them by type effectiveness, and tracks battle results.

---

## 🚀 Live Demo

**[https://pokebattlenow.netlify.app/](https://pokebattlenow.netlify.app/)**

---

## Project Structure

```
pokebattle/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              ← Vite entry point
    ├── App.jsx               ← Layout orchestrator (thin, no logic)
    ├── index.css             ← All global styles
    ├── constants.js          ← TYPE_COLORS, RESULT_CONFIG, MAX_POKEMON_ID
    ├── utils.js              ← Pure helpers: randomInt, calcBaseStatTotal, etc.
    ├── hooks/
    │   └── usePokemonBattle.js  ← All state, async logic, useMemo, useCallback
    └── components/
        ├── Header.jsx        ← Static title banner
        ├── PokemonCard.jsx   ← Sprite + name + types + stats (React.memo)
        ├── ResultBanner.jsx  ← Battle outcome flash (React.memo)
        ├── Scoreboard.jsx    ← Four result counters (React.memo)
        └── ChampionStrip.jsx ← Highest BST tracker (React.memo)
```

---

## How to Run

### Prerequisites
- Node.js ≥ 18
- npm (or yarn / pnpm)

### Setup

```bash
cd pokebattle
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

> **Note:** Fonts (`Press Start 2P` and `Rajdhani`) are loaded from Google Fonts - a working internet connection is required.

---

## Running Tests

The project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/).

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run coverage
```

### What's Tested

| File | Coverage |
|---|---|
| `src/utils.js` | `randomInt`, `calcBaseStatTotal`, `capitalise`, `getSpriteUrl` |
| `src/constants.js` | `MAX_POKEMON_ID`, `TYPE_COLORS`, `RESULT_CONFIG` shape & values |
| `src/hooks/usePokemonBattle.js` | Initial state, first/second load flow, battle results, champion tracking, error handling |
| `src/components/ResultBanner.jsx` | All four result strings, fallback, accessibility role |
| `src/components/Scoreboard.jsx` | Score display, zero state, aria label |
| `src/components/ChampionStrip.jsx` | Null guard, name, BST, sprite, aria label |
| `src/components/PokemonCard.jsx` | Placeholder, stats, type badges, champion badge, dual-type |

---

## Architecture Decisions

### Why a custom hook (`usePokemonBattle`)?
All state, API calls, `useCallback`, and `useMemo` live in one place — the hook. `App.jsx` is left as a pure layout file, making it easy to read and change the UI without touching logic.

### Why `constants.js` and `utils.js`?
Values defined outside React components are created once at module load time and are never re-created on renders. Pure functions in `utils.js` are also easy to unit-test without mounting any component.

---

## Performance Optimisation — `useMemo` & `useCallback`

### The Problem These Hooks Solve

React re-renders a component every time its state or props change. Without optimisation, every re-render recreates every function and recomputes every derived value, even when they haven't meaningfully changed. A newly-created function is a *different reference* even if it does the same thing — this causes child components that receive it as a prop to re-render unnecessarily.

### `useCallback` — stable function references

| Function | Where | Why stable reference matters |
|---|---|---|
| `fetchTypeData` | `usePokemonBattle` | Listed as a dep of `determineResult`. Without `useCallback`, `determineResult` would be recreated every render, defeating its own memoisation. |
| `determineResult` | `usePokemonBattle` | Listed as a dep of `loadRandomPokemon`. Same cascade problem. |
| `loadRandomPokemon` | `usePokemonBattle` | Passed as `onClick`. Without `useCallback`, every parent render gives the button a new function prop, causing React to update the DOM node even when nothing changed visually. |

### `useMemo` — stable derived values

| Value | Where | Why |
|---|---|---|
| `scoreSummary` | `usePokemonBattle` | Derives `noAdvantage` from scores + loadCount. Scores change rarely; without memo the object is recalculated on every loading-state flip. |
| `championName` | `App.jsx` | Capitalising the champion name is a UI concern, not a logic concern. The dep is `champion?.name`, which only changes when a new record-holder is found. |

### `React.memo` — component-level memoisation

`PokemonCard`, `ResultBanner`, `Scoreboard`, and `ChampionStrip` are all wrapped in `React.memo`. Without this, all four components re-render every time the `loading` state flips (which happens twice per fetch — on and off), even though their props haven't changed.

### What Would Happen Without These Hooks

- `loadRandomPokemon` being recreated every render → the button receives a prop-change on every render → minor but unnecessary reconciliation.
- The `fetchTypeData → determineResult → loadRandomPokemon` useCallback chain being broken → stale-closure risk in future refactors and wasted allocation every render.
- `scoreSummary` without `useMemo` → recomputed on every loading-spinner render cycle.
- Without `React.memo` on cards → both cards re-render during the loading phase, causing unnecessary browser paint work.

---

## Comparison Logic

```
newType === prevType                       →  "TYPE MATCH!"
newType.double_damage_to ∋ prevType        →  "NEW POKÉMON WINS!"
newType.double_damage_from ∋ newType       →  "PREVIOUS POKÉMON WINS!"
prevType.double_damage_to ∋ newType        →  "PREVIOUS POKÉMON WINS!"
(none of the above)                        →  "NO ADVANTAGE"
```

Type data is fetched from `/api/v2/type/{name}` and cached in a `useRef` map so each type is fetched at most once per session.
