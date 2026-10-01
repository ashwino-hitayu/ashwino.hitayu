// App state: persistence (localStorage), routing, and the derived
// calculations (totals/percents/verdict) everything else reads from.
import { totalQuestions, doshas } from './doshaData.js';

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

function loadAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
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
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { name: '', age: '', gender: '' };
  } catch {
    return { name: '', age: '', gender: '' };
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

export function computePercents(totals) {
  const sum = totals.vata + totals.pitta + totals.kapha;
  if (!sum) return { vata: 0, pitta: 0, kapha: 0 };
  return {
    vata: Math.round((totals.vata / sum) * 100),
    pitta: Math.round((totals.pitta / sum) * 100),
    kapha: Math.round((totals.kapha / sum) * 100)
  };
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
  } else {
    const names = leaders.map((k) => doshas[k].name).join(' – ');
    verdictName = `A Dual Constitution: ${names}`;
    verdictDesc = 'Your traits are balanced between two doshas — a combination constitution, common and entirely natural.';
  }

  return { totals, answered, complete, verdictName, verdictDesc };
}
