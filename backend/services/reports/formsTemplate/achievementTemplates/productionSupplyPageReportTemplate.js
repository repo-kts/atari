const {
    resolveProductionSupplyCategoryGroupedPayload,
    resolveProductionSupplyStatePayload,
} = require('../../../../repositories/reports/productionSupplyPageReport/productionSupplyPageReportRepository.js');

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

// ── Superadmin state-wise layout ───────────────────────────────────────────
function fmtNum(v) {
    if (v === null || v === undefined || v === '') return '0';
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

function stateTableCss() {
    return `
  .ps-st-wrap { width:100%; font-size:6pt; line-height:1.15; }
  .ps-st-cat { font-size:9pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:10px 0 4px 0; page-break-after:avoid; break-after:avoid; }
  .ps-st-title { font-size:7pt; font-weight:bold; margin:6px 0 2px 0; page-break-after:avoid; break-after:avoid; }
  .ps-st-tbl { width:100%; border-collapse:collapse; margin-bottom:8px; page-break-inside:avoid; break-inside:avoid; }
  .ps-st-tbl th, .ps-st-tbl td { border:0.35pt solid #000; padding:2px 4px; vertical-align:middle; text-align:center; word-wrap:break-word; overflow-wrap:anywhere; }
  .ps-st-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .ps-st-tbl .l { text-align:left; }
  .ps-st-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .ps-st-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

const METRIC_LABELS = ['Quantity of seed (q)', 'Value (Rs.)', 'No. of farmers'];

function metricSubHead() {
    return METRIC_LABELS.map((l) => `<th>${esc(l)}</th>`).join('');
}

function metricCells(m) {
    const v = m || { qty: 0, value: 0, farmers: 0 };
    return `<td>${fmtNum(v.qty)}</td><td>${fmtNum(v.value)}</td><td>${fmtInt(v.farmers)}</td>`;
}

// Header shared by Table 2 (label = "Crop") and Table 3 (Crop Type + Name Of Crop).
function stateMetricHead(states, leadCells) {
    const topGroup = states.map((s) => `<th colspan="3">${esc(s)}</th>`).join('');
    const subRow = states.map(() => metricSubHead()).join('');
    return `
      <thead>
        <tr>
          ${leadCells.map((c) => `<th rowspan="2" class="l">${esc(c)}</th>`).join('')}
          ${topGroup}
          <th colspan="3">Total</th>
        </tr>
        <tr>
          ${subRow}
          ${metricSubHead()}
        </tr>
      </thead>`;
}

// Table 1 — State-wise details (category total quantity per state).
function renderStateTotalsTable(cat, states) {
    const rows = states.map((st, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="l">${esc(st)}</td>
        <td>${fmtNum(cat.byState[st] ? cat.byState[st].qty : 0)}</td>
      </tr>`).join('');
    return `
    <div class="ps-st-title">1. State-wise details of ${esc(cat.categoryName)}</div>
    <table class="ps-st-tbl">
      <thead>
        <tr><th>Sr. No.</th><th class="l">States</th><th>${esc(cat.categoryName)}</th></tr>
      </thead>
      <tbody>${rows}
        <tr class="grand"><td></td><td class="l">Total</td><td>${fmtNum(cat.total.qty)}</td></tr>
      </tbody>
    </table>`;
}

// Table 2 — Product-type summary, state-wise.
function renderTypeSummaryTable(cat, states) {
    const body = cat.productTypes.map((pt) => `
      <tr>
        <td class="l">${esc(pt.name)}</td>
        ${states.map((st) => metricCells(pt.byState[st])).join('')}
        ${metricCells(pt.total)}
      </tr>`).join('');
    const grand = `
      <tr class="grand">
        <td class="l">Grand Total</td>
        ${states.map((st) => metricCells(cat.byState[st])).join('')}
        ${metricCells(cat.total)}
      </tr>`;
    return `
    <div class="ps-st-title">2. List of product category state-wise</div>
    <table class="ps-st-tbl">
      ${stateMetricHead(states, ['Crop'])}
      <tbody>${body}${grand}</tbody>
    </table>`;
}

// Table 3 — Crop-level expansion, grouped by product type, state-wise.
function renderCropExpansionTable(cat, states) {
    const groups = cat.typeGroups.map((g) => {
        const span = g.crops.length + 1; // crop rows + the type Total row
        const cropRows = g.crops.map((crop, idx) => `
      <tr>
        ${idx === 0 ? `<td class="l" rowspan="${span}">${esc(g.name)}</td>` : ''}
        <td class="l">${esc(crop.name)}</td>
        ${states.map((st) => metricCells(crop.byState[st])).join('')}
        ${metricCells(crop.total)}
      </tr>`).join('');
        const totalRow = `
      <tr class="sub">
        ${g.crops.length === 0 ? `<td class="l">${esc(g.name)}</td>` : ''}
        <td class="l">Total</td>
        ${states.map((st) => metricCells(g.typeByState[st])).join('')}
        ${metricCells(g.typeTotal)}
      </tr>`;
        return cropRows + totalRow;
    }).join('');
    return `
    <div class="ps-st-title">3. Details of crops (product category-wise)</div>
    <table class="ps-st-tbl">
      ${stateMetricHead(states, ['Crop Type', 'Name Of Crop'])}
      <tbody>${groups}</tbody>
    </table>`;
}

function renderStateCategory(cat, states) {
    return `
    <div class="ps-group">
      <div class="ps-st-cat">${esc(cat.letter)}. ${esc(cat.categoryName)}</div>
      ${renderStateTotalsTable(cat, states)}
      ${renderTypeSummaryTable(cat, states)}
      ${renderCropExpansionTable(cat, states)}
    </div>`;
}

function renderProductionSupplyStateSection(section, data, sectionId, isFirstSection) {
    const payload = resolveProductionSupplyStatePayload(data);
    const states = payload.stateColumns || [];
    const categories = payload.categories || [];
    const headingText = `${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}`;
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    if (categories.length === 0) {
        return `
<div id="${sectionId}" class="${pageClass}">
  <h1 class="section-title">${headingText}</h1>
  <p class="no-data">No data found</p>
</div>`;
    }

    const body = categories.map((c) => renderStateCategory(c, states)).join('');
    return `
<div id="${sectionId}" class="${pageClass}">
  <style>${tableCss()}${stateTableCss()}</style>
  <div class="ps-st-wrap">
    <h1 class="section-title">${headingText}</h1>
    ${body}
  </div>
</div>`;
}

function renderProductionSupplyPageReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Superadmin (aggregated) reports show the state-wise breakdown; single-KVK
    // reports keep the category → product-type → crop page layout.
    if (reportContext.isAggregatedView) {
        return renderProductionSupplyStateSection.call(this, section, data, sectionId, isFirstSection);
    }

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
