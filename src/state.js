// App state: persistence (localStorage), theme, and the derived
// calculations (totals/percents/verdict) everything else reads from — the
// maths itself lives in scoring.js.
import { totalQuestions } from './doshaData.js';
import { doshaKeys, sanitizeAnswers, tallyAnswers, computePercents, computeVerdict as verdictFor } from './scoring.js';

export { doshaKeys, computePercents };

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const STORAGE_KEY = 'hitayu-dosha-answers';
const PROFILE_KEY = 'hitayu-dosha-profile';
const THEME_KEY = 'hitayu-dosha-theme';
const LANG_KEY = 'hitayu-dosha-lang';

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

// Trial Hindi translation (see i18n.js). English unless the visitor picked
// Hindi; the choice sticks across visits.
function loadLang() {
  try {
    return localStorage.getItem(LANG_KEY) === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLang(lang) {
  try {
    if (lang === 'hi') localStorage.setItem(LANG_KEY, lang);
    else localStorage.removeItem(LANG_KEY);
  } catch {
    /* ignore storage errors */
  }
}

export function applyLang() {
  document.documentElement.lang = state.lang;
}

function loadAnswers() {
  try {
    return sanitizeAnswers(JSON.parse(localStorage.getItem(STORAGE_KEY)));
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
  page: 'home', // set from the URL by main.js (see router.js)
  doshaInfoOpen: null,
  navMenuOpen: false, // phone hamburger menu
  productOpen: null,
  productImageIndex: 0,
  lightboxOpen: false,
  theme: loadTheme(),
  lang: loadLang()
};

export function computeTotals() {
  return tallyAnswers(state.answers);
}

export function computeSectionTotals(section) {
  return tallyAnswers(
    state.answers,
    section.rows.map((row) => row.id)
  );
}

export function computeVerdict() {
  return verdictFor(state.answers, totalQuestions);
}
