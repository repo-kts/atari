const { resolveSoilWaterAnalysisDetailedPayload } = require('../../../../repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js');

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

function fmtDate(v) {
    return v ? esc(v) : '—';
}

function tableCss() {
    return `
  .swa-wrap { width:100%; font-size:6.5pt; line-height:1.12; }
  .swa-sec { font-size:8pt; font-weight:bold; margin:0 0 6px 0; }
  .swa-kvk-hd { font-size:7pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; }
  .swa-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:avoid; }
  .swa-tbl th, .swa-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .swa-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .swa-tbl .l { text-align:left; }
  .swa-tbl .c { text-align:center; }
  .swa-tbl .sub td { font-weight:bold; background:#f1f5f9; }
  .swa-tbl .grand td { font-weight:bold; background:#f5f5f5; }
`;
}

// Column widths sum ~100% — fits a landscape page without cropping the 17 cols.
function colGroup() {
    return `
  <colgroup>
    <col style="width:3%" />
    <col style="width:16%" />
    <col style="width:14%" />
    <col style="width:6%" />
    <col style="width:6%" />
    <col style="width:7%" />
    <col style="width:4.5%" /><col style="width:4.5%" />
    <col style="width:4.5%" /><col style="width:4.5%" />
    <col style="width:4.5%" /><col style="width:4.5%" />
    <col style="width:4.5%" /><col style="width:4.5%" />
    <col style="width:6%" />
    <col style="width:6%" />
    <col style="width:6%" />
  </colgroup>`;
}

function headRows() {
    return `
      <thead>
        <tr>
          <th rowspan="2">S.No</th>
          <th rowspan="2" class="l">Analysis</th>
          <th rowspan="2" class="l">Samples analysed through</th>
          <th rowspan="2">No. of samples analysed</th>
          <th rowspan="2">No. of villages covered</th>
          <th rowspan="2">Amount realized (₹)</th>
          <th colspan="9">No. of farmers benefitted</th>
          <th rowspan="2">Start date</th>
          <th rowspan="2">End date</th>
        </tr>
        <tr>
          <th>Gen M</th><th>Gen F</th>
          <th>OBC M</th><th>OBC F</th>
          <th>SC M</th><th>SC F</th>
          <th>ST M</th><th>ST F</th>
          <th>Total</th>
        </tr>
      </thead>`;
}

function bodyRow(r) {
    return `
      <tr>
        <td class="c">${r.sno}</td>
        <td class="l">${esc(r.analysis)}</td>
        <td class="l">${esc(r.through)}</td>
        <td class="c">${fmtInt(r.samples)}</td>
        <td class="c">${fmtInt(r.villages)}</td>
        <td class="c">${fmtInt(r.amount)}</td>
        <td class="c">${fmtInt(r.generalM)}</td>
        <td class="c">${fmtInt(r.generalF)}</td>
        <td class="c">${fmtInt(r.obcM)}</td>
        <td class="c">${fmtInt(r.obcF)}</td>
        <td class="c">${fmtInt(r.scM)}</td>
        <td class="c">${fmtInt(r.scF)}</td>
        <td class="c">${fmtInt(r.stM)}</td>
        <td class="c">${fmtInt(r.stF)}</td>
        <td class="c">${fmtInt(r.farmers)}</td>
        <td class="c">${fmtDate(r.startDate)}</td>
        <td class="c">${fmtDate(r.endDate)}</td>
      </tr>`;
}

function totalsCells(t) {
    return `
        <td class="c">${fmtInt(t.samples)}</td>
        <td class="c">${fmtInt(t.villages)}</td>
        <td class="c">${fmtInt(t.amount)}</td>
        <td class="c">${fmtInt(t.generalM)}</td>
        <td class="c">${fmtInt(t.generalF)}</td>
        <td class="c">${fmtInt(t.obcM)}</td>
        <td class="c">${fmtInt(t.obcF)}</td>
        <td class="c">${fmtInt(t.scM)}</td>
        <td class="c">${fmtInt(t.scF)}</td>
        <td class="c">${fmtInt(t.stM)}</td>
        <td class="c">${fmtInt(t.stF)}</td>
        <td class="c">${fmtInt(t.farmers)}</td>
        <td colspan="2"></td>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map(bodyRow).join('');
    const sub = `
      <tr class="sub">
        <td class="l" colspan="3">Sub-total — ${esc(g.kvkName)}</td>
        ${totalsCells(g.subtotal)}
      </tr>`;
    const kvkHd = showKvkHeader ? `<div class="swa-kvk-hd">${esc(g.kvkName)}</div>` : '';
    return `${kvkHd}
    <table class="swa-tbl">${colGroup()}${headRows()}
      <tbody>${body}${sub}</tbody>
    </table>`;
}

function renderSoilWaterAnalysisDetailReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveSoilWaterAnalysisDetailedPayload(data);
    const groups = payload.groups || [];

    if (groups.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No soil, water and plant analysis data for export.</p>
</div>`;
    }

    // Admins see multiple KVKs → label each group; a single KVK user does not.
    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
    <table class="swa-tbl">${colGroup()}
      <tbody>
        <tr class="grand">
          <td class="l" colspan="3">Grand Total (all KVKs)</td>
          ${totalsCells(payload.grandTotal)}
        </tr>
      </tbody>
    </table>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="swa-wrap">
    <div class="swa-sec">Detail of Soil, Water and Plant analysis</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderSoilWaterAnalysisDetailReportSection,
};
