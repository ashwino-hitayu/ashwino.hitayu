// Treatments page: one flip card per therapy. The front is the photo with the
// name; tapping it turns the card over (3D flip) to the details and a
// WhatsApp enquiry link. Flipping toggles a class in place rather than
// re-rendering, so the CSS transition actually plays; `flipped` remembers
// which cards are turned so a later full render (e.g. theme toggle) keeps them.
import { treatments } from '../treatmentsData.js';
import { whatsappIcon, whatsappLinkAttrs, treatmentMessage } from '../icons.js';

const flipped = new Set();

const flipIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M20 4v4.5h-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function renderTreatmentCard(t) {
  const isFlipped = flipped.has(t.id);
  return `
    <article class="treatment-card flip-card ${isFlipped ? 'is-flipped' : ''}" id="${t.id}">
      <div class="flip-card__inner">
        <div class="flip-card__face flip-card__front"${isFlipped ? ' inert' : ''}>
          ${t.image ? `<img class="flip-card__image" src="${t.image}" alt="" loading="lazy" decoding="async" />` : ''}
          <div class="flip-card__shade" aria-hidden="true"></div>
          <p class="flip-card__sanskrit" lang="hi">${t.sanskrit}</p>
          <h3 class="flip-card__name">${t.name}</h3>
          <p class="flip-card__tagline">${t.tagline}</p>
          <button type="button" class="flip-card__hint" data-flip aria-label="Show details for ${t.name}">
            <span class="flip-card__hint-icon" aria-hidden="true">${flipIcon}</span>Tap to explore
          </button>
        </div>
        <div class="flip-card__face flip-card__back"${isFlipped ? '' : ' inert'}>
          <button type="button" class="flip-card__back-btn" data-flip aria-label="Back to ${t.name} photo">${flipIcon}</button>
          <p class="treatment-card__sanskrit" lang="hi">${t.sanskrit}</p>
          <h3 class="treatment-card__name">${t.name}</h3>
          <p class="treatment-card__description">${t.description}</p>
          <p class="treatment-card__uses-label">Traditionally used for</p>
          <ul class="treatment-card__uses">
            ${t.uses.map((u) => `<li>${u}</li>`).join('')}
          </ul>
          ${t.note ? `<p class="treatment-card__note">${t.note}</p>` : ''}
          <a ${whatsappLinkAttrs(treatmentMessage(t.name))} target="_blank" rel="noopener" class="treatment-card__enquire">
            <span class="treatment-card__enquire-icon" aria-hidden="true">${whatsappIcon}</span>
            Ask about ${t.name}
          </a>
        </div>
      </div>
    </article>
  `;
}

export function renderTreatmentGrid() {
  const credited = treatments.filter((t) => t.credit);
  const credits = credited.length
    ? `<p class="treatments-credits">Photos: ${credited
        .map((t) => `${t.name} — <a href="${t.credit.url}" target="_blank" rel="noopener">${t.credit.author}</a> (${t.credit.source})`)
        .join(' · ')}</p>`
    : '';
  return `<div class="treatment-grid">${treatments.map(renderTreatmentCard).join('')}</div>${credits}`;
}

// Turn a card over from either side's [data-flip] button. The hidden face is
// made inert (unfocusable, hidden from screen readers) and focus moves to the
// newly shown face's button, since the one just pressed is now inert.
export function toggleTreatmentFlip(button) {
  const card = button.closest('.flip-card');
  if (!card) return;
  const isFlipped = card.classList.toggle('is-flipped');
  if (isFlipped) flipped.add(card.id);
  else flipped.delete(card.id);
  const front = card.querySelector('.flip-card__front');
  const back = card.querySelector('.flip-card__back');
  front.inert = isFlipped;
  back.inert = !isFlipped;
  (isFlipped ? back : front).querySelector('[data-flip]').focus({ preventScroll: true });
}
