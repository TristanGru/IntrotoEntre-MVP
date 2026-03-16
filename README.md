# Hydra MVP

Landing page for **Hydra** — electrolyte-infused alcoholic beverage. Features an interactive 3D can, lead-capture form, and file-based submission storage.

## Quick Start

```bash
npm install
npm start
# → http://localhost:3000
```

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Production server |
| `npm run dev` | Dev server with auto-reload (nodemon) |
| `npm test` | Run all Jest tests |
| `npm run lint` | Check code style |

## Submissions

Form submissions are written to `data/submissions.txt` as newline-delimited JSON (NDJSON). This file is `.gitignore`d and never committed.

```bash
# Count total submissions
wc -l data/submissions.txt

# View all submissions
cat data/submissions.txt
```

## Environment

Copy `.env.example` to `.env` and adjust as needed:

```
PORT=3000
NODE_ENV=development
BRAND_NAME=Hydra
```

## Structure

```
├── server.js           Express app + API
├── src/public/
│   ├── index.html      Single-page layout
│   ├── style.css       Dark theme + CSS variables
│   ├── bottle.js       Three.js interactive 3D can
│   ├── form.js         Client-side form logic
│   ├── main.js         GSAP scroll animations
│   └── assets/
│       └── logo.svg
├── data/               .gitignored — created at runtime
├── tests/              Jest + Supertest
└── docs/
    └── PRD.md
```

## Brand Customization

All brand values are labeled with `<!-- BRAND: -->` in HTML and comments in JS/CSS:

- Colors: CSS variables at top of `style.css`
- Can color: `CAN_COLOR` in `bottle.js`
- Label text: `LABEL_TEXT` in `bottle.js`
- Copy: `<!-- BRAND: -->` comments in `index.html`
