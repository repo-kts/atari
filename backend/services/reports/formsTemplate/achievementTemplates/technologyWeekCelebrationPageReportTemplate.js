const { resolveTechnologyWeekPagePayload } = require('../../../../repositories/reports/technologyWeekCelebrationReport/technologyWeekCelebrationReportRepository.js');

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return String(Math.round(n));
}

function tableCss() {
    return `
  .tw-page-wrap { width:100%; font-size:5.5pt; line-height:1.15; }
  .tw-page-sec { font-size:8pt; font-weight:bold; margin:0 0 6px 0; }
  .tw-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .tw-page-tbl th, .tw-page-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; }
  .tw-page-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .tw-page-tbl .l { text-align:left; }
  .tw-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function cells15(r) {
    return [
        fmtInt(r.genM), fmtInt(r.genF), fmtInt(r.genT),
        fmtInt(r.obcM), fmtInt(r.obcF), fmtInt(r.obcT),
        fmtInt(r.scM), fmtInt(r.scF), fmtInt(r.scT),
        fmtInt(r.stM), fmtInt(r.stF), fmtInt(r.stT),
        fmtInt(r.totalM), fmtInt(r.totalF), fmtInt(r.totalT),
    ];
}

function renderTechnologyWeekCelebrationPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveTechnologyWeekPagePayload(data);
    const rows = payload.rows || [];
    const y = payload.yearLabel || '';

    if (rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No technology week celebration data for export.</p>
</div>`;
    }

    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.typeOfActivities)}</td>
        <td>${fmtInt(r.numberOfActivities)}</td>
        ${cells15(r).map((c) => `<td>${c}</td>`).join('')}
        <td class="l">${esc(r.relatedTechnology)}</td>
      </tr>`).join('');

    const gt = payload.grandTotal || {};
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc(gt.typeOfActivities || 'Total')}</td>
        <td>${fmtInt(gt.numberOfActivities)}</td>
        ${cells15(gt).map((c) => `<td>${c}</td>`).join('')}
        <td class="l">${esc(gt.relatedTechnology)}</td>
      </tr>`;

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="tw-page-wrap">
    <div class="tw-page-sec">Technology week celebration${y ? ` — year ${esc(y)}` : ''}</div>
    <table class="tw-page-tbl">
      <thead>
        <tr>
          <th rowspan="3" class="l">Type of activities</th>
          <th rowspan="3">No. of activities</th>
          <th colspan="15">Number of participants</th>
          <th rowspan="3" class="l">Related crop/livestock technology</th>
        </tr>
        <tr>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
          <th colspan="3">Total</th>
        </tr>
        <tr>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
        </tr>
      </thead>
      <tbody>${body}${grandRow}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderTechnologyWeekCelebrationPageReportSection,
};
