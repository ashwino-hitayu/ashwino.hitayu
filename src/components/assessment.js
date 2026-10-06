// The quiz feature itself: patient details form, wisdom/shloka cards, the
// body score panel, the question sections/rows, and the result summary.
import { doshas, shlokaLibrary, totalQuestions } from '../doshaData.js';
import { state, doshaKeys, escapeHtml, computeTotals, computeSectionTotals, computePercents, computeVerdict } from '../state.js';
import { whatsappIcon, whatsappLink } from '../icons.js';
import { tr } from '../i18n.js';

const genderLabels = { female: 'Female', male: 'Male', other: 'Other' };

// The WhatsApp message for "Send My Result to the Doctor". Built at click
// time (see main.js) since typing a name/age doesn't re-render the page.
// Always English, like the printed report — it's read by the clinic.
export function resultMessage() {
  const { totals, verdictName } = computeVerdict();
  const percents = computePercents(totals);
  const { name, age, gender } = state.profile;
  const details = [name.trim() && `Name: ${name.trim()}`, age && `Age: ${age}`, genderLabels[gender] && `Sex: ${genderLabels[gender]}`].filter(Boolean);
  return [
    'Hello Dr. Pant, I have completed the Prakriti assessment on the Hitayu website.',
    '',
    ...details,
    `Result: ${verdictName}`,
    doshaKeys.map((k) => `${doshas[k].name} ${percents[k]}%`).join(' · '),
    '',
    'I would like to book a consultation to discuss my result.'
  ].join('\n');
}

export function renderProfileForm() {
  const p = state.profile;
  return `
    <section class="profile-form">
      <p class="profile-form__eyebrow">${tr('Patient Details')}</p>
      <h2 class="profile-form__heading">${tr('Before We Begin')}</h2>
      <p class="profile-form__sub">${tr('A little about you, for a reading that speaks to you by name.')}</p>
      <div class="profile-form__note">
        <p>${tr('<strong>How to answer:</strong> for each trait, choose what has been true for most of your life — since childhood — not just how you have felt recently.')}</p>
        <p>${tr('This assessment is designed for adults (16+). For children, please consult the doctor.')}</p>
      </div>
      <div class="profile-form__grid">
        <label class="profile-form__field">
          <span>${tr('Name')}</span>
          <input type="text" id="profile-name" placeholder="${tr('Your name')}" value="${escapeHtml(p.name)}" autocomplete="name" />
        </label>
        <label class="profile-form__field">
          <span>${tr('Age')}</span>
          <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" id="profile-age" placeholder="${tr('Your age')}" value="${escapeHtml(p.age)}" autocomplete="off" />
        </label>
        <label class="profile-form__field">
          <span>${tr('Sex / Gender')}</span>
          <select id="profile-gender">
            <option value="" ${p.gender === '' ? 'selected' : ''}>${tr('Select…')}</option>
            <option value="female" ${p.gender === 'female' ? 'selected' : ''}>${tr('Female')}</option>
            <option value="male" ${p.gender === 'male' ? 'selected' : ''}>${tr('Male')}</option>
            <option value="other" ${p.gender === 'other' ? 'selected' : ''}>${tr('Other')}</option>
            <option value="prefer-not-to-say" ${p.gender === 'prefer-not-to-say' ? 'selected' : ''}>${tr('Prefer not to say')}</option>
          </select>
        </label>
      </div>
    </section>
  `;
}

// ==================== Wisdom / Shloka panels ====================
export function renderWisdomCard(key) {
  const s = shlokaLibrary[key];
  if (!s) return '';
  if (s.type === 'verse') {
    return `
      <div class="wisdom__card">
        <p class="wisdom__eyebrow">${tr('Ayurvedic Verse')}</p>
        <p class="wisdom__category">${s.category}</p>
        <p class="wisdom__sanskrit" lang="sa">${s.sanskrit}</p>
        <p class="wisdom__iast" lang="sa-Latn">${s.iast}</p>
        <p class="wisdom__hindi" lang="hi">${s.hindi}</p>
        <p class="wisdom__english">${s.english}</p>
        <p class="wisdom__source">${s.source}</p>
      </div>
    `;
  }
  return `
    <div class="wisdom__card">
      <p class="wisdom__eyebrow">${tr('Ayurvedic Teaching')}</p>
      <p class="wisdom__category">${s.category}</p>
      <p class="wisdom__hindi" lang="hi">${s.hindi}</p>
      <p class="wisdom__english">${s.english}</p>
      ${s.note ? `<p class="wisdom__note">${tr(s.note)}</p>` : ''}
      <p class="wisdom__source">${s.source}</p>
    </div>
  `;
}

export function renderWisdomGroup(keys) {
  return `
    <section class="wisdom">
      <div class="wisdom__grid">
        ${keys.map((k) => renderWisdomCard(k)).join('')}
      </div>
    </section>
  `;
}

// The body silhouette is a real image (public/figure-body-mask-male.png /
// -female.png) — an anatomically natural silhouette extracted from a
// reference illustration, used as a CSS mask — rather than a hand-coded
// SVG path, since a coded path can't match a genuine illustration's
// proportions and shading. Male is the default; the female silhouette is
// swapped in when that's the selected profile sex.
// One body, entirely covered — the relative Vata/Pitta/Kapha split (which
// always sums to 100% once anything is answered) blends top to bottom as
// one soft gradient (Kapha → Pitta → Vata), so a lone dominant dosha
// colours the whole figure instead of just its own small corner, and
// neighbouring doshas melt into each other rather than cutting sharply.
export function renderCombinedFigure(totals) {
  const pct = computePercents(totals);
  const hasAnswers = totals.vata + totals.pitta + totals.kapha > 0;
  const isFemale = state.profile.gender === 'female';

  const b1 = pct.kapha;
  const b2 = pct.kapha + pct.pitta;
  const blend1 = Math.min(3, pct.kapha / 2, pct.pitta / 2);
  const blend2 = Math.min(3, pct.pitta / 2, pct.vata / 2);

  const fill = hasAnswers
    ? `linear-gradient(to bottom,
        var(--kapha-selected) 0%,
        var(--kapha-selected) ${Math.max(0, b1 - blend1)}%,
        var(--pitta-selected) ${Math.min(100, b1 + blend1)}%,
        var(--pitta-selected) ${Math.max(0, b2 - blend2)}%,
        var(--vata-selected) ${Math.min(100, b2 + blend2)}%,
        var(--vata-selected) 100%)`
    : 'rgba(250, 246, 234, 0.2)';

  return `
    <div class="figure figure--combined ${isFemale ? 'figure--female' : ''}">
      <div class="figure__body figure__body--large">
        <div class="figure__fill" style="background: ${fill};"></div>
        <div class="figure__sheen" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

export function renderScorePanel() {
  const totals = computeTotals();
  const answered = Object.keys(state.answers).length;
  return `
    <aside class="score-panel" id="score-panel" aria-live="polite">
      <p class="score-panel__title">${tr('Your Constitution, So Far')}</p>
      ${renderCombinedFigure(totals)}
      <div class="score-panel__legend">
        ${doshaKeys
          .map(
            (k) => `
          <div class="legend-item legend-item--${k}">
            <span class="legend-item__swatch" aria-hidden="true"></span>
            <span class="legend-item__label">${tr(doshas[k].name)}</span>
            <span class="legend-item__count">${totals[k]}</span>
          </div>`
          )
          .join('')}
      </div>
      <p class="score-panel__progress">${tr('{answered} / {total} answered', { answered, total: totalQuestions })}</p>
      <div class="score-panel__bar"><div class="score-panel__bar-fill" style="width:${(answered / totalQuestions) * 100}%"></div></div>
      <button type="button" class="score-panel__reset" id="reset-btn">${tr('Begin Anew')}</button>
    </aside>
  `;
}

export function renderRow(row) {
  const selected = state.answers[row.id];
  return `
    <div class="row" data-row="${row.id}">
      <p class="row__label">${tr(row.label)}</p>
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
              <span class="option__text">${tr(row[k])}</span>
            </button>`;
          })
          .join('')}
      </div>
    </div>
  `;
}

export function renderSection(section, index) {
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
        aria-label="${tr(isCollapsed ? 'Expand {title}' : 'Collapse {title}', { title: tr(section.title) })}"
      >
        <span class="chapter__number">${String(index + 1).padStart(2, '0')}</span>
        <h2 class="chapter__title">${tr(section.title)}</h2>
        <div class="chapter__divider" aria-hidden="true"></div>
        <span class="chapter__toggle" aria-hidden="true">
          <span class="chapter__toggle-icon">${isCollapsed ? '+' : '–'}</span>
        </span>
      </div>
      ${
        isCollapsed
          ? `<p class="chapter__collapsed-hint">${section.rows.length - (totals.vata + totals.pitta + totals.kapha) === 0 ? tr('All traits answered') : tr('{answered} / {total} answered', { answered: totals.vata + totals.pitta + totals.kapha, total: section.rows.length })} ${tr('— tap to expand')}</p>`
          : `
      <div class="chapter__rows-head">
        <span></span>
        ${doshaKeys.map((k) => `<span class="chapter__rows-head-item chapter__rows-head-item--${k}">${tr(doshas[k].name)}</span>`).join('')}
      </div>
      <div class="chapter__rows">
        ${section.rows.map((row) => renderRow(row)).join('')}
      </div>`
      }
    </section>
  `;
}

export function renderResult() {
  const { answered, complete } = computeVerdict();

  return `
    <section class="result">
      <div class="result__panel">
        <p class="result__eyebrow">${complete ? tr('Your Reading Is Complete') : tr('Reading in progress — {answered} of {total} traits gathered', { answered, total: totalQuestions })}</p>
        <div class="result__actions">
          <button type="button" class="btn btn--primary" id="open-report-btn">${tr('View &amp; Print A4 Report')}</button>
          ${
            complete
              ? `<a href="${whatsappLink}" data-wa-result target="_blank" rel="noopener" class="brand-btn brand-btn--whatsapp">
            <span class="brand-btn__icon" aria-hidden="true">${whatsappIcon}</span>
            ${tr('Send My Result to the Doctor')}
          </a>`
              : ''
          }
        </div>
      </div>
      <p class="result__disclaimer">${tr('A gentle reminder: no dosha is good or bad — every body holds Vata, Pitta and Kapha together. This assessment offers self-understanding for educational purposes and is not a medical diagnosis. For a full Prakriti–Vikriti consultation, visit us at Hitayu.')}</p>
      <p class="result__disclaimer result__disclaimer--alert">${tr('<strong>Important:</strong> If you have chest pain, breathlessness, high fever, bleeding or sudden weakness, seek emergency medical care. Please don’t stop or change any prescribed medicine based on this assessment.')}</p>
    </section>
  `;
}
