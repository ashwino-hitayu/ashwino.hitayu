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
  }
];
