import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { treatments } from './treatmentsData.js';
import { products } from './productsData.js';
import { sections, doshas, shlokaLibrary, totalQuestions } from './doshaData.js';
import { state } from './state.js';
import { computeVerdict } from './scoring.js';
import { doshaSimpleInfo } from './icons.js';
import { hindi } from './hindi.js';
import { tr } from './i18n.js';
import { resultMessage } from './components/assessment.js';
import imageSizes from './imageSizes.json';

const publicFile = (src) => new URL(`../public${src}`, import.meta.url);

describe('treatments data', () => {
  it('has unique ids and every field the card shows', () => {
    expect(new Set(treatments.map((t) => t.id)).size).toBe(treatments.length);
    for (const t of treatments) {
      for (const key of ['name', 'sanskrit', 'tagline', 'description']) expect(t[key], `${t.id}.${key}`).toBeTruthy();
      expect(t.uses.length, t.id).toBeGreaterThan(0);
    }
  });

  it('points at images that exist, each with a credit while it is a stock photo', () => {
    for (const t of treatments) {
      expect(existsSync(publicFile(t.image)), t.image).toBe(true);
      if (t.credit) expect(t.credit.author && t.credit.url, t.id).toBeTruthy();
    }
  });
});

describe('products data', () => {
  it('has unique ids and images that exist', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    for (const p of products) for (const src of p.images) expect(existsSync(publicFile(src)), src).toBe(true);
  });
});

describe('optimised photos', () => {
  it('every product and treatment photo went through `npm run images`', () => {
    const photos = [...products.flatMap((p) => p.images), ...treatments.map((t) => t.image)];
    for (const src of photos) {
      expect(imageSizes[src], `${src} — run npm run images`).toBeTruthy();
      expect(imageSizes[src].width, src).toBeLessThanOrEqual(1000);
      if (imageSizes[src].small) expect(existsSync(publicFile(imageSizes[src].small)), imageSizes[src].small).toBe(true);
    }
  });
});

describe('result WhatsApp message', () => {
  it('includes the profile and the verdict with percentages', () => {
    const rows = sections.flatMap((s) => s.rows);
    state.answers = Object.fromEntries(rows.map((r) => [r.id, 'vata']));
    state.profile = { name: '  Asha ', age: '34', gender: 'female' };
    const msg = resultMessage();
    expect(msg).toContain('Name: Asha\n');
    expect(msg).toContain('Age: 34');
    expect(msg).toContain('Sex: Female');
    expect(msg).toContain('Result: Predominantly Vata');
    expect(msg).toContain('Vata 100% · Pitta 0% · Kapha 0%');
  });

  it('leaves out profile lines that were not filled in', () => {
    state.profile = { name: '', age: '', gender: 'prefer-not-to-say' };
    const msg = resultMessage();
    expect(msg).not.toMatch(/Name:|Age:|Sex:/);
  });
});

// Trial Hindi translation: every English line the site shows through tr()
// needs an entry in hindi.js, or Hindi visitors see it in English.
describe('Hindi translation', () => {
  // The quoted strings in the first argument of each tr(…) call in the source,
  // including both sides of a ternary like tr(isDark ? 'A' : 'B').
  function trKeysIn(source) {
    const keys = [];
    for (const m of source.matchAll(/\btr\(/g)) {
      let depth = 0;
      for (let i = m.index + 3; i < source.length; i++) {
        const c = source[i];
        if (c === "'" || c === '"') {
          let j = i + 1;
          while (source[j] !== c) j += source[j] === '\\' ? 2 : 1;
          if (depth === 0) keys.push(source.slice(i + 1, j).replace(/\\(.)/g, '$1'));
          i = j;
        } else if (c === '(' || c === '[' || c === '{') depth++;
        else if ((c === ')' || c === ']' || c === '}') && depth > 0) depth--;
        else if ((c === ')' || c === ',') && depth === 0) break;
      }
    }
    return keys;
  }

  const sourceFiles = ['main.js', 'pages.js', 'icons.js', ...['assessment', 'chrome', 'products', 'treatments'].map((n) => `components/${n}.js`)];

  it('covers every tr() string in the components', () => {
    const keys = sourceFiles.flatMap((f) => trKeysIn(readFileSync(new URL(f, import.meta.url), 'utf8')));
    expect(keys.length).toBeGreaterThan(100);
    expect(keys.filter((k) => !(k in hindi))).toEqual([]);
  });

  it('covers the questionnaire, doshas, verdicts, products and treatments', () => {
    const verdictNames = [['vata'], ['pitta'], ['kapha'], ['vata', 'pitta'], ['vata', 'kapha'], ['pitta', 'kapha'], ['vata', 'pitta', 'kapha']].map(
      (leaders) => computeVerdict(Object.fromEntries(leaders.map((k, i) => [sections[0].rows[i].id, k])), totalQuestions).verdictName
    );
    const lines = [
      ...sections.flatMap((s) => [s.title, ...s.rows.flatMap((r) => [r.label, r.vata, r.pitta, r.kapha])]),
      ...Object.values(doshas).flatMap((d) => [d.name, d.tag]),
      ...Object.values(doshaSimpleInfo).flatMap((d) => [d.title, d.text]),
      ...Object.values(shlokaLibrary).flatMap((s) => (s.note ? [s.note] : [])),
      ...verdictNames,
      ...products.flatMap((p) => [p.tagline, p.description, ...p.benefits]),
      ...treatments.flatMap((t) => [t.tagline, t.description, ...t.uses, ...(t.note ? [t.note] : [])])
    ];
    expect(lines.filter((l) => !(l in hindi))).toEqual([]);
  });

  it('keeps the same {placeholders} in the Hindi', () => {
    const placeholders = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
    const mismatched = Object.entries(hindi).filter(([en, hi]) => placeholders(en) !== placeholders(hi));
    expect(mismatched).toEqual([]);
  });

  it('switches with the language and falls back to English', () => {
    state.lang = 'hi';
    expect(tr('Vata')).toBe('वात');
    expect(tr('{answered} / {total} answered', { answered: 3, total: 33 })).toBe('3 / 33 के उत्तर दिए');
    expect(tr('Not translated yet')).toBe('Not translated yet');
    state.lang = 'en';
    expect(tr('{answered} / {total} answered', { answered: 3, total: 33 })).toBe('3 / 33 answered');
  });
});
