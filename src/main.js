import './style.css';
import { state, saveAnswers, saveProfile, saveTheme, applyTheme, effectiveTheme } from './state.js';
import { sections } from './doshaData.js';
import { parsePath, pathFor, legacyHashPath } from './router.js';
import { metaForPath } from './seo.js';
import { renderNav, renderDoshaInfoOverlay, renderFooter } from './components/chrome.js';
import { renderReportOverlay } from './components/report.js';
import { renderProductOverlay, renderImageLightbox, warmProductTile } from './components/products.js';
import { products } from './productsData.js';
import { whatsappMessageUrl } from './icons.js';
import { renderPage } from './pages.js';
import { resultMessage } from './components/assessment.js';
import { toggleTreatmentFlip } from './components/treatments.js';

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
  updateDocumentMeta();
}

// ==================== Routing ====================
// Clean URLs via the History API; see router.js for the route table.

function updateDocumentMeta() {
  const meta = metaForPath(location.pathname);
  if (document.title !== meta.title) document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  if (!meta.noindex) document.querySelector('link[rel="canonical"]')?.setAttribute('href', location.origin + location.pathname);
}

// Syncs state with the current URL. Returns true if the page changed.
function applyRoute() {
  const { page, productId } = parsePath(location.pathname);
  const pageChanged = page !== state.page;
  state.page = page;
  if (productId !== state.productOpen) {
    state.productOpen = productId;
    state.productImageIndex = 0;
    state.lightboxOpen = false;
  }
  if (pageChanged) {
    // popups belong to the page they were opened on
    state.navMenuOpen = false;
    state.doshaInfoOpen = null;
    state.reportOpen = false;
    state.lightboxOpen = false;
  }
  return pageChanged;
}

function navigate(path, { replace = false, historyState = null } = {}) {
  if (path !== location.pathname) {
    history[replace ? 'replaceState' : 'pushState'](historyState, '', path);
  }
  const pageChanged = applyRoute();
  if (pageChanged) window.scrollTo({ top: 0 });
  render();
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Scrolls to the first unanswered trait (expanding its section if collapsed).
function goToNextUnanswered() {
  for (const section of sections) {
    const row = section.rows.find((r) => !state.answers[r.id]);
    if (!row) continue;
    if (state.collapsed[section.title]) {
      state.collapsed[section.title] = false;
      render();
    }
    const el = app.querySelector(`[data-row="${CSS.escape(row.id)}"]`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      el.querySelector('.option')?.focus({ preventScroll: true });
    }
    return;
  }
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

// The product popup has its own URL (/products/:id). If we pushed that entry
// when opening it, going back closes it (and keeps the Back button natural);
// if the visitor arrived on the product link directly, swap in /products.
function closeProductOverlay() {
  if (history.state?.productPopup) {
    history.back();
  } else {
    navigate(pathFor('products'), { replace: true });
  }
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

  if ((el = t.closest('a[data-wa-message], a[data-wa-result]')) && e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
    // build the pre-filled wa.me link only now, so the number never sits in the page
    e.preventDefault();
    const message = el.hasAttribute('data-wa-result') ? resultMessage() : el.dataset.waMessage;
    window.open(whatsappMessageUrl(message), '_blank', 'noopener');
  } else if (t.closest('#nav-menu-toggle')) {
    state.navMenuOpen = !state.navMenuOpen;
    render();
  } else if (t.id === 'nav-menu-backdrop') {
    state.navMenuOpen = false;
    render();
  } else if (t.closest('#theme-toggle')) {
    state.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(state.theme);
    applyTheme();
    render();
  } else if ((el = t.closest('[data-nav]'))) {
    // let the browser handle new-tab / new-window clicks
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    state.navMenuOpen = false;
    navigate(el.getAttribute('href'));
    if (el.hasAttribute('data-resume')) goToNextUnanswered();
  } else if (t.closest('[data-next-unanswered]')) {
    goToNextUnanswered();
  } else if ((el = t.closest('[data-dosha-info]'))) {
    state.doshaInfoOpen = el.dataset.doshaInfo;
    render();
  } else if (t.id === 'dosha-info-overlay' || t.closest('#dosha-info-close')) {
    state.doshaInfoOpen = null;
    render();
  } else if ((el = t.closest('[data-flip]'))) {
    toggleTreatmentFlip(el);
  } else if ((el = t.closest('[data-product-open]'))) {
    navigate(pathFor('products', el.dataset.productOpen), { historyState: { productPopup: true } });
  } else if (t.id === 'product-overlay' || t.closest('#product-overlay-close')) {
    closeProductOverlay();
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
  } else if (t.closest('#open-report-btn, [data-open-report]')) {
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

// Fetch a product tile's slideshow photos the first time it's hovered/focused.
const warmTile = (e) => {
  const tile = e.target instanceof Element && e.target.closest('.product-tile__open');
  if (tile) warmProductTile(tile);
};
document.addEventListener('mouseover', warmTile);
document.addEventListener('focusin', warmTile);

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
  if (state.navMenuOpen) {
    state.navMenuOpen = false;
    render();
  } else if (state.lightboxOpen) {
    state.lightboxOpen = false;
    render();
  } else if (state.doshaInfoOpen) {
    state.doshaInfoOpen = null;
    render();
  } else if (state.productOpen) {
    closeProductOverlay();
  } else if (state.reportOpen) {
    state.reportOpen = false;
    render();
  }
});

window.addEventListener('popstate', () => {
  applyRoute();
  render();
});

// Old hash links (#about, #assessment…) still work: map them to clean paths.
window.addEventListener('hashchange', () => {
  const legacy = legacyHashPath(location.hash);
  if (legacy) navigate(legacy, { replace: true });
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

const legacyPath = location.pathname === '/' && legacyHashPath(location.hash);
if (legacyPath) history.replaceState(null, '', legacyPath);
applyRoute();
applyTheme();
render();
