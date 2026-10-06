// Per-page <title>, description and share image. Used at runtime (document
// title on navigation) and at build time by vite.config.js, which writes a
// static HTML file per route so crawlers and link previews (WhatsApp,
// Instagram, Google) see the right details without running JavaScript.
import { products } from './productsData.js';
import { parsePath } from './router.js';

export const SITE_NAME = 'Hitayu Ayurvedic Clinic & Wellness Center';
const DEFAULT_IMAGE = '/og-image.jpg';

const truncate = (text, max = 160) => (text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

const productNames = () => [...new Set(products.map((p) => p.name))];

export function metaForPath(pathname) {
  const { page, productId } = parsePath(pathname);
  const product = productId && products.find((p) => p.id === productId);
  if (product) {
    return {
      title: `${product.name} · Hitayu`,
      description: truncate(`${product.tagline}. ${product.description}`),
      image: product.images[0]
    };
  }
  switch (page) {
    case 'assessment':
      return {
        title: 'Prakriti Assessment — Know Your Dosha · Hitayu',
        description:
          'A free 33-question Ayurvedic Prakriti assessment: discover your Vata, Pitta and Kapha balance and print an A4 report. From Hitayu Ayurvedic Clinic & Wellness Center.',
        image: DEFAULT_IMAGE
      };
    case 'about':
      return {
        title: 'Dr. Hitesh Pant, Ayurvedic Physician (B.A.M.S.) · Hitayu',
        description:
          'Dr. Hitesh Pant — B.A.M.S. Ayurvedic physician treating chronic conditions, pain (Agnikarma, Viddhakarma), gut health and Marma therapy through classical Ayurveda.',
        image: DEFAULT_IMAGE
      };
    case 'treatments':
      return {
        title: 'Ayurvedic Treatments — Kati Basti, Nasya, Viddhakarma & more · Hitayu',
        description:
          'Classical Ayurvedic therapies at Hitayu: Kati, Janu and Hriday Basti, Nasya, Raktamokshan, Viddhakarma, Basti, Snehan & Swedan — planned after consultation.',
        image: DEFAULT_IMAGE
      };
    case 'products':
      return {
        title: 'Ayurvedic Products · Hitayu',
        description: truncate(`Classical Ayurvedic preparations crafted by a Vaidya: ${productNames().join(', ')}.`),
        image: products[0]?.images[0] || DEFAULT_IMAGE
      };
    case 'notfound':
      return {
        title: 'Page Not Found · Hitayu',
        description: `The page you were looking for isn't here. Visit ${SITE_NAME}.`,
        image: DEFAULT_IMAGE,
        noindex: true
      };
    default:
      return {
        title: `Hitayu · Ayurvedic Clinic & Wellness Center — Know Your Prakriti`,
        description: 'Discover your Ayurvedic mind-body constitution — a free Prakriti (dosha) assessment from Hitayu Ayurvedic Clinic & Wellness Center.',
        image: DEFAULT_IMAGE
      };
  }
}
