// Shared page furniture used across routes: top nav, hero masthead, the
// dosha info popup it launches, and the footer.
import { doshas } from '../doshaData.js';
import { state, doshaKeys, effectiveTheme } from '../state.js';
import { pathFor, SHOW_TREATMENTS } from '../router.js';
import { tr } from '../i18n.js';
import {
  doshaIcons,
  sunIcon,
  moonIcon,
  peepalEmblem,
  doshaSimpleInfo,
  whatsappIcon,
  whatsappLinkAttrs,
  consultMessage,
  instagramIcon,
  instagramLink,
  youtubeIcon,
  youtubeLink,
  menuIcon,
  closeIcon,
  chevronRightIcon
} from '../icons.js';

export function renderNav() {
  const links = [
    { key: 'home', label: tr('Home') },
    { key: 'about', label: tr('About Us') },
    ...(SHOW_TREATMENTS ? [{ key: 'treatments', label: tr('Treatments') }] : []),
    { key: 'products', label: tr('Products') }
  ];
  const isDark = effectiveTheme() === 'dark';
  const isHindi = state.lang === 'hi';
  return `
    <nav class="site-nav">
      <div class="site-nav__inner">
        <a class="site-nav__brand" href="/" data-nav="home" aria-label="${tr('Hitayu — Home')}">${peepalEmblem()}</a>
        <div class="site-nav__right">
          <div class="site-nav__links">
            ${links
              .map(
                (l) =>
                  `<a href="${pathFor(l.key)}" class="site-nav__link ${state.page === l.key ? 'site-nav__link--active' : ''}" data-nav="${l.key}"${state.page === l.key ? ' aria-current="page"' : ''}>${l.label}</a>`
              )
              .join('')}
          </div>
          <div class="site-nav__icons">
            <a href="${instagramLink}" target="_blank" rel="noopener" class="social-nav-link social-nav-link--instagram" aria-label="${tr('Follow us on Instagram')}">
              ${instagramIcon}
            </a>
            <a ${whatsappLinkAttrs(consultMessage())} target="_blank" rel="noopener" class="social-nav-link social-nav-link--whatsapp" aria-label="${tr('Chat with us on WhatsApp')}">
              ${whatsappIcon}
            </a>
            <a href="${youtubeLink}" target="_blank" rel="noopener" class="social-nav-link social-nav-link--youtube" aria-label="${tr('Watch us on YouTube')}">
              ${youtubeIcon}
            </a>
            <button type="button" class="lang-toggle" id="lang-toggle" lang="${isHindi ? 'en' : 'hi'}" aria-label="${isHindi ? 'View in English' : 'हिंदी में देखें'}" title="${isHindi ? 'View in English' : 'हिंदी में देखें'}">
              ${isHindi ? 'EN' : 'हिं'}
            </button>
            <button type="button" class="theme-toggle" id="theme-toggle" aria-label="${tr(isDark ? 'Switch to light mode' : 'Switch to dark mode')}" aria-pressed="${isDark}">
              ${isDark ? moonIcon : sunIcon}
            </button>
            <button type="button" class="nav-menu-toggle" id="nav-menu-toggle" aria-label="${tr(state.navMenuOpen ? 'Close menu' : 'Open menu')}" aria-expanded="${state.navMenuOpen}" aria-controls="nav-menu">
              ${state.navMenuOpen ? closeIcon : menuIcon}
            </button>
          </div>
        </div>
      </div>
      ${state.navMenuOpen ? renderNavMenu() : ''}
    </nav>
    ${state.navMenuOpen ? '<div class="nav-menu-backdrop" id="nav-menu-backdrop" aria-hidden="true"></div>' : ''}
  `;
}

// Phone menu (≤600px): drops down under the bar. The bar itself keeps the
// logo, WhatsApp, theme and this menu's toggle; the page links and the
// Instagram/YouTube icons move in here.
function renderNavMenu() {
  const links = [
    { key: 'home', label: tr('Home') },
    { key: 'about', label: tr('About Us') },
    ...(SHOW_TREATMENTS ? [{ key: 'treatments', label: tr('Treatments') }] : []),
    { key: 'products', label: tr('Products') },
    { key: 'assessment', label: tr('Prakriti Assessment') }
  ];
  return `
    <div class="nav-menu" id="nav-menu">
      <ul class="nav-menu__links">
        ${links
          .map(
            (
              l
            ) => `<li><a href="${pathFor(l.key)}" class="nav-menu__link ${state.page === l.key ? 'nav-menu__link--active' : ''}" data-nav="${l.key}"${state.page === l.key ? ' aria-current="page"' : ''}>
              <span>${l.label}</span><span class="nav-menu__chevron" aria-hidden="true">${chevronRightIcon}</span>
            </a></li>`
          )
          .join('')}
      </ul>
      <div class="nav-menu__social">
        <a href="${instagramLink}" target="_blank" rel="noopener" class="nav-menu__social-link nav-menu__social-link--instagram">
          <span class="nav-menu__social-icon" aria-hidden="true">${instagramIcon}</span>Instagram
        </a>
        <a href="${youtubeLink}" target="_blank" rel="noopener" class="nav-menu__social-link nav-menu__social-link--youtube">
          <span class="nav-menu__social-icon" aria-hidden="true">${youtubeIcon}</span>YouTube
        </a>
      </div>
    </div>
  `;
}

// Trial: animated backdrop behind the dosha popup's text — wind gusts for
// Vata, rising flames and embers for Pitta, earth and water for Kapha. Purely decorative; remove this
// block, the ${doshaInfoFx[key] || ''} line below and the "Dosha popup
// backdrops" CSS to drop it.
const windPaths = [
  'M-20 40 C60 25 120 55 200 40 S330 25 420 40',
  'M-20 95 C80 80 150 110 230 92 S350 78 420 95',
  'M-20 150 C60 138 150 165 230 148 S350 135 420 152',
  'M-20 205 C70 192 140 218 210 202 S340 190 420 206',
  'M-20 260 C60 248 150 272 230 258 S350 246 420 262',
  'M-20 120 C90 108 160 132 240 118 S360 106 420 121'
];
const flames = [8, 18, 28, 38, 48, 58, 68, 78, 88, 13, 43, 73];
const embers = [15, 30, 45, 55, 65, 80, 25, 70];
// one wave period = 200 units, so sliding the 800-wide strip by half loops seamlessly
const wavePath = `M0 30 ${Array.from({ length: 8 }, (_, i) => (i === 0 ? 'Q50 18 100 30' : `T${(i + 1) * 100} 30`)).join(' ')} V60 H0 Z`;
const doshaInfoFx = {
  vata: `
    <svg class="dosha-fx dosha-fx--vata" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      ${windPaths.map((d, i) => `<path d="${d}" pathLength="100" style="--i:${i}" />`).join('')}
    </svg>`,
  pitta: `
    <div class="dosha-fx dosha-fx--pitta" aria-hidden="true">
      ${flames.map((x, i) => `<span class="flame" style="--x:${x}%;--i:${i}"></span>`).join('')}
      ${embers.map((x, i) => `<span class="ember" style="--x:${x}%;--i:${i}"></span>`).join('')}
    </div>`,
  kapha: `
    <div class="dosha-fx dosha-fx--kapha" aria-hidden="true">
      <svg class="kapha-water kapha-water--back" viewBox="0 0 800 60" preserveAspectRatio="none"><path d="${wavePath}" /></svg>
      <svg class="kapha-water kapha-water--front" viewBox="0 0 800 60" preserveAspectRatio="none"><path d="${wavePath}" /></svg>
      ${[22, 52, 78].map((x, i) => `<span class="ripple" style="--x:${x}%;--i:${i}"></span>`).join('')}
      <svg class="kapha-earth" viewBox="0 0 400 60" preserveAspectRatio="none">
        <path class="kapha-earth__back" d="M0 34 C60 14 120 18 180 30 S300 10 400 26 V60 H0 Z" />
        <path class="kapha-earth__front" d="M0 46 C70 30 140 50 210 40 S330 28 400 44 V60 H0 Z" />
      </svg>
    </div>`
};

export function renderDoshaInfoOverlay() {
  const key = state.doshaInfoOpen;
  if (!key) return '';
  const info = doshaSimpleInfo[key];
  return `
    <div class="dosha-info-overlay" id="dosha-info-overlay">
      <div class="dosha-info-card dosha-info-card--${key}" role="dialog" aria-modal="true" aria-labelledby="dosha-info-title">
        ${doshaInfoFx[key] || ''}
        <button type="button" class="dosha-info-close" id="dosha-info-close" aria-label="${tr('Close')}">×</button>
        <span class="dosha-info-icon dosha-info-icon--${key}">${doshaIcons[key]}</span>
        <h3 class="dosha-info-title" id="dosha-info-title">${tr(info.title)}</h3>
        <p class="dosha-info-text">${tr(info.text)}</p>
      </div>
    </div>
  `;
}

// isLanding swaps in landing-page-specific copy; the assessment page keeps
// the original title and "Know Your Prakriti" line, but drops the clinic
// name/tagline and the subtitle — the landing page already carries that
// introduction, so the assessment page's hero stays leaner.
export function renderMasthead(isLanding) {
  return `
    <header class="masthead">
      <div class="masthead__emblem" aria-hidden="true">${peepalEmblem()}</div>
      ${isLanding ? '<p class="masthead__clinic">Hitayu Ayurvedic Clinic &amp; Wellness Center</p>' : ''}
      ${isLanding ? `<p class="masthead__clinic-sub">${tr('Rooted in Tradition · Grown for Your Wellbeing')}</p>` : ''}
      <div class="masthead__rule" aria-hidden="true"></div>
      <h1 class="masthead__title">${tr(isLanding ? 'Understand Yourself Through Ayurveda' : 'Prakriti Assessment')}</h1>
      ${isLanding ? '' : `<p class="masthead__know">${tr('Know Your Prakriti')}</p>`}
      ${isLanding ? '' : `<p class="masthead__tag">${tr('Dosha Questionnaire')}</p>`}
      <div class="masthead__doshas">
        ${doshaKeys
          .map(
            (k) => `
          <button type="button" class="dosha-medallion dosha-medallion--${k}" data-dosha-info="${k}" aria-label="${tr('What is {name}?', { name: tr(doshas[k].name) })}">
            <span class="dosha-medallion__icon dosha-medallion__icon--${k}">${doshaIcons[k]}</span>
            <span class="dosha-medallion__name">${tr(doshas[k].name)}</span>
            <span class="dosha-medallion__tag">${tr(doshas[k].tag)}</span>
          </button>`
          )
          .join('')}
      </div>
      ${isLanding ? `<p class="masthead__subtitle">${tr('An ancient self-portrait, drawn from the three doshas. Answer honestly, reflecting on your life as a whole — not just today.')}</p>` : ''}
    </header>
  `;
}

// A centred line of text over the social buttons, closing a page.
export function renderContactCta(text, whatsappLabel) {
  return `
    <section class="whatsapp-cta">
      <p class="whatsapp-cta__text">${text}</p>
      ${renderSocialButtons(whatsappLabel)}
    </section>
  `;
}

// WhatsApp / Instagram / YouTube as matching brand-coloured pill buttons —
// shared by the landing and About pages.
export function renderSocialButtons(whatsappLabel = tr('Chat on WhatsApp')) {
  const buttons = [
    { attrs: whatsappLinkAttrs(consultMessage()), mod: 'whatsapp', icon: whatsappIcon, label: whatsappLabel },
    { attrs: `href="${instagramLink}"`, mod: 'instagram', icon: instagramIcon, label: tr('Follow on Instagram') },
    { attrs: `href="${youtubeLink}"`, mod: 'youtube', icon: youtubeIcon, label: tr('Watch on YouTube') }
  ];
  return `
    <div class="brand-btn-row">
      ${buttons
        .map(
          (b) => `<a ${b.attrs} target="_blank" rel="noopener" class="brand-btn brand-btn--${b.mod}">
            <span class="brand-btn__icon" aria-hidden="true">${b.icon}</span>
            ${b.label}
          </a>`
        )
        .join('')}
    </div>
  `;
}

export function renderFooter() {
  return `
    <footer class="site-footer">
      <p class="site-footer__name">Hitayu — Ayurvedic Clinic &amp; Wellness Center</p>
      <p class="site-footer__line">${tr('Rooted in tradition. Grown for your wellbeing.')}</p>
      <p class="site-footer__copyright">&copy; 2026 Hitayu Ayurvedic Clinic &amp; Wellness Center. ${tr('All rights reserved.')}</p>
    </footer>
  `;
}
