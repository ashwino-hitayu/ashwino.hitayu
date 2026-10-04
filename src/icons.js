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

export const whatsappIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.7 8.3c.3-.6.6-.6.9-.6h.4c.2 0 .4 0 .6.4s.6 1.5.7 1.6c.1.1.1.3 0 .5s-.2.3-.3.4-.3.3-.1.6c.2.3.8 1.1 1.6 1.8 1 .9 1.8 1.1 2.1 1.3.3.1.5.1.6-.1.2-.2.6-.7.8-1 .2-.3.4-.2.6-.1l1.5.7c.2.1.4.2.4.3.1.2.1.9-.2 1.4-.4.6-1.4 1-2 1-.5 0-1.3 0-2.1-.5-1.5-.6-2.9-1.8-4-3.3-.6-.9-1-1.7-1.1-2.1-.1-.4-.3-1.2 0-1.8Z" fill="currentColor"/></svg>`;
export const whatsappLink = 'https://wa.me/message/IG7NATE62RMJB1';

export const consultMessage = "Hi, I'm interested in getting a consultation. Could you please help me book one?";
export const productMessage = (name) => `Hi, I'm interested in ${name}. Could you please share more details?`;
export const treatmentMessage = (name) => `Hi, I'd like to know more about ${name} therapy. Could you please share details and availability?`;

// Pre-filled messages need the clinic's number (the short link above ignores
// ?text=), but the number is deliberately never written into the page: links
// keep the short link as their href, so hovering or copying a link doesn't
// reveal it, and only a click on a WhatsApp button builds the
// wa.me/<number>?text=… URL (see main.js). It's stored encoded (base64 of the
// reversed digits) so bots scanning the site's JS for phone numbers miss it.
const WHATSAPP_ENCODED = 'NTQ2MzUxNzEwNzE5';

export function whatsappMessageUrl(message) {
  const number = [...atob(WHATSAPP_ENCODED)].reverse().join('');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Attributes for a WhatsApp chat link: the short link as href (also what a
// new-tab click or "copy link" gets) + the message to pre-fill on click.
export function whatsappLinkAttrs(message) {
  return `href="${whatsappLink}" data-wa-message="${escapeAttr(message)}"`;
}

export const instagramIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>`;
export const instagramLink = 'https://www.instagram.com/hitayu_wellness?stkn=cmhlMmsyZGlqMnJ4';

export const youtubeIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8A27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 9.3v5.4l4.6-2.7L10 9.3Z" fill="currentColor"/></svg>`;
export const youtubeLink = 'https://www.youtube.com/@healerphoenix';

export const menuIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;
export const closeIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;

export const chevronLeftIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const chevronRightIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m9.5 6 6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// The Hitayu peepal emblem — the gold tree/lotus mark cut out of the official
// logo artwork (design/hitayu-logo-source.jpeg) along its gold edge, so no
// pale halo shows on dark backgrounds (copy: design/hitayu-logo.png); served as WebP.
// Reused at hero scale and at report-header scale.
export function peepalEmblem() {
  return `<img src="/hitayu-logo.webp" alt="Hitayu peepal tree emblem" width="450" height="328" />`;
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
