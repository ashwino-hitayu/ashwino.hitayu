// Thin page assemblers + the router that picks one based on state.page.
import { sections, shlokaLibrary, doshas, totalQuestions } from './doshaData.js';
import { state, doshaKeys, escapeHtml, computeVerdict } from './state.js';
import { renderMasthead, renderSocialButtons } from './components/chrome.js';
import { renderWisdomGroup, renderProfileForm, renderSection, renderScorePanel, renderResult } from './components/assessment.js';
import { products } from './productsData.js';
import { renderProductGrid } from './components/products.js';
import { pathFor } from './router.js';

// Picked once per page load/refresh — a different verse greets the reader each time.
const shlokaKeys = Object.keys(shlokaLibrary);
const randomShlokaKey = shlokaKeys[Math.floor(Math.random() * shlokaKeys.length)];

// Landing page: just the hero and a wisdom card — the full assessment now
// lives on its own route (see renderAssessmentPage).
// "Welcome back" card for visitors with saved answers (they persist in the
// browser), linking straight to the next unanswered trait.
function renderResumeCard() {
  const { answered, complete, verdictName } = computeVerdict();
  if (!answered) return '';
  const name = state.profile.name.trim();
  const text = complete
    ? `Your Prakriti reading is complete — <strong>${verdictName}</strong>.`
    : `You've answered <strong>${answered} of ${totalQuestions}</strong> traits in your Prakriti assessment.`;
  return `
    <section class="resume-card">
      <div class="resume-card__body">
        <p class="resume-card__eyebrow">Welcome back${name ? `, ${escapeHtml(name)}` : ''}</p>
        <p class="resume-card__text">${text}</p>
      </div>
      <a href="${pathFor('assessment')}" data-nav="assessment" ${complete ? '' : 'data-resume'} class="btn btn--primary resume-card__btn">${complete ? 'View Your Reading' : 'Continue Assessment'}</a>
    </section>
  `;
}

function renderHomePage() {
  return `
    ${renderMasthead(true)}
    <main class="content">
      ${renderResumeCard()}
      ${renderWisdomGroup([randomShlokaKey])}
      <section class="landing-choices">
        <div class="landing-choice">
          <button type="button" class="btn btn--ghost landing-choice__btn">Agni</button>
          <p class="landing-choice__caption">Know Your Digestive Fire</p>
        </div>
        <div class="landing-choice">
          <a href="${pathFor('assessment')}" data-nav="assessment" class="btn btn--primary landing-choice__btn">Prakriti</a>
          <p class="landing-choice__caption">Know Your Constitution</p>
        </div>
      </section>
      <section class="whatsapp-cta">
        <p class="whatsapp-cta__text">Prefer to talk to us directly?</p>
        ${renderSocialButtons('Chat with us on WhatsApp')}
      </section>
    </main>
  `;
}

// Phones stack the score panel above the questions, so a slim bar pinned to
// the bottom of the screen keeps progress in view while scrolling, with a
// jump to the next unanswered trait (or the report once complete).
function renderMobileProgress() {
  const { totals, answered, complete } = computeVerdict();
  const tally = doshaKeys
    .map((k) => `<span class="mobile-progress__dosha mobile-progress__dosha--${k}" title="${doshas[k].name}"><span class="mobile-progress__dot" aria-hidden="true"></span>${totals[k]}</span>`)
    .join('');
  return `
    <div class="mobile-progress" role="region" aria-label="Assessment progress">
      <div class="mobile-progress__info">
        <span class="mobile-progress__count">${answered}/${totalQuestions}</span>
        <span class="mobile-progress__track" aria-hidden="true"><span class="mobile-progress__fill" style="width:${(answered / totalQuestions) * 100}%"></span></span>
      </div>
      <div class="mobile-progress__tally" aria-label="Vata ${totals.vata}, Pitta ${totals.pitta}, Kapha ${totals.kapha}">${tally}</div>
      ${
        complete
          ? '<button type="button" class="mobile-progress__btn" data-open-report>View Report</button>'
          : '<button type="button" class="mobile-progress__btn" data-next-unanswered>Next <span aria-hidden="true">↓</span></button>'
      }
    </div>
  `;
}

// The complete original home-page experience, unchanged, moved to its own
// route so the landing page above can stay lightweight.
function renderAssessmentPage() {
  return `
    ${renderMasthead()}
    <main class="content content--has-mobile-progress">
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
    ${renderMobileProgress()}
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
        <div class="about-card__contact">
          ${renderSocialButtons()}
          <div class="about-card__qr">
            <img src="/whatsapp-qr.png" alt="WhatsApp QR code — scan to chat with Hitayu" width="395" height="395" loading="lazy" />
            <p>Or scan to chat on WhatsApp</p>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderProductsPage() {
  if (products.length === 0) {
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
  return `
    <main class="content">
      <section class="products-intro">
        <p class="products-intro__eyebrow">Products</p>
        <h2 class="products-intro__title">From The House of Hitayu</h2>
        <p class="products-intro__hint">Tap an item to view details</p>
      </section>
      ${renderProductGrid()}
    </main>
  `;
}

function renderNotFoundPage() {
  return `
    <main class="content">
      <section class="empty-state">
        <p class="empty-state__eyebrow">404</p>
        <h2 class="empty-state__title">Page Not Found</h2>
        <p class="empty-state__text">The page you were looking for isn't here — it may have moved.</p>
        <a href="/" data-nav="home" class="btn btn--primary">Back to Home</a>
      </section>
    </main>
  `;
}

export function renderPage() {
  if (state.page === 'assessment') return renderAssessmentPage();
  if (state.page === 'about') return renderAboutPage();
  if (state.page === 'products') return renderProductsPage();
  if (state.page === 'notfound') return renderNotFoundPage();
  return renderHomePage();
}
