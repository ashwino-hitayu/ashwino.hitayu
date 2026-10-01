import { describe, it, expect } from 'vitest';
import { sections, totalQuestions } from './doshaData.js';
import { sanitizeAnswers, tallyAnswers, computePercents, computeVerdict } from './scoring.js';

const rowIds = sections.flatMap((s) => s.rows.map((r) => r.id));

// Builds an answers object from counts, e.g. answersFrom({ vata: 2, pitta: 1 })
function answersFrom(counts) {
  const answers = {};
  let i = 0;
  for (const [dosha, n] of Object.entries(counts)) {
    for (let j = 0; j < n; j++) answers[rowIds[i++]] = dosha;
  }
  return answers;
}

describe('questionnaire data', () => {
  it('has 33 questions with unique row ids', () => {
    expect(totalQuestions).toBe(33);
    expect(new Set(rowIds).size).toBe(rowIds.length);
  });

  it('gives every row an option for each dosha', () => {
    sections.forEach((s) => s.rows.forEach((r) => ['vata', 'pitta', 'kapha'].forEach((k) => expect(r[k], `${r.id}.${k}`).toBeTruthy())));
  });
});

describe('computePercents', () => {
  it('returns all zeros when nothing is answered', () => {
    expect(computePercents({ vata: 0, pitta: 0, kapha: 0 })).toEqual({ vata: 0, pitta: 0, kapha: 0 });
  });

  it('gives exact splits', () => {
    expect(computePercents({ vata: 2, pitta: 1, kapha: 1 })).toEqual({ vata: 50, pitta: 25, kapha: 25 });
    expect(computePercents({ vata: 0, pitta: 5, kapha: 0 })).toEqual({ vata: 0, pitta: 100, kapha: 0 });
  });

  it('always sums to exactly 100', () => {
    for (let v = 0; v <= totalQuestions; v++) {
      for (let p = 0; p <= totalQuestions - v; p++) {
        const k = totalQuestions - v - p;
        if (v + p + k === 0) continue;
        const pct = computePercents({ vata: v, pitta: p, kapha: k });
        expect(pct.vata + pct.pitta + pct.kapha, `${v}/${p}/${k}`).toBe(100);
      }
    }
  });

  it('rounds a three-way tie to 34/33/33', () => {
    expect(computePercents({ vata: 1, pitta: 1, kapha: 1 })).toEqual({ vata: 34, pitta: 33, kapha: 33 });
  });
});

describe('computeVerdict', () => {
  it('waits when nothing is answered', () => {
    const v = computeVerdict({}, totalQuestions);
    expect(v.verdictName).toBe('Your Scroll Awaits');
    expect(v.answered).toBe(0);
    expect(v.complete).toBe(false);
  });

  it('names a single leading dosha', () => {
    expect(computeVerdict(answersFrom({ vata: 3, pitta: 1, kapha: 1 }), totalQuestions).verdictName).toBe('Predominantly Vata');
    expect(computeVerdict(answersFrom({ kapha: 2, pitta: 1 }), totalQuestions).verdictName).toBe('Predominantly Kapha');
  });

  it('names a two-way tie as dual, in Vata–Pitta–Kapha order', () => {
    expect(computeVerdict(answersFrom({ pitta: 2, kapha: 2, vata: 1 }), totalQuestions).verdictName).toBe('A Dual Constitution: Pitta – Kapha');
  });

  it('names a three-way tie as tridoshic, not dual', () => {
    expect(computeVerdict(answersFrom({ vata: 11, pitta: 11, kapha: 11 }), totalQuestions).verdictName).toMatch(/^A Tridoshic Constitution/);
  });

  it('reports completion only when every question is answered', () => {
    expect(computeVerdict(answersFrom({ vata: 32 }), totalQuestions).complete).toBe(false);
    const full = computeVerdict(answersFrom({ vata: 20, pitta: 10, kapha: 3 }), totalQuestions);
    expect(full.complete).toBe(true);
    expect(full.totals).toEqual({ vata: 20, pitta: 10, kapha: 3 });
  });
});

describe('sanitizeAnswers / tallyAnswers', () => {
  it('drops unknown rows and invalid doshas', () => {
    expect(sanitizeAnswers({ 'old-id': 'vata', 'body-frame': 'bogus', sleep: 'kapha' })).toEqual({ sleep: 'kapha' });
  });

  it('survives corrupt saved data', () => {
    expect(sanitizeAnswers(null)).toEqual({});
    expect(sanitizeAnswers('text')).toEqual({});
    expect(sanitizeAnswers([1, 2])).toEqual({});
  });

  it('can tally just one section', () => {
    const answers = { 'body-frame': 'vata', hair: 'pitta', voice: 'kapha' };
    const physical = sections[0].rows.map((r) => r.id);
    expect(tallyAnswers(answers, physical)).toEqual({ vata: 1, pitta: 1, kapha: 0 });
  });
});
