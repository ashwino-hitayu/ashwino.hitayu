// Small SVG icon strings and the per-dosha popup copy — pure presentation
// assets with no dependency on app state, kept separate so component
// modules don't need to import icons from each other.

export const doshaIcons = {
  vata: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 20c4-6 10-9 16-6 4 2 5 6 2 8-3 2-7 0-6-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 28c6-4 14-5 20-1 5 3 7 8 3 11-4 3-9 0-8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 36c5-2 11-2 16 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  pitta: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6c3 6-2 8-2 13 0 3 2 5 5 5 2.5 0 4-1.5 4.5-3.5C33 25 34 30 30 35c-3.5 3.5-9 4-13 1-4.5-3.5-6-9.5-3-15 1.5-3 4-4.5 4-7.5 0-2.5-1.5-4-1-7.5.5-3 3.5-5.5 7-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  kapha: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8c8 4 14 11 14 19a14 14 0 1 1-28 0c0-8 6-15 14-19z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M24 22v14M18 27h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

export const sunIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
export const moonIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

// The Hitayu peepal emblem — the gold tree/lotus mark cropped from the
// official logo artwork (public/hitayu-logo.png), background removed.
// Reused at hero scale and at report-header scale.
export function peepalEmblem() {
  return `<img src="/hitayu-logo.png" alt="Hitayu peepal tree emblem" />`;
}

// Plain-language explanations for the dosha info popup — kept separate from
// the more technical doshaDescriptions used in the result/report copy.
export const doshaSimpleInfo = {
  vata: {
    title: 'Vata — Air & Ether',
    text: 'Vata is the energy of movement. It controls things like breathing, blood flow, blinking, and your thoughts. People with more Vata tend to be quick, creative, and full of ideas — but can become anxious, restless, or tired if it builds up too much. Think of Vata as the wind: light, quick, and always moving.'
  },
  pitta: {
    title: 'Pitta — Fire & Water',
    text: 'Pitta is the energy of transformation. It controls digestion, metabolism, and how your body turns food into energy. People with more Pitta are often sharp, focused, and natural leaders — but can become irritable, impatient, or overheated when out of balance. Think of Pitta as fire: hot, intense, and transformative.'
  },
  kapha: {
    title: 'Kapha — Earth & Water',
    text: 'Kapha is the energy of structure and stability. It gives the body its form, strength, and immunity. People with more Kapha tend to be calm, caring, and steady — but can become sluggish, heavy, or resistant to change when out of balance. Think of Kapha as earth: solid, grounded, and enduring.'
  }
};
