# CLAUDE.md

## Project Overview

"THE FLOWERS" — a browser-based zombie apocalypse survival game built with React + Vite. Players manage a group of survivors through phases of scavenging, defending, and decision-making with RPG elements, equipment, difficulty modes, and 16-bit sprite art.

## Important: Directory Structure

The git repo and all project files are in this `the-flowers/` subdirectory. The parent `Zombie Survival Game/` folder is NOT a git repo. Always run commands from here.

## Deployment

- **GitHub:** https://github.com/DWG131313/the-flowers
- **Live:** Deployed to Vercel
- **Deploy:** `vercel --prod` from this directory

## Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build (use npx vite build if npm script fails)
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

### Game Logic (src/game/)
- `effects.js` — Central game logic, 50+ effect cases. Most-edited file — expect multiple rounds of changes
- `phaseAdvance.js` — Phase progression. Second most-edited file — tied to effects.js
- `eventGenerator.js` — Random event creation per phase
- `equipment.js` — RPG equipment system
- `items.js` — Item definitions and effects
- `difficulty.js` — Easy/Normal/Hard/Impossible mode settings
- `spriteGenerator.js` — 16-bit pixel art sprite generation
- `constants.js` — Game balance values
- `survivor.js` — Survivor stats and state

### Components (src/components/)
- `GameScreen.jsx` — Main game view, passes props from App
- `SurvivorRoster.jsx` — Survivor list with sprites and equipment display
- `EventCard.jsx` — Event presentation and player choices
- `TitleScreen.jsx` — Start screen with difficulty selection
- `TutorialScreen.jsx` — New player tutorial
- `GameOverScreen.jsx` — End state summary

### State Management
- `App.jsx` — Root state hub. All game state lives here and flows down via props

## Gotchas

- Port 5173 may be occupied from a previous dev server. Kill it first: `lsof -ti:5173 | xargs kill -9`
- `effects.js` and `phaseAdvance.js` are tightly coupled — changes to one usually require changes to the other
- When using `replace_all` for renames, check for substring collisions (e.g., renaming `TREATED_` also matches `UNTREATED_`)
