// Trial Hindi translation. English stays the source text everywhere: the
// components wrap it in tr(), which looks it up in hindi.js while Hindi is
// selected and falls back to the English when a line has no translation yet.
// The printed report and the result message sent to the doctor stay English.
import { state } from './state.js';
import { hindi } from './hindi.js';

// tr('{n} / {total} answered', { n, total }) — {placeholders} are filled in
// after the lookup, so the key is the same in both languages.
export function tr(text, vars) {
  const out = state.lang === 'hi' ? (hindi[text] ?? text) : text;
  return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : out;
}
