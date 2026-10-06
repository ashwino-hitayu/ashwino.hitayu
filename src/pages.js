// Thin page assemblers + the router that picks one based on state.page.
import { sections, shlokaLibrary, doshas, totalQuestions } from './doshaData.js';
import { state, doshaKeys, escapeHtml, computeVerdict } from './state.js';
import { renderMasthead, renderSocialButtons, renderContactCta } from './components/chrome.js';
import { renderWisdomGroup, renderProfileForm, renderSection, renderScorePanel, renderResult } from './components/assessment.js';
import { products } from './productsData.js';
import { renderProductGrid } from './components/products.js';
import { renderTreatmentGrid } from './components/treatments.js';
import { pathFor } from './router.js';
import { tr } from './i18n.js';

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
    ? tr('Your Prakriti reading is complete — <strong>{verdict}</strong>.', { verdict: tr(verdictName) })
    : tr("You've answered <strong>{answered} of {total}</strong> traits in your Prakriti assessment.", { answered, total: totalQuestions });
  return `
    <section class="resume-card">
      <div class="resume-card__body">
        <p class="resume-card__eyebrow">${tr('Welcome back')}${name ? `, ${escapeHtml(name)}` : ''}</p>
        <p class="resume-card__text">${text}</p>
      </div>
      <a href="${pathFor('assessment')}" data-nav="assessment" ${complete ? '' : 'data-resume'} class="btn btn--primary resume-card__btn">${tr(complete ? 'View Your Reading' : 'Continue Assessment')}</a>
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
          <button type="button" class="btn btn--ghost landing-choice__btn landing-choice__btn--soon" aria-disabled="true">
            ${tr('Agni')}<span class="soon-tip" role="tooltip">${tr('Coming soon')}</span>
          </button>
          <p class="landing-choice__caption">${tr('Know Your Digestive Fire')}</p>
        </div>
        <div class="landing-choice">
          <a href="${pathFor('assessment')}" data-nav="assessment" class="btn btn--primary landing-choice__btn">${tr('Prakriti')}</a>
          <p class="landing-choice__caption">${tr('Know Your Constitution')}</p>
        </div>
      </section>
      ${renderContactCta(tr('Prefer to talk to us directly?'), tr('Chat with us on WhatsApp'))}
    </main>
  `;
}

// Phones stack the score panel above the questions, so a slim bar pinned to
// the bottom of the screen keeps progress in view while scrolling, with a
// jump to the next unanswered trait (or the report once complete).
function renderMobileProgress() {
  const { totals, answered, complete } = computeVerdict();
  const tally = doshaKeys
    .map(
      (k) =>
        `<span class="mobile-progress__dosha mobile-progress__dosha--${k}" title="${tr(doshas[k].name)}"><span class="mobile-progress__dot" aria-hidden="true"></span>${totals[k]}</span>`
    )
    .join('');
  return `
    <div class="mobile-progress" role="region" aria-label="${tr('Assessment progress')}">
      <div class="mobile-progress__info">
        <span class="mobile-progress__count">${answered}/${totalQuestions}</span>
        <span class="mobile-progress__track" aria-hidden="true"><span class="mobile-progress__fill" style="width:${(answered / totalQuestions) * 100}%"></span></span>
      </div>
      <div class="mobile-progress__tally" aria-label="${tr('Vata {vata}, Pitta {pitta}, Kapha {kapha}', totals)}">${tally}</div>
      ${
        complete
          ? `<button type="button" class="mobile-progress__btn" data-open-report>${tr('View Report')}</button>`
          : `<button type="button" class="mobile-progress__btn" data-next-unanswered>${tr('Next')} <span aria-hidden="true">↓</span></button>`
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
        <p class="about-card__eyebrow">${tr('About Me')}</p>
        <h2 class="about-card__name">${tr('Dr. Hitesh Pant')} <span class="about-card__suffix">| ${tr('Vaidya')}</span></h2>
        <p class="about-card__creds">B.A.M.S. (RGUHS), CCP (Maharashtra)</p>
        <p class="about-card__role">${tr('General Physician &amp; Ayurvedic Consultant')}</p>
        <div class="about-card__body">
          <p>${tr('Hello! I am Dr. Hitesh Pant, a B.A.M.S. certified Ayurvedic Physician and General Practitioner focused on pure Ayurveda and classical treatment principles.')}</p>
          <p>${tr('I specialize in treating chronic health issues, pain management (including Agnikarma and Viddhakarma), gut-related problems, and Marma therapy. My goal is to help patients achieve long-term wellness and a healthier lifestyle through authentic Ayurvedic practices, lifestyle coaching, and traditional medicine preparation.')}</p>
        </div>
        <div class="about-card__meta">
          <p>${tr('<strong>Registration:</strong> UK 4778 (Bhartiya Chikitsa Parishad, Uttarakhand)')}</p>
          <p>${tr('<strong>Languages Spoken:</strong> Hindi, English, Kannada, Pahadi')}</p>
        </div>
        <div class="about-card__contact">
          ${renderSocialButtons()}
          <div class="about-card__qr">
            <img src="/whatsapp-qr.png" alt="${tr('WhatsApp QR code — scan to chat with Hitayu')}" width="395" height="395" loading="lazy" />
            <p>${tr('Or scan to chat on WhatsApp')}</p>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderTreatmentsPage() {
  return `
    <main class="content">
      <section class="page-intro">
        <p class="page-intro__eyebrow">${tr('Treatments')}</p>
        <h2 class="page-intro__title">${tr('Classical Ayurvedic Therapies')}</h2>
        <p class="page-intro__sub">${tr('Time-honoured therapies, planned around your constitution and condition.')}</p>
      </section>
      ${renderTreatmentGrid()}
      <p class="treatments-disclaimer">${tr('Every therapy is planned after a consultation, according to your Prakriti, condition and season. Results vary from person to person, and these therapies complement — never replace — emergency or ongoing medical care.')}</p>
      ${renderContactCta(tr('Not sure which therapy suits you?'), tr('Book a Consultation on WhatsApp'))}
    </main>
  `;
}

function renderProductsPage() {
  if (products.length === 0) {
    return `
      <main class="content">
        <section class="empty-state">
          <p class="empty-state__eyebrow">${tr('Products')}</p>
          <h2 class="empty-state__title">${tr('Coming Soon')}</h2>
          <p class="empty-state__text">${tr("We're preparing a curated range of Ayurvedic products. Please check back soon.")}</p>
        </section>
      </main>
    `;
  }
  return `
    <main class="content">
      <section class="page-intro">
        <p class="page-intro__eyebrow">${tr('Products')}</p>
        <h2 class="page-intro__title">${tr('From The House of Hitayu')}</h2>
        <p class="crafted-note"><span>${tr('Crafted by a Vaidya')}</span><span class="crafted-note__circulation">${tr('Only for private circulation')}</span></p>
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
        <h2 class="empty-state__title">${tr('Page Not Found')}</h2>
        <p class="empty-state__text">${tr("The page you were looking for isn't here — it may have moved.")}</p>
        <a href="/" data-nav="home" class="btn btn--primary">${tr('Back to Home')}</a>
      </section>
    </main>
  `;
}

export function renderPage() {
  if (state.page === 'assessment') return renderAssessmentPage();
  if (state.page === 'about') return renderAboutPage();
  if (state.page === 'treatments') return renderTreatmentsPage();
  if (state.page === 'products') return renderProductsPage();
  if (state.page === 'notfound') return renderNotFoundPage();
  return renderHomePage();
}
