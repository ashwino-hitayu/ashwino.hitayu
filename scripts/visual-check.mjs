// Screenshot regression check for the whole site.
//
//   npm run visual:baseline   capture the reference screenshots (before a change)
//   npm run visual:compare    capture again and pixel-diff against the reference
//
// Starts its own Vite dev server, then shoots every route at phone / tablet /
// desktop widths in light and dark, plus a few states (product popup, a
// completed assessment). Animations are frozen, the random shloka is pinned
// and lazy images are forced in, so identical code gives identical pixels.
// Output lives in .visual/ (git-ignored): baseline/, current/, diff/.
import { mkdir, readdir, rm } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { sections } from '../src/doshaData.js';
import { products } from '../src/productsData.js';
import { allPaths } from '../src/router.js';

const mode = process.argv[2];
if (!['baseline', 'compare'].includes(mode)) {
  console.error('Usage: node scripts/visual-check.mjs baseline|compare');
  process.exit(2);
}

const OUT = new URL('../.visual/', import.meta.url).pathname;
const dir = mode === 'baseline' ? `${OUT}baseline/` : `${OUT}current/`;
const VIEWPORTS = [
  ['phone', 390, 844],
  ['tablet', 768, 1024],
  ['desktop', 1280, 900]
];
const THEMES = ['light', 'dark'];
const completedAnswers = Object.fromEntries(sections.flatMap((s) => s.rows).map((r, i) => [r.id, ['vata', 'pitta', 'kapha'][i % 3]]));

// every pre-rendered route, plus a product popup and a finished assessment
const SHOTS = [
  ...allPaths()
    .filter((p) => !p.startsWith('/products/'))
    .map((path) => ({ name: path === '/' ? 'home' : path.slice(1), path })),
  { name: 'product-popup', path: `/products/${products[0].id}` },
  { name: 'assessment-complete', path: '/assessment', answers: completedAnswers }
];

const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';

const server = await createServer({ logLevel: 'error', server: { port: 0, open: false } });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch();

await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

try {
  for (const [vp, width, height] of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const shot of SHOTS) {
        // a fresh context per shot, so saved answers never leak between pages
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce' });
        await context.addInitScript(
          ({ answers }) => {
            Math.random = () => 0.42;
            try {
              localStorage.clear();
              if (answers) localStorage.setItem('hitayu-dosha-answers', JSON.stringify(answers));
            } catch {
              /* storage unavailable: the page just starts empty */
            }
          },
          { answers: shot.answers || null }
        );
        const page = await context.newPage();
        await page.goto(base + shot.path, { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: FREEZE });
        await page.evaluate(async () => {
          document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
          await Promise.all([...document.images].map((img) => img.complete || new Promise((r) => (img.onload = img.onerror = r))));
          // loaded isn't painted: wait until every image is decoded too
          await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
          await document.fonts.ready;
        });
        await page.mouse.move(0, 0);
        await page.waitForTimeout(150);
        await page.screenshot({ path: `${dir}${shot.name}--${vp}--${theme}.png`, fullPage: true });
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}

const files = (await readdir(dir)).filter((f) => f.endsWith('.png')).sort();
if (mode === 'baseline') {
  console.log(`Saved ${files.length} baseline screenshots to .visual/baseline/`);
  process.exit(0);
}

const diffDir = `${OUT}diff/`;
await rm(diffDir, { recursive: true, force: true });
await mkdir(diffDir, { recursive: true });
let changed = 0;
for (const f of files) {
  const refPath = `${OUT}baseline/${f}`;
  if (!existsSync(refPath)) {
    console.log(`NEW      ${f}`);
    changed++;
    continue;
  }
  const a = PNG.sync.read(readFileSync(refPath));
  const b = PNG.sync.read(readFileSync(`${dir}${f}`));
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`SIZE     ${f}  ${a.width}x${a.height} -> ${b.width}x${b.height}`);
    changed++;
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  if (n > 0) {
    writeFileSync(`${diffDir}${f}`, PNG.sync.write(diff));
    console.log(`CHANGED  ${f}  ${n} px`);
    changed++;
  }
}
console.log(changed ? `\n${changed} of ${files.length} screenshots differ (see .visual/diff/)` : `All ${files.length} screenshots match the baseline.`);
process.exit(changed ? 1 : 0);
