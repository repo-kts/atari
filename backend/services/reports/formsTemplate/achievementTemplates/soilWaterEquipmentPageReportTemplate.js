const { resolveSoilWaterEquipmentPagePayload } = require('../../../../repositories/reports/soilWaterEquipmentReport/soilWaterEquipmentReportRepository.js');

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
  .swe-page-wrap { width:100%; font-size:8pt; line-height:1.15; }
  .swe-page-title { font-size:9pt; font-weight:bold; margin:0 0 4px 0; text-transform:uppercase; }
  .swe-page-sub { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .swe-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .swe-page-tbl th, .swe-page-tbl td { border:0.35pt solid #000; padding:3px 4px; vertical-align:middle; }
  .swe-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .swe-page-tbl .c { text-align:center; }
  .swe-page-tbl .l { text-align:left; }
  .swe-page-tbl .muted { color:#444; font-size:7pt; }
`;
}

function renderSoilWaterEquipmentPageReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
  const isAgg = Boolean(reportContext.isAggregatedReport);
  const payload = resolveSoilWaterEquipmentPagePayload(data, { isAggregatedReport: isAgg });
  const rows = payload.rows || [];
  const y = payload.yearLabel || '';

  if (rows.length === 0) {
    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data found</p>
</div>`;
  }

  const body = isAgg
    ? rows.map((r) => `
      <tr>
        <td class="c">${fmtInt(r.sl)}</td>
        <td class="l">${esc(r.stateName)}</td>
        <td class="l">${esc(r.kvkName)}</td>
        <td class="l">${esc(r.name)}</td>
        <td class="c">${fmtInt(r.qty)}</td>
      </tr>`).join('')
    : rows.map((r) => `
      <tr>
        <td class="c">${fmtInt(r.sl)}</td>
        <td class="l">${esc(r.name)}</td>
        <td class="c">${fmtInt(r.qty)}</td>
      </tr>`).join('');

  const head = isAgg
    ? `<tr>
<th class="c">Sl.</th>
<th class="l">State</th>
<th class="l">KVK</th>
<th class="l">Name of the Equipment</th>
<th class="c">Qty</th>
</tr>`
    : `<tr>
    <th class="c">Sl.</th>
<th class="l">Name of the Equipment</th>
<th class="c">Qty</th>
</tr>`;

  return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="swe-page-wrap">
    <div class="swe-page-title">7. SOIL &amp; WATER TESTING</div>
    <div class="swe-page-sub">A. Details of equipment available in Soil and Water Testing Laboratory.</div>
    ${y ? `<div class="muted">Reporting year ${esc(y)}</div>` : ''}
    <table class="swe-page-tbl">
      <thead>${head}</thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
  renderSoilWaterEquipmentPageReportSection,
};
