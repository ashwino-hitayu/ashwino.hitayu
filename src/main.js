import './style.css';
import { sections, doshas, totalQuestions, shlokaLibrary } from './doshaData.js';

// Picked once per page load/refresh — a different verse greets the reader each time.
const shlokaKeys = Object.keys(shlokaLibrary);
const randomShlokaKey = shlokaKeys[Math.floor(Math.random() * shlokaKeys.length)];

const STORAGE_KEY = 'hitayu-dosha-answers';
const PROFILE_KEY = 'hitayu-dosha-profile';
const THEME_KEY = 'hitayu-dosha-theme';
const PAGES = ['home', 'about', 'products'];

function getPageFromHash() {
  const h = (location.hash || '').replace('#', '');
  return PAGES.includes(h) ? h : 'home';
}

function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'light' || raw === 'dark' ? raw : null;
  } catch {
    return null;
  }
}

function saveTheme(theme) {
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
function applyTheme() {
  if (state.theme) {
    document.documentElement.setAttribute('data-theme', state.theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function effectiveTheme() {
  if (state.theme) return state.theme;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const state = {
  answers: loadAnswers(),
  profile: loadProfile(),
  collapsed: {},
  reportOpen: false,
  page: getPageFromHash(),
  doshaInfoOpen: null,
  theme: loadTheme()
};

function loadAnswers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswers() {
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

function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
  } catch {
    /* ignore storage errors */
  }
}

function computeTotals() {
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  Object.values(state.answers).forEach((d) => {
    if (totals[d] !== undefined) totals[d] += 1;
  });
  return totals;
}

function computeSectionTotals(section) {
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  section.rows.forEach((row) => {
    const d = state.answers[row.id];
    if (d && totals[d] !== undefined) totals[d] += 1;
  });
  return totals;
}

function computePercents(totals) {
  const sum = totals.vata + totals.pitta + totals.kapha;
  if (!sum) return { vata: 0, pitta: 0, kapha: 0 };
  return {
    vata: Math.round((totals.vata / sum) * 100),
    pitta: Math.round((totals.pitta / sum) * 100),
    kapha: Math.round((totals.kapha / sum) * 100)
  };
}

const doshaIcons = {
  vata: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 20c4-6 10-9 16-6 4 2 5 6 2 8-3 2-7 0-6-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 28c6-4 14-5 20-1 5 3 7 8 3 11-4 3-9 0-8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 36c5-2 11-2 16 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  pitta: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6c3 6-2 8-2 13 0 3 2 5 5 5 2.5 0 4-1.5 4.5-3.5C33 25 34 30 30 35c-3.5 3.5-9 4-13 1-4.5-3.5-6-9.5-3-15 1.5-3 4-4.5 4-7.5 0-2.5-1.5-4-1-7.5.5-3 3.5-5.5 7-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  kapha: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8c8 4 14 11 14 19a14 14 0 1 1-28 0c0-8 6-15 14-19z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M24 22v14M18 27h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

// The Hitayu peepal emblem — the gold tree/lotus mark cropped from the
// official logo artwork (public/hitayu-logo.png), background removed.
// Reused at hero scale and at report-header scale.
function peepalEmblem() {
  return `<img src="/hitayu-logo.png" alt="Hitayu peepal tree emblem" />`;
}

const doshaKeys = ['vata', 'pitta', 'kapha'];

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Plain-language explanations for the dosha info popup — kept separate from
// the more technical doshaDescriptions used in the result/report copy.
const doshaSimpleInfo = {
  vata: {
    title: 'Vata — Air & Ether',
    text: 'Vata is the energy of movement. It controls things like breathing, blood flow, blinking, and your thoughts. People with more Vata tend to be quick, creative, and full of ideas — but can become anxious, restless, or tired if it builds up too much. Think of Vata as the wind: light, quick, and always moving.'
  },
  pitta: {
    title: 'Pitta — Fire & Water',
    text: 'Pitta is the energy of transformation. It controls digestion, metabolism, and how your body turns food into energy. People with more Pitta are often sharp, focused, and natural leaders — but can become irritable, impatient, or overheated when out of balance. Think of Pitta as fire: hot, intense, and transformative.'
  },
  kapha: {
    title: 'Kapha — Earth & Water',
    text: 'Kapha is the energy of structure and stability. It gives the body its form, strength, and immunity. People with more Kapha tend to be calm, caring, and steady — but can become sluggish, heavy, or resistant to change when out of balance. Think of Kapha as earth: solid, grounded, and enduring.'
  }
};

const sunIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const moonIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

// ==================== Nav ====================
function renderNav() {
  const links = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About Us' },
    { key: 'products', label: 'Products' }
  ];
  const isDark = effectiveTheme() === 'dark';
  return `
    <nav class="site-nav">
      <div class="site-nav__inner">
        <a class="site-nav__brand" href="#home" data-nav="home">Hitayu</a>
        <div class="site-nav__right">
          <div class="site-nav__links">
            ${links
              .map(
                (l) => `<a href="#${l.key}" class="site-nav__link ${state.page === l.key ? 'site-nav__link--active' : ''}" data-nav="${l.key}">${l.label}</a>`
              )
              .join('')}
          </div>
          <button type="button" class="theme-toggle" id="theme-toggle" aria-label="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}" aria-pressed="${isDark}">
            ${isDark ? moonIcon : sunIcon}
          </button>
        </div>
      </div>
    </nav>
  `;
}

function renderDoshaInfoOverlay() {
  const key = state.doshaInfoOpen;
  if (!key) return '';
  const info = doshaSimpleInfo[key];
  return `
    <div class="dosha-info-overlay" id="dosha-info-overlay">
      <div class="dosha-info-card dosha-info-card--${key}">
        <button type="button" class="dosha-info-close" id="dosha-info-close" aria-label="Close">×</button>
        <span class="dosha-info-icon dosha-info-icon--${key}">${doshaIcons[key]}</span>
        <h3 class="dosha-info-title">${info.title}</h3>
        <p class="dosha-info-text">${info.text}</p>
      </div>
    </div>
  `;
}

// ==================== Masthead ====================
function renderMasthead() {
  return `
    <header class="masthead">
      <div class="masthead__emblem" aria-hidden="true">${peepalEmblem()}</div>
      <p class="masthead__clinic">Hitayu Ayurvedic Clinic &amp; Wellness Center</p>
      <p class="masthead__clinic-sub">Rooted in Tradition · Grown for Your Wellbeing</p>
      <div class="masthead__rule" aria-hidden="true"></div>
      <h1 class="masthead__title">Prakriti Assessment</h1>
      <p class="masthead__know">Know Your Prakriti</p>
      <p class="masthead__tag">Dosha Questionnaire</p>
      <div class="masthead__doshas">
        ${doshaKeys
          .map(
            (k) => `
          <button type="button" class="dosha-medallion dosha-medallion--${k}" data-dosha-info="${k}" aria-label="What is ${doshas[k].name}?">
            <span class="dosha-medallion__icon dosha-medallion__icon--${k}">${doshaIcons[k]}</span>
            <span class="dosha-medallion__name">${doshas[k].name}</span>
            <span class="dosha-medallion__tag">${doshas[k].tag}</span>
          </button>`
          )
          .join('')}
      </div>
      <p class="masthead__subtitle">An ancient self-portrait, drawn from the three doshas. Answer honestly, reflecting on your life as a whole — not just today.</p>
    </header>
  `;
}

function renderProfileForm() {
  const p = state.profile;
  return `
    <section class="profile-form">
      <p class="profile-form__eyebrow">Patient Details</p>
      <h2 class="profile-form__heading">Before We Begin</h2>
      <p class="profile-form__sub">A little about you, for a reading that speaks to you by name.</p>
      <div class="profile-form__grid">
        <label class="profile-form__field">
          <span>Name</span>
          <input type="text" id="profile-name" placeholder="Your name" value="${escapeHtml(p.name)}" autocomplete="name" />
        </label>
        <label class="profile-form__field">
          <span>Age</span>
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" id="profile-age" placeholder="Your age" value="${escapeHtml(p.age)}" autocomplete="off" />
        </label>
        <label class="profile-form__field">
          <span>Sex / Gender</span>
          <select id="profile-gender">
            <option value="" ${p.gender === '' ? 'selected' : ''}>Select…</option>
            <option value="female" ${p.gender === 'female' ? 'selected' : ''}>Female</option>
            <option value="male" ${p.gender === 'male' ? 'selected' : ''}>Male</option>
            <option value="other" ${p.gender === 'other' ? 'selected' : ''}>Other</option>
            <option value="prefer-not-to-say" ${p.gender === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
          </select>
        </label>
      </div>
    </section>
  `;
}

// ==================== Wisdom / Shloka panels ====================
function renderWisdomCard(key) {
  const s = shlokaLibrary[key];
  if (!s) return '';
  if (s.type === 'verse') {
    return `
      <div class="wisdom__card">
        <p class="wisdom__eyebrow">Ayurvedic Verse</p>
        <p class="wisdom__category">${s.category}</p>
        <p class="wisdom__sanskrit">${s.sanskrit}</p>
        <p class="wisdom__iast">${s.iast}</p>
        <p class="wisdom__hindi">${s.hindi}</p>
        <p class="wisdom__english">${s.english}</p>
        <p class="wisdom__source">${s.source}</p>
      </div>
    `;
  }
  return `
    <div class="wisdom__card">
      <p class="wisdom__eyebrow">Ayurvedic Teaching</p>
      <p class="wisdom__category">${s.category}</p>
      <p class="wisdom__hindi">${s.hindi}</p>
      <p class="wisdom__english">${s.english}</p>
      ${s.note ? `<p class="wisdom__note">${s.note}</p>` : ''}
      <p class="wisdom__source">${s.source}</p>
    </div>
  `;
}

function renderWisdomGroup(keys) {
  return `
    <section class="wisdom">
      <div class="wisdom__grid">
        ${keys.map((k) => renderWisdomCard(k)).join('')}
      </div>
    </section>
  `;
}

const figureShape = `
  <circle cx="32" cy="16" r="12"/>
  <path d="M18 30 Q18 28 20 28 L44 28 Q46 28 46 30 L48 64 Q48 68 44 68 L20 68 Q16 68 16 64 Z"/>
  <rect x="6" y="30" width="10" height="42" rx="5"/>
  <rect x="48" y="30" width="10" height="42" rx="5"/>
  <rect x="20" y="68" width="10" height="46" rx="5"/>
  <rect x="34" y="68" width="10" height="46" rx="5"/>
`;

function renderConstitutionFigure(key, pct, count) {
  const clipId = `figure-clip-${key}`;
  const fillHeight = (pct / 100) * 120;
  const fillY = 120 - fillHeight;
  return `
    <div class="figure figure--${key}">
      <div class="figure__body">
        <svg viewBox="0 0 64 120" class="figure__svg" aria-hidden="true">
          <defs>
            <clipPath id="${clipId}">${figureShape}</clipPath>
          </defs>
          <g class="figure__outline">${figureShape}</g>
          <rect class="figure__fill" x="0" y="${fillY}" width="64" height="${fillHeight}" clip-path="url(#${clipId})"></rect>
        </svg>
      </div>
      <span class="figure__count">${count}</span>
      <span class="figure__label">${doshas[key].name}</span>
    </div>
  `;
}

function renderScorePanel() {
  const totals = computeTotals();
  const answered = Object.keys(state.answers).length;
  return `
    <aside class="score-panel" id="score-panel" aria-live="polite">
      <p class="score-panel__title">Your Constitution, So Far</p>
      <div class="score-panel__figures">
        ${doshaKeys
          .map((k) => {
            const pct = Math.round((totals[k] / totalQuestions) * 100);
            return renderConstitutionFigure(k, pct, totals[k]);
          })
          .join('')}
      </div>
      <p class="score-panel__progress">${answered} / ${totalQuestions} answered</p>
      <div class="score-panel__bar"><div class="score-panel__bar-fill" style="width:${(answered / totalQuestions) * 100}%"></div></div>
      <button type="button" class="score-panel__reset" id="reset-btn">Begin Anew</button>
    </aside>
  `;
}

function renderRow(row) {
  const selected = state.answers[row.id];
  return `
    <div class="row" data-row="${row.id}">
      <p class="row__label">${row.label}</p>
      <div class="row__options">
        ${doshaKeys
          .map((k) => {
            const isSelected = selected === k;
            return `
            <button
              type="button"
              class="option option--${k} ${isSelected ? 'option--selected' : ''}"
              data-row-id="${row.id}"
              data-dosha="${k}"
              aria-pressed="${isSelected}"
            >
              <span class="option__mark" aria-hidden="true">${isSelected ? '✓' : ''}</span>
              <span class="option__text">${row[k]}</span>
            </button>`;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderSection(section, index) {
  const totals = computeSectionTotals(section);
  const isCollapsed = !!state.collapsed[section.title];
  return `
    <section class="chapter ${isCollapsed ? 'chapter--collapsed' : ''}" style="--chapter-index:${index}">
      <div
        class="chapter__header"
        data-toggle-section="${section.title}"
        role="button"
        tabindex="0"
        aria-expanded="${!isCollapsed}"
        aria-label="${isCollapsed ? 'Expand' : 'Collapse'} ${section.title}"
      >
        <span class="chapter__number">${String(index + 1).padStart(2, '0')}</span>
        <h2 class="chapter__title">${section.title}</h2>
        <div class="chapter__divider" aria-hidden="true"></div>
        <span class="chapter__toggle" aria-hidden="true">
          <span class="chapter__toggle-icon">${isCollapsed ? '+' : '–'}</span>
        </span>
      </div>
      ${
        isCollapsed
          ? `<p class="chapter__collapsed-hint">${section.rows.length - (totals.vata + totals.pitta + totals.kapha) === 0 ? 'All traits answered' : `${totals.vata + totals.pitta + totals.kapha} / ${section.rows.length} answered`} — tap to expand</p>`
          : `
      <div class="chapter__rows-head">
        <span></span>
        ${doshaKeys.map((k) => `<span class="chapter__rows-head-item chapter__rows-head-item--${k}">${doshas[k].name}</span>`).join('')}
      </div>
      <div class="chapter__rows">
        ${section.rows.map((row) => renderRow(row)).join('')}
      </div>`
      }
    </section>
  `;
}

const doshaDescriptions = {
  vata: 'Governed by air and ether — quick, creative and ever-moving. When in balance, Vata brings vitality and imagination; out of balance, it brings anxiety and depletion. Favour warmth, routine and rest.',
  pitta: 'Governed by fire and water — sharp, driven and transformative. When in balance, Pitta brings clarity and leadership; out of balance, it brings heat, irritability and inflammation. Favour coolness and moderation.',
  kapha: 'Governed by earth and water — steady, grounded and enduring. When in balance, Kapha brings calm and strength; out of balance, it brings heaviness and stagnation. Favour movement and stimulation.'
};

function computeVerdict() {
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

function renderResult() {
  const { answered, complete } = computeVerdict();

  return `
    <section class="result">
      <div class="result__panel">
        <p class="result__eyebrow">${complete ? 'Your Reading Is Complete' : `Reading in progress — ${answered} of ${totalQuestions} traits gathered`}</p>
        <div class="result__actions">
          <button type="button" class="btn btn--primary" id="open-report-btn">View &amp; Print A4 Report</button>
        </div>
      </div>
      <p class="result__disclaimer">A gentle reminder: no dosha is good or bad — every body holds Vata, Pitta and Kapha together. This assessment offers self-understanding for educational purposes and is not a medical diagnosis. For a full Prakriti–Vikriti consultation, visit us at Hitayu.</p>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <p class="site-footer__name">Hitayu — Ayurvedic Clinic &amp; Wellness Center</p>
      <p class="site-footer__line">Rooted in tradition. Grown for your wellbeing.</p>
    </footer>
  `;
}

// ==================== A4 Report ====================
function renderReportOverlay() {
  const { totals, answered, complete, verdictName, verdictDesc } = computeVerdict();
  const pct = computePercents(totals);
  const p = state.profile;
  const genderLabel = { female: 'Female', male: 'Male', other: 'Other', 'prefer-not-to-say': 'Prefer not to say' }[p.gender] || '—';
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="report-overlay ${state.reportOpen ? 'report-overlay--open' : ''}" id="report-overlay">
      <div class="report-overlay__toolbar no-print">
        <button type="button" class="btn" id="close-report-btn">Close</button>
        <button type="button" class="btn btn--primary" id="print-report-btn">Print / Save as PDF</button>
      </div>
      <article class="report-page">
        <div class="report-page__header">
          <div class="report-page__emblem" aria-hidden="true">${peepalEmblem()}</div>
          <div class="report-page__clinic">
            <p class="report-page__clinic-name">Hitayu Ayurvedic Clinic &amp; Wellness Center</p>
            <p class="report-page__clinic-sub">Rooted in Tradition · Grown for Your Wellbeing</p>
          </div>
          <div class="report-page__doctitle">Assessment Date<br />${dateStr}</div>
        </div>

        <h1 class="report-page__title">Prakriti Assessment Report</h1>

        <div class="report-page__patient">
          <div><strong>Name</strong>${p.name ? escapeHtml(p.name) : '—'}</div>
          <div><strong>Age</strong>${p.age ? escapeHtml(p.age) : '—'}</div>
          <div><strong>Sex / Gender</strong>${genderLabel}</div>
        </div>

        <p class="report-page__result-heading">Your Prakriti</p>
        <h2 class="report-page__result-title">${verdictName}</h2>

        <div class="report-page__bars">
          ${doshaKeys
            .map(
              (k) => `
            <div class="result__percent-row result__percent-row--${k}">
              <span class="result__percent-label">${doshas[k].name}</span>
              <div class="result__percent-track">
                <div class="result__percent-fill result__percent-fill--${k}" style="width:${pct[k]}%"></div>
              </div>
              <span class="result__percent-value">${pct[k]}%</span>
            </div>`
            )
            .join('')}
        </div>

        <p class="report-page__interp">
          ${verdictDesc}
          ${complete ? '' : ` This reading reflects ${answered} of ${totalQuestions} traits answered at the time of printing.`}
          This assessment offers self-understanding for educational purposes and is not a medical diagnosis.
        </p>

        <div class="report-page__cta">
          <p class="report-page__cta-q">Want to understand your Prakriti in greater depth?</p>
          <ul>
            <li>Lifestyle guidance</li>
            <li>Food habits</li>
            <li>Daily routine (Dinacharya)</li>
            <li>Seasonal routine (Ritucharya)</li>
            <li>Individual Ayurvedic recommendations</li>
            <li>Prakriti–Vikriti assessment</li>
          </ul>
          <p class="report-page__cta-consult">For detailed guidance on the above, please consult<br /><strong>Dr. Hitesh Pant</strong>Hitayu Ayurvedic Clinic &amp; Wellness Center</p>
        </div>

        <div class="report-page__footer">
          <p class="report-page__footer-name">Hitayu — Ayurvedic Clinic &amp; Wellness Center</p>
          <p class="report-page__footer-line">Rooted in tradition. Grown for your wellbeing.</p>
          <p class="report-page__disclaimer">This assessment is intended for educational / self-understanding purposes and does not replace an individual professional Ayurvedic consultation.</p>
        </div>
      </article>
    </div>
  `;
}

function renderHomePage() {
  return `
    ${renderMasthead()}
    <main class="content">
      ${renderWisdomGroup([randomShlokaKey])}
      ${renderProfileForm()}
      <div class="assessment-layout">
        <div class="assessment-layout__main">
          ${sections.map((s, i) => renderSection(s, i)).join('')}
        </div>
        <div class="assessment-layout__side">
          ${renderScorePanel()}
        </div>
      </div>
      ${renderResult()}
    </main>
    ${renderReportOverlay()}
  `;
}

function renderAboutPage() {
  return `
    <main class="content">
      <section class="about-card">
        <p class="about-card__eyebrow">About Me</p>
        <h2 class="about-card__name">Dr. Hitesh Pant <span class="about-card__suffix">| Vaidya</span></h2>
        <p class="about-card__creds">B.A.M.S. (RGUHS), CCP (Maharashtra)</p>
        <p class="about-card__role">General Physician &amp; Ayurvedic Consultant</p>
        <div class="about-card__body">
          <p>Hello! I am Dr. Hitesh Pant, a B.A.M.S. certified Ayurvedic Physician and General Practitioner focused on pure Ayurveda and classical treatment principles.</p>
          <p>I specialize in treating chronic health issues, pain management (including Agnikarma and Viddhakarma), gut-related problems, and Marma therapy. My goal is to help patients achieve long-term wellness and a healthier lifestyle through authentic Ayurvedic practices, lifestyle coaching, and traditional medicine preparation.</p>
        </div>
        <div class="about-card__meta">
          <p><strong>Registration:</strong> UK 4778 (Bhartiya Chikitsa Parishad, Uttarakhand)</p>
          <p><strong>Languages Spoken:</strong> Hindi, English, Kannada, Pahadi</p>
        </div>
      </section>
    </main>
  `;
}

function renderProductsPage() {
  return `
    <main class="content">
      <section class="empty-state">
        <p class="empty-state__eyebrow">Products</p>
        <h2 class="empty-state__title">Coming Soon</h2>
        <p class="empty-state__text">We're preparing a curated range of Ayurvedic products. Please check back soon.</p>
      </section>
    </main>
  `;
}

function renderPage() {
  if (state.page === 'about') return renderAboutPage();
  if (state.page === 'products') return renderProductsPage();
  return renderHomePage();
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="texture-overlay" aria-hidden="true"></div>
    <div class="page">
      ${renderNav()}
      ${renderPage()}
      ${renderFooter()}
    </div>
    ${renderDoshaInfoOverlay()}
  `;
  attachHandlers();
}

function withFocusPreserved(fn) {
  const active = document.activeElement;
  const id = active && active.id;
  const hasSelection = active && 'selectionStart' in active;
  const selStart = hasSelection ? active.selectionStart : null;
  const selEnd = hasSelection ? active.selectionEnd : null;
  fn();
  if (id) {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      if (selStart !== null && el.setSelectionRange) {
        try {
          el.setSelectionRange(selStart, selEnd);
        } catch {
          /* not a text-selectable input (e.g. number) */
        }
      }
    }
  }
}

function attachHandlers() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      state.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
      saveTheme(state.theme);
      applyTheme();
      render();
    });
  }

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.nav;
      state.page = page;
      if (location.hash !== `#${page}`) location.hash = page;
      window.scrollTo({ top: 0 });
      render();
    });
  });

  document.querySelectorAll('[data-dosha-info]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.doshaInfoOpen = btn.dataset.doshaInfo;
      render();
    });
  });

  const doshaInfoOverlay = document.getElementById('dosha-info-overlay');
  if (doshaInfoOverlay) {
    doshaInfoOverlay.addEventListener('click', (e) => {
      if (e.target === doshaInfoOverlay) {
        state.doshaInfoOpen = null;
        render();
      }
    });
  }

  const doshaInfoClose = document.getElementById('dosha-info-close');
  if (doshaInfoClose) {
    doshaInfoClose.addEventListener('click', () => {
      state.doshaInfoOpen = null;
      render();
    });
  }

  document.querySelectorAll('.option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rowId = btn.dataset.rowId;
      const dosha = btn.dataset.dosha;
      if (state.answers[rowId] === dosha) {
        delete state.answers[rowId];
      } else {
        state.answers[rowId] = dosha;
      }
      saveAnswers();
      render();
      // preserve scroll position by re-focusing the clicked row after re-render
      const el = document.querySelector(`[data-row="${rowId}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    });
  });

  document.querySelectorAll('.chapter__header').forEach((header) => {
    const toggle = () => {
      const title = header.dataset.toggleSection;
      state.collapsed[title] = !state.collapsed[title];
      render();
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  const nameInput = document.getElementById('profile-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      withFocusPreserved(() => {
        state.profile.name = nameInput.value;
        saveProfile();
        render();
      });
    });
  }

  const ageInput = document.getElementById('profile-age');
  if (ageInput) {
    ageInput.addEventListener('input', () => {
      const digitsOnly = ageInput.value.replace(/\D/g, '').slice(0, 3);
      withFocusPreserved(() => {
        state.profile.age = digitsOnly;
        saveProfile();
        render();
      });
    });
  }

  const genderSelect = document.getElementById('profile-gender');
  if (genderSelect) {
    genderSelect.addEventListener('change', () => {
      state.profile.gender = genderSelect.value;
      saveProfile();
      render();
    });
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all your answers and begin the assessment anew?')) {
        state.answers = {};
        saveAnswers();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  const openReportBtn = document.getElementById('open-report-btn');
  if (openReportBtn) {
    openReportBtn.addEventListener('click', () => {
      state.reportOpen = true;
      render();
    });
  }

  const closeReportBtn = document.getElementById('close-report-btn');
  if (closeReportBtn) {
    closeReportBtn.addEventListener('click', () => {
      state.reportOpen = false;
      render();
    });
  }

  const printReportBtn = document.getElementById('print-report-btn');
  if (printReportBtn) {
    printReportBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

window.addEventListener('hashchange', () => {
  state.page = getPageFromHash();
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.doshaInfoOpen) {
    state.doshaInfoOpen = null;
    render();
  }
});

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!state.theme) render();
  });
}

applyTheme();
render();
