const { resolveSoilWaterAnalysisStatePayload } = require('../../../../repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js');

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
  .swd-wrap { width:100%; font-size:7.5pt; line-height:1.12; }
  .swd-title { font-size:9pt; font-weight:bold; margin:0 0 4px 0; }
  .swd-sub { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .swd-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .swd-tbl th, .swd-tbl td { border:0.35pt solid #000; padding:3px 4px; vertical-align:middle; }
  .swd-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .swd-tbl .c { text-align:center; }
  .swd-tbl .l { text-align:left; }
  .swd-tbl .total-row td { font-weight:bold; }
  .swd-tbl .grand-row td { font-weight:bold; background:#f0f0f0; }
  .swd-tbl .muted { color:#444; font-size:7pt; }
`;
}

function renderSoilWaterAnalysisDetailStateReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const payload = resolveSoilWaterAnalysisStatePayload(data, {});
    const y = payload.yearLabel || '';
    const blocks = payload.stateBlocks || [];
    const grand = payload.grandTotal || { samples: 0, villages: 0, farmers: 0 };

    if (!blocks.length) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data found</p>
</div>`;
    }

    const catRowsPerState = 7;
    const rowspan = catRowsPerState + 1;

    let body = '';
    for (const block of blocks) {
        const { stateName, rows, stateTotal } = block;
        body += `<tr>
  <td class="l" rowspan="${rowspan}">${esc(stateName)}</td>
  <td class="l">${esc(rows[0].category)}</td>
  <td class="c">${fmtInt(rows[0].samples)}</td>
  <td class="c">${fmtInt(rows[0].villages)}</td>
  <td class="c">${fmtInt(rows[0].farmers)}</td>
</tr>`;
        for (let i = 1; i < rows.length; i += 1) {
            const rr = rows[i];
            body += `<tr>
  <td class="l">${esc(rr.category)}</td>
  <td class="c">${fmtInt(rr.samples)}</td>
  <td class="c">${fmtInt(rr.villages)}</td>
  <td class="c">${fmtInt(rr.farmers)}</td>
</tr>`;
        }
        body += `<tr class="total-row">
  <td class="l">Total (${esc(stateName)})</td>
  <td class="c">${fmtInt(stateTotal.samples)}</td>
  <td class="c">${fmtInt(stateTotal.villages)}</td>
  <td class="c">${fmtInt(stateTotal.farmers)}</td>
</tr>`;
    }

    body += `<tr class="grand-row">
  <td class="l" colspan="2">Grand Total</td>
  <td class="c">${fmtInt(grand.samples)}</td>
  <td class="c">${fmtInt(grand.villages)}</td>
  <td class="c">${fmtInt(grand.farmers)}</td>
</tr>`;

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="swd-wrap">
    <div class="swd-title">7. SOIL &amp; WATER TESTING</div>
    <div class="swd-sub">2.7. Detail of Soil, Water and Plant analysis</div>
    ${y ? `<div class="muted">Reporting year ${esc(y)}</div>` : ''}
    <table class="swd-tbl">
      <thead>
        <tr>
          <th class="l">State</th>
          <th class="l">Analysis</th>
          <th class="c">No. of Samples analyzed</th>
          <th class="c">No. of Villages covered</th>
          <th class="c">No. of Farmers benefitted</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderSoilWaterAnalysisDetailStateReportSection,
};
