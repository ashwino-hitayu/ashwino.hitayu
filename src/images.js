// Responsive image attributes. `npm run images` writes imageSizes.json with
// each photo's width and its 500px copy; srcset + sizes let phones fetch the
// small copy while larger screens keep the full one.
import imageSizes from './imageSizes.json';

// How wide each kind of image is drawn on the page (see style.css).
export const SIZES = {
  productTile: '(min-width: 960px) 270px, (min-width: 640px) 33vw, 50vw',
  productPopup: '(min-width: 560px) 520px, 100vw',
  productThumb: '46px',
  treatmentCard: '(min-width: 960px) 370px, (min-width: 640px) 50vw, 100vw'
};

// srcset for a photo, or '' when there's no smaller copy.
export function srcsetFor(src) {
  const info = imageSizes[src];
  return info?.small ? `${info.small} 500w, ${src} ${info.width}w` : '';
}

// ` srcset="…" sizes="…"` ready to drop into an <img> tag ('' if none).
// `lazyAttr` = true writes data-srcset instead, for images whose download is
// deferred until first use (see warmProductTile).
export function responsiveAttrs(src, sizes, lazyAttr = false) {
  const set = srcsetFor(src);
  if (!set) return '';
  return ` ${lazyAttr ? 'data-srcset' : 'srcset'}="${set}" sizes="${sizes}"`;
}
