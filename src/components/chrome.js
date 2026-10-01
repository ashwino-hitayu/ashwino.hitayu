// Shared page furniture used across routes: top nav, hero masthead, the
// dosha info popup it launches, and the footer.
import { doshas } from '../doshaData.js';
import { state, doshaKeys, effectiveTheme } from '../state.js';
import { pathFor } from '../router.js';
import { doshaIcons, sunIcon, moonIcon, peepalEmblem, doshaSimpleInfo, whatsappIcon, whatsappChatLink, consultMessage, instagramIcon, instagramLink, youtubeIcon, youtubeLink, menuIcon, closeIcon, chevronRightIcon } from '../icons.js';

export function renderNav() {
  const links = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About Us' },
    { key: 'products', label: 'Products' }
  ];
  const isDark = effectiveTheme() === 'dark';
  return `
    <nav class="site-nav">
      <div class="site-nav__inner">
        <a class="site-nav__brand" href="/" data-nav="home" aria-label="Hitayu — Home">${peepalEmblem()}</a>
        <div class="site-nav__right">
          <div class="site-nav__links">
            ${links
              .map(
                (l) => `<a href="${pathFor(l.key)}" class="site-nav__link ${state.page === l.key ? 'site-nav__link--active' : ''}" data-nav="${l.key}"${state.page === l.key ? ' aria-current="page"' : ''}>${l.label}</a>`
              )
              .join('')}
          </div>
          <div class="site-nav__icons">
            <a href="${instagramLink}" target="_blank" rel="noopener" class="social-nav-link social-nav-link--instagram" aria-label="Follow us on Instagram">
              ${instagramIcon}
            </a>
            <a href="${whatsappChatLink(consultMessage)}" target="_blank" rel="noopener" class="social-nav-link social-nav-link--whatsapp" aria-label="Chat with us on WhatsApp">
              ${whatsappIcon}
            </a>
            <a href="${youtubeLink}" target="_blank" rel="noopener" class="social-nav-link social-nav-link--youtube" aria-label="Watch us on YouTube">
              ${youtubeIcon}
            </a>
            <button type="button" class="theme-toggle" id="theme-toggle" aria-label="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}" aria-pressed="${isDark}">
              ${isDark ? moonIcon : sunIcon}
            </button>
            <button type="button" class="nav-menu-toggle" id="nav-menu-toggle" aria-label="${state.navMenuOpen ? 'Close menu' : 'Open menu'}" aria-expanded="${state.navMenuOpen}" aria-controls="nav-menu">
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
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About Us' },
    { key: 'products', label: 'Products' },
    { key: 'assessment', label: 'Prakriti Assessment' }
  ];
  return `
    <div class="nav-menu" id="nav-menu">
      <ul class="nav-menu__links">
        ${links
          .map(
            (l) => `<li><a href="${pathFor(l.key)}" class="nav-menu__link ${state.page === l.key ? 'nav-menu__link--active' : ''}" data-nav="${l.key}"${state.page === l.key ? ' aria-current="page"' : ''}>
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

export function renderDoshaInfoOverlay() {
  const key = state.doshaInfoOpen;
  if (!key) return '';
  const info = doshaSimpleInfo[key];
  return `
    <div class="dosha-info-overlay" id="dosha-info-overlay">
      <div class="dosha-info-card dosha-info-card--${key}" role="dialog" aria-modal="true" aria-labelledby="dosha-info-title">
        <button type="button" class="dosha-info-close" id="dosha-info-close" aria-label="Close">×</button>
        <span class="dosha-info-icon dosha-info-icon--${key}">${doshaIcons[key]}</span>
        <h3 class="dosha-info-title" id="dosha-info-title">${info.title}</h3>
        <p class="dosha-info-text">${info.text}</p>
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
      ${isLanding ? '<p class="masthead__clinic-sub">Rooted in Tradition · Grown for Your Wellbeing</p>' : ''}
      <div class="masthead__rule" aria-hidden="true"></div>
      <h1 class="masthead__title">${isLanding ? 'Understand Yourself Through Ayurveda' : 'Prakriti Assessment'}</h1>
      ${isLanding ? '' : '<p class="masthead__know">Know Your Prakriti</p>'}
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
      ${isLanding ? '<p class="masthead__subtitle">An ancient self-portrait, drawn from the three doshas. Answer honestly, reflecting on your life as a whole — not just today.</p>' : ''}
    </header>
  `;
}

// WhatsApp / Instagram / YouTube as matching brand-coloured pill buttons —
// shared by the landing and About pages.
export function renderSocialButtons(whatsappLabel = 'Chat on WhatsApp') {
  const buttons = [
    { href: whatsappChatLink(consultMessage), mod: 'whatsapp', icon: whatsappIcon, label: whatsappLabel },
    { href: instagramLink, mod: 'instagram', icon: instagramIcon, label: 'Follow on Instagram' },
    { href: youtubeLink, mod: 'youtube', icon: youtubeIcon, label: 'Watch on YouTube' }
  ];
  return `
    <div class="brand-btn-row">
      ${buttons
        .map(
          (b) => `<a href="${b.href}" target="_blank" rel="noopener" class="brand-btn brand-btn--${b.mod}">
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
      <p class="site-footer__line">Rooted in tradition. Grown for your wellbeing.</p>
      <p class="site-footer__copyright">&copy; 2026 Hitayu Ayurvedic Clinic &amp; Wellness Center. All rights reserved.</p>
    </footer>
  `;
}
