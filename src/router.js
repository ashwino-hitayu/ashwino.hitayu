// Clean-URL routing (History API):
//   /                home
//   /assessment      Prakriti assessment
//   /about           about the doctor
//   /products        product listing
//   /products/:id    listing with that product's popup open — shareable
// Anything else renders the not-found page. Pure functions only (no DOM), so
// vite.config.js can reuse them to emit a static HTML file per route.
import { products } from './productsData.js';

export const PAGES = ['home', 'assessment', 'about', 'products'];

export function pathFor(page, productId = null) {
  if (page === 'products' && productId) return `/products/${encodeURIComponent(productId)}`;
  return page === 'home' ? '/' : `/${page}`;
}

export function parsePath(pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { page: 'home', productId: null };
  if (parts.length === 1 && PAGES.includes(parts[0]) && parts[0] !== 'home') return { page: parts[0], productId: null };
  if (parts.length === 2 && parts[0] === 'products' && products.some((p) => p.id === parts[1])) {
    return { page: 'products', productId: parts[1] };
  }
  return { page: 'notfound', productId: null };
}

// Old links used hash routes (#about); map them onto the clean paths.
export function legacyHashPath(hash) {
  const page = (hash || '').replace(/^#\/?/, '');
  return PAGES.includes(page) ? pathFor(page) : null;
}

// Every URL worth pre-rendering / listing in the sitemap.
export function allPaths() {
  const ids = [...new Set(products.map((p) => p.id))];
  return [...PAGES.map((p) => pathFor(p)), ...ids.map((id) => pathFor('products', id))];
}
