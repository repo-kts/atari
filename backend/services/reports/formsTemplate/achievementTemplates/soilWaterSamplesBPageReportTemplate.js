const { resolveSoilWaterSamplesBPayload } = require('../../../../repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js');

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '0';
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return String(Math.round(n));
}

function tableCss() {
    return `
  .swb-wrap { width:100%; font-size:8pt; line-height:1.15; }
  .swb-title { font-size:9pt; font-weight:bold; margin:0 0 4px 0; text-transform:uppercase; }
  .swb-sub { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .swb-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .swb-tbl th, .swb-tbl td { border:0.35pt solid #000; padding:4px 6px; vertical-align:middle; }
  .swb-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .swb-tbl .l { text-align:left; }
  .swb-tbl .c { text-align:center; }
  .swb-tbl .muted { color:#444; font-size:7pt; }
`;
}

function renderSoilWaterSamplesBPageReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const isAgg = Boolean(reportContext.isAggregatedReport);
    const payload = resolveSoilWaterSamplesBPayload(data, { isAggregatedReport: isAgg });
    const y = payload.yearLabel || '';

    if (!payload.hasData || !payload.rows || payload.rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data found</p>
</div>`;
    }

    const rows = payload.rows;
    const body = isAgg
        ? rows.map((r) => `
      <tr>
        <td class="l">${esc(r.stateName)}</td>
        <td class="c">${fmtInt(r.mini)}</td>
        <td class="c">${fmtInt(r.lab)}</td>
        <td class="c">${fmtInt(r.total)}</td>
      </tr>`).join('')
        : rows.map((r) => `
      <tr>
        <td class="c">${fmtInt(r.mini)}</td>
        <td class="c">${fmtInt(r.lab)}</td>
        <td class="c">${fmtInt(r.total)}</td>
      </tr>`).join('');

    const head = isAgg
        ? `<tr>
<th class="l">State</th>
<th class="c">Through mini soil testing kit/labs</th>
<th class="c">Through soil testing laboratory</th>
<th class="c">Total</th>
</tr>`
        : `<tr>
<th class="c">Through mini soil testing kit/labs</th>
<th class="c">Through soil testing laboratory</th>
<th class="c">Total</th>
</tr>`;

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="swb-wrap">
    <div class="swb-title">7. SOIL &amp; WATER TESTING</div>
    <div class="swb-sub">b. Details of samples analyzed so far</div>
    ${y ? `<div class="muted">Reporting year ${esc(y)}</div>` : ''}
    <table class="swb-tbl">
      <thead>
        <tr>
          <th colspan="${isAgg ? 4 : 3}" class="c">Total number of soil samples analyzed till now</th>
        </tr>
        ${head}
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderSoilWaterSamplesBPageReportSection,
};
