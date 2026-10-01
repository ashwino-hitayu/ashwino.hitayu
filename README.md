# Hitayu — Ayurvedic Clinic & Wellness Center · Dosha Assessment

A Prakriti (mind-body constitution) self-assessment, restyled as a vintage
mud-house / royal-green Ayurvedic experience. Built with vanilla JS + Vite —
no framework, no backend, all state kept in the browser (localStorage).

## Run it locally (Mac)

You need [Node.js](https://nodejs.org) 18+ installed. Check with:

```bash
node -v
```

Then, from this folder:

```bash
npm install
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) and should
open it automatically in your browser.

## Build for deployment

```bash
npm run build
```

This outputs a static `dist/` folder you can drag onto Netlify, or host
anywhere that serves static files.

## What's inside

- `index.html` — page shell (also loads the Google Fonts and applies the saved
  light/dark theme before first paint)
- `src/main.js` — renders the app and handles every click/input/key event
  (delegated from `document`, so handlers are bound once)
- `src/state.js` — app state, localStorage persistence, hash routing, and the
  Vata / Pitta / Kapha totals, percents and verdict
- `src/pages.js` — the Home, Assessment, About and Products pages
- `src/components/` — nav/masthead/footer (`chrome.js`), the questionnaire
  (`assessment.js`), the printable A4 report (`report.js`), products
  (`products.js`)
- `src/doshaData.js` — all 33 questions across 5 sections (Physical Body,
  Lifestyle & Daily Habits, Communication, Mind & Emotions, Common
  Imbalances) plus the shloka library
- `src/productsData.js` — the product catalog
- `src/style.css` — the vintage mud-wall / royal-green / brass visual theme

## Customizing

- Clinic name, tagline and hero copy: edit `renderMasthead()` in
  `src/components/chrome.js`
- Colors: all defined as CSS variables at the top of `src/style.css`
- Questions/wording: edit `src/doshaData.js` — the row `id` values are used
  as answer keys, so if you rename an `id` after someone has already
  answered, their saved answer for that row is dropped
- Products: add entries to `src/productsData.js` (images go in
  `public/products/`)
