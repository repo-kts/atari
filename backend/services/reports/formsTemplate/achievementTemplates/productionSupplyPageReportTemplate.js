const { resolveProductionSupplyCategoryGroupedPayload } = require('../../../../repositories/reports/productionSupplyPageReport/productionSupplyPageReportRepository.js');

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
  @page { size: A4 landscape; }
  .ps-page-wrap { width:100%; font-size:6pt; line-height:1.15; }
  .ps-page-sec { font-size:9pt; font-weight:bold; margin:0 0 6px 0; }
  .ps-group { margin-bottom:8px; page-break-inside:avoid; break-inside:avoid; }
  .ps-kvk-hd { font-size:8pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; border-bottom:0; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
  .ps-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
  .ps-page-tbl th, .ps-page-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-wrap:break-word; overflow-wrap:anywhere; }
  .ps-page-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .ps-page-tbl .l { text-align:left; }
  .ps-page-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .ps-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
  .ps-page-tbl .pt-hd { background:#eef2f7; }
  .ps-page-tbl .pt-hd td { text-align:left; }
`;
}

// Total column count for a full-width group-header row (Crop + Variety +
// Quantity + Value + 12 farmer cells + 3 total cells).
const TOTAL_COLS = 19;

function colGroup() {
    return `
  <colgroup>
    <col style="width:14%" />
    <col style="width:11%" />
    <col style="width:8%" />
    <col style="width:7%" />
    ${Array.from({ length: 15 }).map(() => '<col style="width:4%" />').join('')}
  </colgroup>`;
}

function headHtml() {
    return `
      <thead>
        <tr>
          <th rowspan="3" class="l">Crop</th>
          <th rowspan="3" class="l">Variety</th>
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
      </thead>`;
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

// Individual Crop row: Crop + Variety, then quantity/value/farmer/total cells.
function cropRow(r) {
    return `
      <tr>
        <td class="l">${esc(r.crop)}</td>
        <td class="l">${esc(r.variety)}</td>
        <td>${esc(r.quantityLabel)}</td>
        <td>${fmtMoney(r.valueRs)}</td>
        ${cellsFarmerTotal(r)}
      </tr>`;
}

// A totals row (Sub Total / Total): label spans Crop+Variety, then figures.
function totalsRow(r, cls, label) {
    return `
      <tr class="${cls}">
        <td class="l" colspan="2">${esc(label)}</td>
        <td>${esc(r.quantityLabel)}</td>
        <td>${fmtMoney(r.valueRs)}</td>
        ${cellsFarmerTotal(r)}
      </tr>`;
}

// Full-width Product Type group-header row.
function productTypeHeaderRow(name) {
    return `
      <tr class="pt-hd">
        <td class="l" colspan="${TOTAL_COLS}"><strong>${esc(name)}</strong></td>
      </tr>`;
}

function renderCategory(cat) {
    let body = '';
    for (const g of cat.productTypeGroups) {
        body += productTypeHeaderRow(g.productTypeName);
        body += g.rows.map((r) => cropRow(r)).join('');
        body += totalsRow(g.subtotal, 'sub', 'Sub Total');
    }
    body += totalsRow(cat.total, 'grand', 'Total');

    const title = `${esc(cat.letter)}. ${esc(cat.categoryName)}`;
    return `
    <div class="ps-group">
      <div class="ps-kvk-hd">${title}</div>
      <table class="ps-page-tbl">${colGroup()}${headHtml()}
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderProductionSupplyPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveProductionSupplyCategoryGroupedPayload(data);
    const categories = payload.categories || [];

    if (categories.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data found</p>
</div>`;
    }

    const categoriesHtml = categories.map((c) => renderCategory(c)).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="ps-page-wrap">
    <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
    <div class="ps-page-sec">Production and supply of Technological products</div>
    ${categoriesHtml}
  </div>
</div>`;
}

module.exports = {
    renderProductionSupplyPageReportSection,
};
