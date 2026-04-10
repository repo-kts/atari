const { resolveProductionSupplyPagePayload } = require('../../../../repositories/reports/productionSupplyPageReport/productionSupplyPageReportRepository.js');

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

function fmtMoney(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return String(Number(n.toFixed(2)));
}

function tableCss() {
    return `
  .ps-page-wrap { width:100%; font-size:5pt; line-height:1.12; }
  .ps-page-sec { font-size:8pt; font-weight:bold; margin:0 0 6px 0; }
  .ps-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .ps-page-tbl th, .ps-page-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; }
  .ps-page-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .ps-page-tbl .l { text-align:left; }
  .ps-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function cellsFarmerTotal(r) {
    const parts = [
        r.farmersGenM, r.farmersGenF, r.farmersGenT,
        r.farmersObcM, r.farmersObcF, r.farmersObcT,
        r.farmersScM, r.farmersScF, r.farmersScT,
        r.farmersStM, r.farmersStF, r.farmersStT,
        r.totalM, r.totalF, r.totalT,
    ];
    return parts.map((c) => `<td>${fmtInt(c)}</td>`).join('');
}

function renderProductionSupplyPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveProductionSupplyPagePayload(data);
    const rows = payload.rows || [];
    const y = payload.yearLabel || '';

    if (rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data found</p>
</div>`;
    }

    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.productName)}</td>
        <td>${esc(r.quantityLabel)}</td>
        <td>${fmtMoney(r.valueRs)}</td>
        ${cellsFarmerTotal(r)}
      </tr>`).join('');

    const gt = payload.grandTotal || {};
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc(gt.productName || 'Total')}</td>
        <td>${esc(gt.quantityLabel)}</td>
        <td>${fmtMoney(gt.valueRs)}</td>
        ${cellsFarmerTotal(gt)}
      </tr>`;

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="ps-page-wrap">
    <div class="ps-page-sec">Production and supply of Technological products${y ? ` — year ${esc(y)}` : ''}</div>
    <table class="ps-page-tbl">
      <thead>
        <tr>
          <th rowspan="3" class="l">Name of product</th>
          <th rowspan="3">Quantity</th>
          <th rowspan="3">Value (Rs)</th>
          <th colspan="12">Farmers</th>
          <th colspan="3">Total</th>
        </tr>
        <tr>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
          <th rowspan="2">M</th>
          <th rowspan="2">F</th>
          <th rowspan="2">T</th>
        </tr>
        <tr>
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
    renderProductionSupplyPageReportSection,
};
