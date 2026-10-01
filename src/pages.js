// Thin page assemblers + the router that picks one based on state.page.
import { sections, shlokaLibrary } from './doshaData.js';
import { state } from './state.js';
import { renderMasthead } from './components/chrome.js';
import { renderWisdomGroup, renderProfileForm, renderSection, renderScorePanel, renderResult } from './components/assessment.js';

// Picked once per page load/refresh — a different verse greets the reader each time.
const shlokaKeys = Object.keys(shlokaLibrary);
const randomShlokaKey = shlokaKeys[Math.floor(Math.random() * shlokaKeys.length)];

// Landing page: just the hero and a wisdom card — the full assessment now
// lives on its own route (see renderAssessmentPage).
function renderHomePage() {
  return `
    ${renderMasthead(true)}
    <main class="content">
      ${renderWisdomGroup([randomShlokaKey])}
      <section class="landing-choices">
        <div class="landing-choice">
          <button type="button" class="btn btn--ghost landing-choice__btn">Agni</button>
          <p class="landing-choice__caption">Know Your Digestive Fire</p>
        </div>
        <div class="landing-choice">
          <a href="#assessment" data-nav="assessment" class="btn btn--primary landing-choice__btn">Prakriti</a>
          <p class="landing-choice__caption">Know Your Constitution</p>
        </div>
      </section>
    </main>
  `;
}

// The complete original home-page experience, unchanged, moved to its own
// route so the landing page above can stay lightweight.
function renderAssessmentPage() {
  return `
    ${renderMasthead()}
    <main class="content">
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

export function renderPage() {
  if (state.page === 'assessment') return renderAssessmentPage();
  if (state.page === 'about') return renderAboutPage();
  if (state.page === 'products') return renderProductsPage();
  return renderHomePage();
}
