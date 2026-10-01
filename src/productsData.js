// Product catalog for the Products page. Add future items to this array —
// the page renders whatever's here, and falls back to an empty state when
// the list is empty.
export const products = [
  {
    id: 'swarna-prashan',
    name: 'Swarna Prashan',
    images: [
      '/products/swarna-prashan-2.jpg',
      '/products/swarna-prashan-3.jpg',
      '/products/swarna-prashan-1.jpg',
      '/products/swarna-prashan-4.jpg'
    ],
    tagline: 'Traditional purity, now in amber glass',
    description:
      'A classical Ayurvedic formulation for children (birth to 16 years), prepared by qualified Vaidyas with Brahmi, Vacha, Shankhpushpi, Jatamansi, honey, clarified butter (ghee) and Swarna Bhasma.',
    benefits: ['Enhances memory & focus', 'Supercharges immunity', 'Promotes physical growth', 'Improves digestion & appetite']
  },
  {
    id: 'shatdhaut-ghrit',
    name: 'Shatdhaut Ghrit Cream',
    images: [
      '/products/shatdhaut-ghrit-1.jpeg',
      '/products/shatdhaut-ghrit-2.jpeg',
      '/products/shatdhaut-ghrit-3.jpeg',
      '/products/shatdhaut-ghrit-4.jpeg',
      '/products/shatdhaut-ghrit-5.jpeg'
    ],
    tagline: 'Hundred-times-washed ghee, enriched with saffron & rose',
    description:
      'A classical Ayurvedic preparation — cow’s ghee washed a hundred times with water until light and frothy (Shatadhauta Ghrita) — enriched with Keshar (saffron), Yastimadhu (licorice) and Rose. Crafted by a Vaidya from just two base ingredients, free from preservatives and harsh chemicals, gentle enough for a child’s delicate skin.',
    benefits: ['Deeply nourishes & softens skin', 'Gentle enough for a baby’s skin', 'Soothes and calms irritation', 'Doubles as natural sun protection']
  },
  {
    id: 'ojas-mukh-lepa',
    name: 'Ojas Mukh Lepa',
    images: [
      '/products/ojas-mukh-lepa-1.jpg',
      '/products/ojas-mukh-lepa-2.jpg',
      '/products/ojas-mukh-lepa-3.jpg',
      '/products/ojas-mukh-lepa-4.jpg'
    ],
    tagline: 'Sun-dried skin radiance — a traditional Ayurvedic face pack',
    description:
      'A traditional face pack (Mukha Lepa) crafted by a Vaidya from rose petals, Yashtimadhu, Multani Mitti & Gopi Chandan, finely ground Masoor Dal, Neem and Turmeric — 100% plant and clay based, with no preservatives or artificial perfumes. <br> To use: mix 1 teaspoon with rose water, plain water or raw milk into a smooth paste, apply evenly over a clean face (avoiding the eyes), leave for 10–12 minutes until partly dry, then massage gently in upward circles and rinse with cold water.',
    benefits: ['100% pure & herbal', 'Deep pore cleansing', 'Brightens dull skin & evens tone', 'Calms & refreshes skin']
  }
];
