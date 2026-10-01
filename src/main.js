import './style.css';
import { state, saveAnswers, saveProfile, saveTheme, applyTheme, effectiveTheme, getPageFromHash } from './state.js';
import { renderNav, renderDoshaInfoOverlay, renderFooter } from './components/chrome.js';
import { renderReportOverlay } from './components/report.js';
import { renderPage } from './pages.js';

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="texture-overlay" aria-hidden="true"></div>
    <div class="page">
      ${renderNav()}
      ${renderPage()}
      ${renderFooter()}
    </div>
    ${renderReportOverlay()}
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
