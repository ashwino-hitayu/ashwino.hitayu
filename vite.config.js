import { defineConfig } from 'vite';
import { allPaths } from './src/router.js';
import { metaForPath, SITE_NAME } from './src/seo.js';

// SITE_URL is the live address, e.g.  SITE_URL=https://hitayu.in npm run build
// Link-preview crawlers (WhatsApp, Facebook…) need absolute URLs, and the
// sitemap / canonical links need it too.
const siteUrl = () => (process.env.SITE_URL || '').replace(/\/+$/, '');

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fillPage(template, pathname) {
  const url = siteUrl();
  const meta = metaForPath(pathname);
  const jsonLd = url
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic',
        name: SITE_NAME,
        url: `${url}/`,
        logo: `${url}/apple-touch-icon.png`,
        image: `${url}/og-image.jpg`,
        medicalSpecialty: 'Ayurveda',
        sameAs: ['https://www.instagram.com/hitayu_wellness', 'https://www.youtube.com/@healerphoenix']
      })}</script>`
    : '';
  if (meta.noindex) {
    template = template.replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex" />');
    pathname = '/';
  }
  return template
    .replaceAll('__TITLE__', escapeAttr(meta.title))
    .replaceAll('__DESCRIPTION__', escapeAttr(meta.description))
    .replaceAll('__URL__', escapeAttr(url + pathname))
    .replaceAll('__IMAGE__', escapeAttr(url + meta.image))
    .replace('__JSONLD__', jsonLd);
}

// Writes dist/<route>/index.html for every route (each with its own title,
// description and preview image), plus 404.html, robots.txt and — when
// SITE_URL is set — sitemap.xml. Works on any static host, no rewrites needed.
function seoPages() {
  return {
    name: 'seo-pages',
    enforce: 'post',
    transformIndexHtml: {
      order: 'pre',
      // dev server: one index.html for every path; the app sets the title itself
      handler: (html, ctx) => (ctx.server ? fillPage(html, '/') : html)
    },
    generateBundle(_, bundle) {
      const index = bundle['index.html'];
      const template = String(index.source);
      const url = siteUrl();
      if (!url) {
        this.warn('SITE_URL is not set — link previews will have no image and no sitemap is generated. e.g. SITE_URL=https://example.com npm run build');
      }
      index.source = fillPage(template, '/');
      for (const path of allPaths().filter((p) => p !== '/')) {
        this.emitFile({ type: 'asset', fileName: `${path.slice(1)}/index.html`, source: fillPage(template, path) });
      }
      this.emitFile({ type: 'asset', fileName: '404.html', source: fillPage(template, '/__not-found__') });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${url ? `\nSitemap: ${url}/sitemap.xml\n` : ''}` });
      if (url) {
        const urls = allPaths().map((p) => `  <url><loc>${url}${p}</loc></url>`).join('\n');
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      }
    }
  };
}

export default defineConfig({
  root: '.',
  plugins: [seoPages()],
  server: {
    port: 5173,
    open: true
  }
});
