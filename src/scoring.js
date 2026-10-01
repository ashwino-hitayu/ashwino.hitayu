// Pure scoring logic — no DOM, no localStorage — so it can be unit-tested
// (see scoring.test.js). state.js wraps these with the live app state.
import { doshas, sections } from './doshaData.js';

export const doshaKeys = ['vata', 'pitta', 'kapha'];

const validRowIds = new Set(sections.flatMap((s) => s.rows.map((r) => r.id)));

// Keeps only current row ids mapped to a dosha — e.g. drops answers saved
// against a row id that has since been renamed/removed, which would
// otherwise still count toward the totals and the "answered" progress.
export function sanitizeAnswers(parsed) {
  const answers = {};
  if (parsed && typeof parsed === 'object') {
    Object.entries(parsed).forEach(([id, d]) => {
      if (validRowIds.has(id) && doshaKeys.includes(d)) answers[id] = d;
    });
  }
  return answers;
}

export function tallyAnswers(answers, rowIds = null) {
  const totals = { vata: 0, pitta: 0, kapha: 0 };
  const ids = rowIds || Object.keys(answers);
  ids.forEach((id) => {
    const d = answers[id];
    if (d && totals[d] !== undefined) totals[d] += 1;
  });
  return totals;
}

// Largest-remainder rounding, so the three whole-number percents always sum
// to exactly 100 (independent Math.round gives e.g. 33/33/33 = 99).
export function computePercents(totals) {
  const sum = totals.vata + totals.pitta + totals.kapha;
  if (!sum) return { vata: 0, pitta: 0, kapha: 0 };
  const exact = doshaKeys.map((k) => (totals[k] / sum) * 100);
  const pct = exact.map(Math.floor);
  let remainder = 100 - pct.reduce((a, b) => a + b, 0);
  const byFraction = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
  for (let j = 0; remainder > 0; j++, remainder--) pct[byFraction[j][1]] += 1;
  return { vata: pct[0], pitta: pct[1], kapha: pct[2] };
}

const doshaDescriptions = {
  vata: 'Governed by air and ether — quick, creative and ever-moving. When in balance, Vata brings vitality and imagination; out of balance, it brings anxiety and depletion. Favour warmth, routine and rest.',
  pitta: 'Governed by fire and water — sharp, driven and transformative. When in balance, Pitta brings clarity and leadership; out of balance, it brings heat, irritability and inflammation. Favour coolness and moderation.',
  kapha: 'Governed by earth and water — steady, grounded and enduring. When in balance, Kapha brings calm and strength; out of balance, it brings heaviness and stagnation. Favour movement and stimulation.'
};

export function computeVerdict(answers, totalQuestions) {
  const totals = tallyAnswers(answers);
  const answered = Object.keys(answers).length;
  const complete = answered === totalQuestions;
  const max = Math.max(totals.vata, totals.pitta, totals.kapha);
  const leaders = doshaKeys.filter((k) => totals[k] === max && max > 0);
  let verdictName = '';
  let verdictDesc = '';

  if (max === 0) {
    verdictName = 'Your Scroll Awaits';
    verdictDesc = 'Begin answering above, and your natural constitution will slowly reveal itself here.';
  } else if (leaders.length === 1) {
    const k = leaders[0];
    verdictName = `Predominantly ${doshas[k].name}`;
    verdictDesc = doshaDescriptions[k];
  } else if (leaders.length === 3) {
    verdictName = 'A Tridoshic Constitution: Vata – Pitta – Kapha';
    verdictDesc = 'Your traits are spread evenly across all three doshas — a balanced combination of Vata, Pitta and Kapha, and entirely natural.';
  } else {
    const names = leaders.map((k) => doshas[k].name).join(' – ');
    verdictName = `A Dual Constitution: ${names}`;
    verdictDesc = 'Your traits are balanced between two doshas — a combination constitution, common and entirely natural.';
  }

  return { totals, answered, complete, verdictName, verdictDesc };
}
