import { describe, it, expect } from 'vitest';
import { parsePath, pathFor, legacyHashPath, allPaths, SHOW_TREATMENTS } from './router.js';
import { metaForPath } from './seo.js';
import { products } from './productsData.js';

const productId = products[0].id;

describe('router', () => {
  it('maps paths to pages', () => {
    expect(parsePath('/')).toEqual({ page: 'home', productId: null });
    expect(parsePath('/assessment')).toEqual({ page: 'assessment', productId: null });
    expect(parsePath('/about/')).toEqual({ page: 'about', productId: null });
    expect(parsePath('/treatments').page).toBe(SHOW_TREATMENTS ? 'treatments' : 'notfound');
    expect(parsePath('/products')).toEqual({ page: 'products', productId: null });
    expect(parsePath(`/products/${productId}`)).toEqual({ page: 'products', productId });
  });

  it('sends unknown paths to not-found', () => {
    for (const p of ['/home', '/products/does-not-exist', '/about/extra', '/random']) {
      expect(parsePath(p).page, p).toBe('notfound');
    }
  });

  it('round-trips pathFor -> parsePath', () => {
    for (const page of ['home', 'assessment', 'about', ...(SHOW_TREATMENTS ? ['treatments'] : []), 'products'])
      expect(parsePath(pathFor(page)).page).toBe(page);
    expect(parsePath(pathFor('products', productId)).productId).toBe(productId);
  });

  it('maps old hash links to clean paths', () => {
    expect(legacyHashPath('#assessment')).toBe('/assessment');
    expect(legacyHashPath('#home')).toBe('/');
    expect(legacyHashPath('#nope')).toBe(null);
    expect(legacyHashPath('')).toBe(null);
  });

  it('lists every page and product once', () => {
    const paths = allPaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain(`/products/${productId}`);
  });
});

describe('seo', () => {
  it('gives every route its own title and a description under ~160 chars', () => {
    const titles = allPaths().map((p) => metaForPath(p).title);
    expect(new Set(titles).size).toBe(titles.length);
    allPaths().forEach((p) => expect(metaForPath(p).description.length, p).toBeLessThanOrEqual(170));
  });

  it('marks the not-found page noindex', () => {
    expect(metaForPath('/nope').noindex).toBe(true);
  });
});
