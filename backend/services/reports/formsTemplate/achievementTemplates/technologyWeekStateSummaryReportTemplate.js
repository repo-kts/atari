const { resolveTechnologyWeekStateSummaryPayload } = require('../../../../repositories/reports/technologyWeekCelebrationReport/technologyWeekCelebrationReportRepository.js');

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
  .tw-sum-wrap { width:100%; font-size:6.5pt; line-height:1.15; }
  .tw-sum-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:avoid; }
  .tw-sum-tbl th, .tw-sum-tbl td { border:0.35pt solid #000; padding:3px 5px; vertical-align:middle; }
  .tw-sum-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .tw-sum-tbl .l { text-align:left; }
  .tw-sum-tbl .num { text-align:left; }
`;
}

function renderTechnologyWeekStateSummaryReportSection(section, data, sectionId, isFirstSection) {
  const payload = resolveTechnologyWeekStateSummaryPayload(data);
  const summaryRows = payload.rows || [];
  const y = payload.yearLabel || '';

  if (!summaryRows.length) {
    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No technology week celebration data for this period.</p>
</div>`;
  }

  const body = summaryRows.map((r) => `
      <tr>
        <td class="l">${esc(r.stateName)}</td>
        <td class="num">${fmtInt(r.noOfKvks)}</td>
        <td class="num">${fmtInt(r.milletActivities)}</td>
        <td class="num">${fmtInt(r.participants)}</td>
      </tr>`).join('');

  return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="tw-sum-wrap">
    <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
    <p style="font-size:6pt; margin:4px 0 8px 0;">${esc(`(Reporting year ${y})`)}</p>
    <table class="tw-sum-tbl">
      <thead>
        <tr>
          <th class="l">States</th>
          <th>No. of KVKs</th>
          <th>Number of Millet Activities</th>
          <th>Number of participants</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
  renderTechnologyWeekStateSummaryReportSection,
};
