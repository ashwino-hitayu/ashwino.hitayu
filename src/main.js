import './style.css';
import { state, saveAnswers, saveProfile, saveTheme, applyTheme, effectiveTheme, getPageFromHash } from './state.js';
import { renderNav, renderDoshaInfoOverlay, renderFooter } from './components/chrome.js';
import { renderReportOverlay } from './components/report.js';
import { renderProductOverlay, renderImageLightbox } from './components/products.js';
import { products } from './productsData.js';
import { renderPage } from './pages.js';

const app = document.getElementById('app');

function render() {
  const focus = captureFocus();
  app.innerHTML = `
      <div class="texture-overlay" aria-hidden="true"></div>
      <div class="page">
        ${renderNav()}
        ${renderPage()}
        ${renderFooter()}
      </div>
      ${renderReportOverlay()}
      ${renderDoshaInfoOverlay()}
      ${renderProductOverlay()}
      ${renderImageLightbox()}
    `;
  if (!manageDialogFocus(focus)) restoreFocus(focus);
}

// The report is the only other place the profile name/age appear, so typing
// in those fields refreshes just the report instead of re-rendering the whole
// app (which would replace the input mid-keystroke and break IME/autocorrect
// composition on mobile keyboards).
function renderReportOnly() {
  const report = document.getElementById('report-overlay');
  if (report) report.outerHTML = renderReportOverlay();
}

// A selector that finds the "same" element again after a re-render, since
// innerHTML replaces every node. Covers the controls a user can act on.
function focusSelector(el) {
  if (!el || el === document.body || !app.contains(el)) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const attrs = ['data-open-lightbox', 'data-row-id', 'data-dosha', 'data-toggle-section', 'data-nav', 'data-dosha-info', 'data-product-open', 'data-product-thumb', 'data-product-image-prev', 'data-product-image-next'];
  const parts = attrs.filter((a) => el.hasAttribute(a)).map((a) => `[${a}="${CSS.escape(el.getAttribute(a))}"]`);
  return parts.length ? `${el.tagName.toLowerCase()}${parts.join('')}` : null;
}

function captureFocus() {
  const active = document.activeElement;
  const hasSelection = active && 'selectionStart' in active;
  return {
    selector: focusSelector(active),
    selStart: hasSelection ? active.selectionStart : null,
    selEnd: hasSelection ? active.selectionEnd : null
  };
}

function restoreFocus({ selector, selStart, selEnd }) {
  const el = selector && app.querySelector(selector);
  if (!el) return false;
  el.focus({ preventScroll: true });
  if (selStart !== null && el.setSelectionRange) {
    try {
      el.setSelectionRange(selStart, selEnd);
    } catch {
      /* not a text-selectable input (e.g. number) */
    }
  }
  return true;
}

// ==================== Popup (dialog) focus ====================
// Topmost first. The report overlay is always in the DOM, hidden unless open.
const DIALOGS = ['#image-lightbox', '#dosha-info-overlay', '#product-overlay', '#report-overlay.report-overlay--open'];
// Open dialogs, innermost last, each with the selector of the control that
// opened it so focus can return there when it closes.
const dialogStack = [];

function focusablesIn(container) {
  if (!container) return [];
  return [...container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => el.getClientRects().length > 0
  );
}

// Moves focus into a dialog that just opened, or back to its opener when it
// closed. Returns false when no dialog opened/closed, so the caller falls
// back to keeping focus where it was.
function manageDialogFocus(focus) {
  let opener = null;
  while (dialogStack.length && !app.querySelector(dialogStack.at(-1).selector)) {
    opener = dialogStack.pop().opener;
  }
  const top = DIALOGS.find((sel) => app.querySelector(sel));
  if (top && dialogStack.at(-1)?.selector !== top) {
    dialogStack.push({ selector: top, opener: focus.selector });
    const first = focusablesIn(app.querySelector(top))[0];
    if (first) first.focus({ preventScroll: true });
    return true;
  }
  return opener ? restoreFocus({ selector: opener, selStart: null, selEnd: null }) : false;
}

// Keeps Tab / Shift+Tab cycling inside the topmost open dialog.
function trapTab(e) {
  if (!dialogStack.length) return;
  const items = focusablesIn(app.querySelector(dialogStack.at(-1).selector));
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (!items.includes(active)) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  } else if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

function closeProductOverlay() {
  state.productOpen = null;
  state.lightboxOpen = false;
}

function stepProductImage(delta) {
  const product = products.find((p) => p.id === state.productOpen);
  const count = product ? product.images.length : 0;
  if (!count) return;
  state.productImageIndex = (state.productImageIndex + delta + count) % count;
}

// Click handling is delegated from the document so listeners are bound once
// rather than re-attached to fresh nodes after every render.
document.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target : null;
  if (!t) return;
  let el;

  if (t.closest('#theme-toggle')) {
    state.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(state.theme);
    applyTheme();
    render();
  } else if ((el = t.closest('[data-nav]'))) {
    e.preventDefault();
    const page = el.dataset.nav;
    state.page = page;
    if (location.hash !== `#${page}`) location.hash = page;
    window.scrollTo({ top: 0 });
    render();
  } else if ((el = t.closest('[data-dosha-info]'))) {
    state.doshaInfoOpen = el.dataset.doshaInfo;
    render();
  } else if (t.id === 'dosha-info-overlay' || t.closest('#dosha-info-close')) {
    state.doshaInfoOpen = null;
    render();
  } else if ((el = t.closest('[data-product-open]'))) {
    state.productOpen = el.dataset.productOpen;
    state.productImageIndex = 0;
    state.lightboxOpen = false;
    render();
  } else if (t.id === 'product-overlay' || t.closest('#product-overlay-close')) {
    closeProductOverlay();
    render();
  } else if (t.closest('[data-product-image-prev]')) {
    stepProductImage(-1);
    render();
  } else if (t.closest('[data-product-image-next]')) {
    stepProductImage(1);
    render();
  } else if ((el = t.closest('[data-product-thumb]'))) {
    state.productImageIndex = Number(el.dataset.productThumb);
    render();
  } else if (t.closest('[data-open-lightbox]')) {
    state.lightboxOpen = true;
    render();
  } else if (t.closest('#image-lightbox')) {
    // anywhere in the lightbox, including its close button, closes it
    state.lightboxOpen = false;
    render();
  } else if ((el = t.closest('.option'))) {
    const rowId = el.dataset.rowId;
    const dosha = el.dataset.dosha;
    if (state.answers[rowId] === dosha) {
      delete state.answers[rowId];
    } else {
      state.answers[rowId] = dosha;
    }
    saveAnswers();
    render();
    const row = app.querySelector(`[data-row="${CSS.escape(rowId)}"]`);
    if (row) row.scrollIntoView({ block: 'nearest' });
  } else if ((el = t.closest('.chapter__header'))) {
    toggleSection(el);
  } else if (t.closest('#reset-btn')) {
    if (confirm('Clear all your answers and begin the assessment anew?')) {
      state.answers = {};
      saveAnswers();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else if (t.closest('#open-report-btn')) {
    state.reportOpen = true;
    render();
  } else if (t.closest('#close-report-btn')) {
    state.reportOpen = false;
    render();
  } else if (t.closest('#print-report-btn')) {
    window.print();
  }
});

function toggleSection(header) {
  const title = header.dataset.toggleSection;
  state.collapsed[title] = !state.collapsed[title];
  render();
}

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'profile-name') {
    state.profile.name = el.value;
    saveProfile();
    renderReportOnly();
  } else if (el.id === 'profile-age') {
    const raw = el.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 3);
    if (digitsOnly !== raw) {
      const caret = el.selectionStart ?? raw.length;
      const newCaret = Math.min(raw.slice(0, caret).replace(/\D/g, '').length, digitsOnly.length);
      el.value = digitsOnly;
      el.setSelectionRange(newCaret, newCaret);
    }
    state.profile.age = digitsOnly;
    saveProfile();
    renderReportOnly();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'profile-gender') {
    state.profile.gender = e.target.value;
    saveProfile();
    render();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    trapTab(e);
    return;
  }

  // non-<button> elements acting as buttons (role="button" + tabindex)
  const t = e.target instanceof Element ? e.target : null;
  if (t && (e.key === 'Enter' || e.key === ' ')) {
    const header = t.closest('.chapter__header');
    if (header) {
      e.preventDefault();
      toggleSection(header);
      return;
    }
    if (t.closest('[data-open-lightbox]')) {
      e.preventDefault();
      state.lightboxOpen = true;
      render();
      return;
    }
  }

  if (e.key !== 'Escape') return;
  if (state.lightboxOpen) {
    state.lightboxOpen = false;
    render();
  } else if (state.doshaInfoOpen) {
    state.doshaInfoOpen = null;
    render();
  } else if (state.productOpen) {
    closeProductOverlay();
    render();
  } else if (state.reportOpen) {
    state.reportOpen = false;
    render();
  }
});

window.addEventListener('hashchange', () => {
  const page = getPageFromHash();
  // nav clicks already set state.page and rendered before the hash updated
  if (page === state.page) return;
  state.page = page;
  render();
});

if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onSchemeChange = () => {
    if (!state.theme) render();
  };
  // addListener: Safari < 14 lacks addEventListener on MediaQueryList
  if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
  else if (mq.addListener) mq.addListener(onSchemeChange);
}

applyTheme();
render();
