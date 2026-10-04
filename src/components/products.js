// Products listing (compact tiles, Myntra/Amazon-style) + the quick-view
// popup a tile opens into — mirrors the dosha-info-overlay pattern in
// chrome.js (state field + click-to-open + backdrop/Escape-to-close).
// Each product can carry multiple photos: while a tile is hovered/focused
// its photos slide leftward one after another on a loop (CSS animation), and
// the popup gets a full gallery with prev/next arrows and thumbnails.
import { state } from '../state.js';
import { products } from '../productsData.js';
import { whatsappIcon, whatsappLinkAttrs, productMessage, chevronLeftIcon, chevronRightIcon } from '../icons.js';

// Seconds each photo rests in view, then seconds the slide to the next takes.
const SLIDE_HOLD = 1.8;
const SLIDE_MOVE = 0.8;

const pct = (n) => `${Number(n.toFixed(3))}%`;

// "₹450 · 30 ml", or whichever half is filled in; '' when neither is.
function priceLine(product, className) {
  const parts = [product.price, product.size].filter(Boolean);
  return parts.length ? `<span class="${className}">${parts.join(' · ')}</span>` : '';
}

// One keyframe set per photo count: hold on photo i, then slide one frame
// left. The track carries a copy of photo 0 at the end, so the final slide
// lands on an identical frame and the loop restarts without a jump back.
function slideKeyframes(count) {
  const step = 100 / count;
  const hold = (step * SLIDE_HOLD) / (SLIDE_HOLD + SLIDE_MOVE);
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push(`${pct(i * step)}, ${pct(i * step + hold)} { transform: translateX(-${i * 100}%); }`);
  }
  frames.push(`100% { transform: translateX(-${count * 100}%); }`);
  return `@keyframes product-tile-slide-${count} { ${frames.join(' ')} }`;
}

// Tiles whose hover slideshow has been activated. Until then only the cover
// photo is fetched: the other slides carry data-src and get their real src on
// first hover/focus (see warmProductTile) — the browser's own lazy-loading
// doesn't defer them, since they sit beside the cover rather than below the
// fold. Touch devices never hover, so they never download those slides.
const warmTiles = new Set();

export function warmProductTile(tileButton) {
  const id = tileButton.dataset.productOpen;
  if (warmTiles.has(id)) return;
  warmTiles.add(id);
  tileButton.querySelectorAll('img[data-src]').forEach((img) => {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });
}

// index = position in the grid: the first row's cover photos load right away
// (they're on screen); covers further down are lazy-loaded by the browser.
export function renderProductTile(product, index = 0) {
  const warm = warmTiles.has(product.id);
  const buyLink = whatsappLinkAttrs(productMessage(product.name));
  const count = product.images.length;
  const slides = count > 1 ? [...product.images, product.images[0]] : product.images;
  const trackStyle = count > 1 ? ` style="--slide-name: product-tile-slide-${count}; --slide-duration: ${(SLIDE_HOLD + SLIDE_MOVE) * count}s"` : '';
  return `
    <div class="product-tile">
      <button type="button" class="product-tile__open" data-product-open="${product.id}" aria-label="View ${product.name} details">
        <span class="product-tile__image-wrap">
          <span class="product-tile__track ${count > 1 ? 'product-tile__track--slides' : ''}"${trackStyle}>
            ${slides
              .map((src, i) => {
                const source = i === 0 || warm ? `src="${src}"` : `data-src="${src}"`;
                const lazy = i === 0 && index >= 4 ? ' loading="lazy"' : '';
                return `<img class="product-tile__image" ${source} alt="${i === 0 ? product.name : ''}" ${i === 0 ? '' : 'aria-hidden="true"'} decoding="async"${lazy} />`;
              })
              .join('')}
          </span>
        </span>
        <span class="product-tile__name">${product.name}</span>
        <span class="product-tile__tagline" title="${product.tagline}">${product.tagline}</span>
        ${priceLine(product, 'product-tile__price')}
      </button>
      <a ${buyLink} target="_blank" rel="noopener" class="product-tile__buy">
        <span class="brand-btn__icon" aria-hidden="true">${whatsappIcon}</span>
        Buy Now
      </a>
    </div>
  `;
}

export function renderProductGrid() {
  const counts = [...new Set(products.map((p) => p.images.length).filter((n) => n > 1))];
  return `
    <style>${counts.map(slideKeyframes).join('\n')}</style>
    <div class="product-grid">
      ${products.map((p, i) => renderProductTile(p, i)).join('')}
    </div>
  `;
}

export function renderProductOverlay() {
  const id = state.productOpen;
  if (!id) return '';
  const product = products.find((p) => p.id === id);
  if (!product) return '';
  const buyLink = whatsappLinkAttrs(productMessage(product.name));
  const total = product.images.length;
  const index = Math.min(state.productImageIndex, total - 1);
  const hasMultiple = total > 1;

  const gallery = hasMultiple
    ? `
      <button type="button" class="product-overlay__nav product-overlay__nav--prev" data-product-image-prev aria-label="Previous photo">${chevronLeftIcon}</button>
      <button type="button" class="product-overlay__nav product-overlay__nav--next" data-product-image-next aria-label="Next photo">${chevronRightIcon}</button>
    `
    : '';

  const thumbs = hasMultiple
    ? `
      <div class="product-overlay__thumbs">
        ${product.images
          .map(
            (src, i) => `<button type="button" class="product-overlay__thumb ${i === index ? 'product-overlay__thumb--active' : ''}" data-product-thumb="${i}" aria-label="Show photo ${i + 1}">
              <img src="${src}" alt="" loading="lazy" decoding="async" />
            </button>`
          )
          .join('')}
      </div>
    `
    : '';

  return `
    <div class="product-overlay" id="product-overlay">
      <div class="product-overlay__card" role="dialog" aria-modal="true" aria-labelledby="product-overlay-name">
        <button type="button" class="product-overlay__close" id="product-overlay-close" aria-label="Close">×</button>
        <div class="product-overlay__gallery">
          <img class="product-overlay__image" src="${product.images[index]}" alt="${product.name}" data-open-lightbox title="Click to view full photo" role="button" tabindex="0" aria-label="View full photo of ${product.name}" />
          ${gallery}
        </div>
        ${thumbs}
        <div class="product-overlay__body">
          <h3 class="product-overlay__name" id="product-overlay-name">${product.name}</h3>
          <p class="product-overlay__tagline">${product.tagline}</p>
          ${priceLine(product, 'product-overlay__price')}
          <p class="product-overlay__description">${product.description}</p>
          <ul class="product-overlay__benefits">
            ${product.benefits.map((b) => `<li>${b}</li>`).join('')}
          </ul>
          <a ${buyLink} target="_blank" rel="noopener" class="brand-btn brand-btn--whatsapp">
            <span class="brand-btn__icon" aria-hidden="true">${whatsappIcon}</span>
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
}

// Full-size view of whichever photo is currently shown in the popup —
// opened by clicking .product-overlay__image, since the gallery/tile crops
// to a fixed aspect ratio and these source photos vary wildly in size.
export function renderImageLightbox() {
  if (!state.lightboxOpen || !state.productOpen) return '';
  const product = products.find((p) => p.id === state.productOpen);
  if (!product) return '';
  const index = Math.min(state.productImageIndex, product.images.length - 1);

  return `
    <div class="image-lightbox" id="image-lightbox" role="dialog" aria-modal="true" aria-label="${product.name} photo">
      <button type="button" class="image-lightbox__close" id="image-lightbox-close" aria-label="Close">×</button>
      <img class="image-lightbox__image" src="${product.images[index]}" alt="${product.name}" />
    </div>
  `;
}
