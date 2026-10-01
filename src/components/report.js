// The printable/exportable A4 report overlay — rendered as a sibling of
// `.page` (see main.js) so print mode can hide the app shell without
// taking the report down with it.
import { doshas, totalQuestions } from '../doshaData.js';
import { state, doshaKeys, escapeHtml, computeVerdict, computePercents } from '../state.js';
import { peepalEmblem, whatsappLink } from '../icons.js';

export function renderReportOverlay() {
  const { totals, answered, complete, verdictName, verdictDesc } = computeVerdict();
  const pct = computePercents(totals);
  const p = state.profile;
  const genderLabel = { female: 'Female', male: 'Male', other: 'Other', 'prefer-not-to-say': 'Prefer not to say' }[p.gender] || '—';
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="report-overlay ${state.reportOpen ? 'report-overlay--open' : ''}" id="report-overlay" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div class="report-overlay__toolbar no-print">
        <button type="button" class="btn" id="close-report-btn">Close</button>
        <button type="button" class="btn btn--primary" id="print-report-btn">Print / Save as PDF</button>
      </div>
      <article class="report-page">
        <div class="report-page__header">
          <div class="report-page__emblem" aria-hidden="true">${peepalEmblem()}</div>
          <div class="report-page__clinic">
            <p class="report-page__clinic-name">Hitayu Ayurvedic Clinic &amp; Wellness Center</p>
            <p class="report-page__clinic-sub">Rooted in Tradition · Grown for Your Wellbeing</p>
          </div>
          <div class="report-page__doctitle">Assessment Date<br />${dateStr}</div>
        </div>

        <h1 class="report-page__title" id="report-title">Prakriti Assessment Report</h1>

        <div class="report-page__patient">
          <div><strong>Name</strong>${p.name ? escapeHtml(p.name) : '—'}</div>
          <div><strong>Age</strong>${p.age ? escapeHtml(p.age) : '—'}</div>
          <div><strong>Sex / Gender</strong>${genderLabel}</div>
        </div>

        <p class="report-page__result-heading">Your Prakriti</p>
        <h2 class="report-page__result-title">${verdictName}</h2>

        <div class="report-page__bars">
          ${doshaKeys
            .map(
              (k) => `
            <div class="result__percent-row result__percent-row--${k}">
              <span class="result__percent-label">${doshas[k].name}</span>
              <div class="result__percent-track">
                <div class="result__percent-fill result__percent-fill--${k}" style="width:${pct[k]}%"></div>
              </div>
              <span class="result__percent-value">${pct[k]}%</span>
            </div>`
            )
            .join('')}
        </div>

        <p class="report-page__interp">
          ${verdictDesc}
          ${complete ? '' : ` This reading reflects ${answered} of ${totalQuestions} traits answered at the time of printing.`}
          This assessment offers self-understanding for educational purposes and is not a medical diagnosis.
        </p>

        <div class="report-page__cta">
          <p class="report-page__cta-q">Want to understand your Prakriti in greater depth?</p>
          <ul>
            <li>Lifestyle guidance</li>
            <li>Food habits</li>
            <li>Daily routine (Dinacharya)</li>
            <li>Seasonal routine (Ritucharya)</li>
            <li>Individual Ayurvedic recommendations</li>
            <li>Prakriti–Vikriti assessment</li>
          </ul>
          <p class="report-page__cta-consult">For detailed guidance on the above, please consult<br /><strong>Dr. Hitesh Pant</strong>Hitayu Ayurvedic Clinic &amp; Wellness Center</p>
          <div class="report-page__whatsapp">
            <img src="/whatsapp-qr.png" alt="Scan to chat with Hitayu on WhatsApp" class="report-page__whatsapp-qr"${state.page === 'assessment' ? '' : ' loading="lazy"'} />
            <p class="report-page__whatsapp-text">Scan to chat with us on WhatsApp<br /><span>${whatsappLink}</span></p>
          </div>
        </div>

        <div class="report-page__footer">
          <p class="report-page__footer-name">Hitayu — Ayurvedic Clinic &amp; Wellness Center</p>
          <p class="report-page__footer-line">Rooted in tradition. Grown for your wellbeing.</p>
          <p class="report-page__disclaimer">This assessment is intended for educational / self-understanding purposes and does not replace an individual professional Ayurvedic consultation. If you have chest pain, breathlessness, high fever, bleeding or sudden weakness, seek emergency medical care. Please don’t stop or change any prescribed medicine based on this assessment.</p>
        </div>
      </article>
    </div>
  `;
}
