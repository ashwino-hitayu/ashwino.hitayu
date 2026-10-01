// App state: persistence (localStorage), routing, and the derived
// calculations (totals/percents/verdict) everything else reads from.
import { totalQuestions, doshas, sections } from './doshaData.js';

export const doshaKeys = ['vata', 'pitta', 'kapha'];

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const STORAGE_KEY = 'hitayu-dosha-answers';
const PROFILE_KEY = 'hitayu-dosha-profile';
const THEME_KEY = 'hitayu-dosha-theme';

export const PAGES = ['home', 'assessment', 'about', 'products'];

export function getPageFromHash() {
  const h = (location.hash || '').replace('#', '');
  return PAGES.includes(h) ? h : 'home';
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'light' || raw === 'dark' ? raw : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme) {
  try {
    if (theme) localStorage.setItem(THEME_KEY, theme);
    else localStorage.removeItem(THEME_KEY);
  } catch {
    /* ignore storage errors */
  }
}

// null = follow the system's light/dark preference (see index.html's
// pre-paint script and the @media rules in style.css); an explicit value
// here overrides that via the [data-theme] attribute.
export function applyTheme() {
  if (state.theme) {
    document.documentElement.setAttribute('data-theme', state.theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function effectiveTheme() {
  if (state.theme) return state.theme;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const validRowIds = new Set(sections.flatMap((s) => s.rows.map((r) => r.id)));

// Drops anything that isn't a current row id mapped to a dosha — e.g. answers
// saved against a row id that has since been renamed/removed, which would
// otherwise still count toward the totals and the "answered" progress.
function loadAnswers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const answers = {};
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([id, d]) => {
        if (validRowIds.has(id) && doshaKeys.includes(d)) answers[id] = d;
      });
    }
    return answers;
  } catch {
    return {};
  }
}

export function saveAnswers() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers));
  } catch {
    /* ignore storage errors */
  }
}

function loadProfile() {
  const empty = { name: '', age: '', gender: '' };
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (!parsed || typeof parsed !== 'object') return empty;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      age: typeof parsed.age === 'string' ? parsed.age : '',
      gender: typeof parsed.gender === 'string' ? parsed.gender : ''
    };
  } catch {
    return empty;
  }
}

export function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
  } catch {
    /* ignore storage errors */
  }
}

export const state = {
  answers: loadAnswers(),
  profile: loadProfile(),
  collapsed: {},
  reportOpen: false,
  page: getPageFromHash(),
  doshaInfoOpen: null,
  productOpen: null,
  productImageIndex: 0,
  lightboxOpen: false,
  theme: loadTheme()
};

export function computeTotals() {
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  Object.values(state.answers).forEach((d) => {
    if (totals[d] !== undefined) totals[d] += 1;
  });
  return totals;
}

export function computeSectionTotals(section) {
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  section.rows.forEach((row) => {
    const d = state.answers[row.id];
    if (d && totals[d] !== undefined) totals[d] += 1;
  });
  return totals;
}

// Largest-remainder rounding, so the three whole-number percents always sum
// to exactly 100 (independent Math.round gives e.g. 33/33/33 = 99).
export function computePercents(totals) {
  const sum = totals.vata + totals.pitta + totals.kapha;
  if (!sum) return { vata: 0, pitta: 0, kapha: 0 };
  const exact = doshaKeys.map((k) => (totals[k] / sum) * 100);
  const pct = exact.map(Math.floor);
  let remainder = 100 - pct.reduce((a, b) => a + b, 0);
  const byFraction = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
  for (let j = 0; remainder > 0; j++, remainder--) pct[byFraction[j][1]] += 1;
  return { vata: pct[0], pitta: pct[1], kapha: pct[2] };
}

const doshaDescriptions = {
  vata: 'Governed by air and ether — quick, creative and ever-moving. When in balance, Vata brings vitality and imagination; out of balance, it brings anxiety and depletion. Favour warmth, routine and rest.',
  pitta: 'Governed by fire and water — sharp, driven and transformative. When in balance, Pitta brings clarity and leadership; out of balance, it brings heat, irritability and inflammation. Favour coolness and moderation.',
  kapha: 'Governed by earth and water — steady, grounded and enduring. When in balance, Kapha brings calm and strength; out of balance, it brings heaviness and stagnation. Favour movement and stimulation.'
};

export function computeVerdict() {
  const totals = computeTotals();
  const answered = Object.keys(state.answers).length;
  const complete = answered === totalQuestions;
  const max = Math.max(totals.vata, totals.pitta, totals.kapha);
  const leaders = doshaKeys.filter((k) => totals[k] === max && max > 0);
  let verdictName = '';
  let verdictDesc = '';

  if (max === 0) {
    verdictName = 'Your Scroll Awaits';
    verdictDesc = 'Begin answering above, and your natural constitution will slowly reveal itself here.';
  } else if (leaders.length === 1) {
    const k = leaders[0];
    verdictName = `Predominantly ${doshas[k].name}`;
    verdictDesc = doshaDescriptions[k];
  } else if (leaders.length === 3) {
    verdictName = 'A Tridoshic Constitution: Vata – Pitta – Kapha';
    verdictDesc = 'Your traits are spread evenly across all three doshas — a balanced combination of Vata, Pitta and Kapha, and entirely natural.';
  } else {
    const names = leaders.map((k) => doshas[k].name).join(' – ');
    verdictName = `A Dual Constitution: ${names}`;
    verdictDesc = 'Your traits are balanced between two doshas — a combination constitution, common and entirely natural.';
  }

  return { totals, answered, complete, verdictName, verdictDesc };
}
