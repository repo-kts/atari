const {
    resolveSoilWaterAnalysisStatePayload,
    resolveSoilWaterAnalysisDetailedPayload,
} = require('../../../../repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js');

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

// Backend dates are `YYYY-MM-DD` (or an ISO timestamp) — render as DD/MM/YYYY
// straight from the string so no timezone shift moves the calendar day.
function fmtDate(v) {
    if (!v) return '—';
    const m = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
}

function tableCss() {
    return `
  .swd-wrap { width:100%; font-size:7pt; line-height:1.1; }
  .swd-title { font-size:9pt; font-weight:bold; margin:0 0 4px 0; }
  .swd-sub { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .swd-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .swd-tbl th, .swd-tbl td {
    border:0.35pt solid #000; padding:2px 3px; vertical-align:middle;
    word-break:break-word; overflow-wrap:anywhere; hyphens:auto;
  }
  .swd-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .swd-tbl .c { text-align:center; }
  .swd-tbl .l { text-align:left; }
  .swd-tbl .num { text-align:center; }
  .swd-tbl .total-row td { font-weight:bold; }
  .swd-tbl .grand-row td { font-weight:bold; background:#f0f0f0; }
  .swd-tbl .muted { color:#444; font-size:7pt; }
`;
}

// Farmer-benefitted leaf columns for the detailed (per-KVK) table, grouped by
// caste category with Male/Female (and a Total M/F/T block) — see report format.
const FARMER_GROUPS = [
    { label: 'General', mField: 'generalM', fField: 'generalF' },
    { label: 'OBC', mField: 'obcM', fField: 'obcF' },
    { label: 'SC', mField: 'scM', fField: 'scF' },
    { label: 'ST', mField: 'stM', fField: 'stF' },
];
const M_FIELDS = ['generalM', 'obcM', 'scM', 'stM'];
const F_FIELDS = ['generalF', 'obcF', 'scF', 'stF'];

function sumFields(obj, fields) {
    return fields.reduce((s, f) => s + safeIntLocal(obj[f]), 0);
}
function safeIntLocal(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function sectionShell(section, sectionId, isFirstSection, inner) {
    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="swd-wrap">
    <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
    <div class="swd-sub">Detail of Soil, Water and Plant analysis</div>
    ${inner}
  </div>
</div>`;
}

function noDataSection(section, sectionId, isFirstSection) {
    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
  <p class="no-data">No data found</p>
</div>`;
}

/**
 * Aggregated (super_admin / above-KVK) view — state-wise totals across the seven
 * fixed analysis categories, with per-state and grand totals.
 */
function renderAggregatedState(section, data, sectionId, isFirstSection) {
    const payload = resolveSoilWaterAnalysisStatePayload(data, {});
    const blocks = payload.stateBlocks || [];
    const grand = payload.grandTotal || { samples: 0, villages: 0, farmers: 0 };

    if (!blocks.length) return noDataSection(section, sectionId, isFirstSection);

    const rowspan = 7 + 1;
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

    const table = `
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
    </table>`;

    return sectionShell(section, sectionId, isFirstSection, table);
}

/**
 * KVK view — one row per recorded analysis entry with every captured field
 * (KVK name instead of State, analysis, samples-through, samples, villages,
 * amount realized, the full caste/gender split of farmers benefitted, and the
 * activity period), plus a grand total. Same HTML feeds the PDF, Word and Excel.
 */
function renderKvkDetailed(section, data, sectionId, isFirstSection) {
    const payload = resolveSoilWaterAnalysisDetailedPayload(data);
    const groups = payload.groups || [];
    if (!groups.length) return noDataSection(section, sectionId, isFirstSection);

    // Farmer cells for one record/total: General(M,F) OBC(M,F) SC(M,F) ST(M,F)
    // then a Total block (sum of all M, all F, and the grand sum).
    const farmerCells = (o) => {
        const totM = sumFields(o, M_FIELDS);
        const totF = sumFields(o, F_FIELDS);
        const cells = FARMER_GROUPS.flatMap((g) => [
            `<td class="num">${fmtInt(o[g.mField])}</td>`,
            `<td class="num">${fmtInt(o[g.fField])}</td>`,
        ]);
        cells.push(`<td class="num">${fmtInt(totM)}</td>`);
        cells.push(`<td class="num">${fmtInt(totF)}</td>`);
        cells.push(`<td class="num">${fmtInt(totM + totF)}</td>`);
        return cells.join('');
    };

    const gt = payload.grandTotal || {};
    let sno = 0;
    let body = '';
    for (const g of groups) {
        for (const r of g.rows) {
            sno += 1;
            body += `<tr>
  <td class="c">${sno}</td>
  <td class="l">${esc(g.kvkName)}</td>
  <td class="l">${esc(r.analysis)}</td>
  <td class="l">${esc(r.through)}</td>
  <td class="num">${fmtInt(r.samples)}</td>
  <td class="num">${fmtInt(r.villages)}</td>
  <td class="num">${fmtInt(r.amount)}</td>
  ${farmerCells(r)}
  <td class="c">${fmtDate(r.startDate)}</td>
  <td class="c">${fmtDate(r.endDate)}</td>
</tr>`;
        }
    }

    body += `<tr class="grand-row">
  <td class="l" colspan="4">Grand Total</td>
  <td class="num">${fmtInt(gt.samples)}</td>
  <td class="num">${fmtInt(gt.villages)}</td>
  <td class="num">${fmtInt(gt.amount)}</td>
  ${farmerCells(gt)}
  <td class="c"></td>
  <td class="c"></td>
</tr>`;

    // 20 leaf columns — colgroup keeps the wide table from collapsing text.
    const colgroup = `
      <colgroup>
        <col style="width:3.5%"><col style="width:8%"><col style="width:6%">
        <col style="width:8%"><col style="width:6%"><col style="width:6%"><col style="width:6.5%">
        <col style="width:3.3%"><col style="width:3.3%"><col style="width:3.3%"><col style="width:3.3%">
        <col style="width:3.3%"><col style="width:3.3%"><col style="width:3.3%"><col style="width:3.3%">
        <col style="width:3.3%"><col style="width:3.3%"><col style="width:3.6%">
        <col style="width:6%"><col style="width:6%">
      </colgroup>`;

    const table = `
    <table class="swd-tbl">
      ${colgroup}
      <thead>
        <tr>
          <th class="c" rowspan="3">S.No</th>
          <th class="l" rowspan="3">KVK</th>
          <th class="l" rowspan="3">Analysis</th>
          <th class="l" rowspan="3">Samples analysed through</th>
          <th class="c" rowspan="3">No. of samples analysed</th>
          <th class="c" rowspan="3">No. of villages covered</th>
          <th class="c" rowspan="3">Amount realized (₹)</th>
          <th class="c" colspan="11">No. of farmers benefitted</th>
          <th class="c" rowspan="3">Start date</th>
          <th class="c" rowspan="3">End date</th>
        </tr>
        <tr>
          <th class="c" colspan="2">General</th>
          <th class="c" colspan="2">OBC</th>
          <th class="c" colspan="2">SC</th>
          <th class="c" colspan="2">ST</th>
          <th class="c" colspan="3">Total</th>
        </tr>
        <tr>
          <th class="c">M</th><th class="c">F</th>
          <th class="c">M</th><th class="c">F</th>
          <th class="c">M</th><th class="c">F</th>
          <th class="c">M</th><th class="c">F</th>
          <th class="c">M</th><th class="c">F</th><th class="c">T</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;

    return sectionShell(section, sectionId, isFirstSection, table);
}

function renderSoilWaterAnalysisDetailStateReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Role-based, NOT scope-based: above-KVK users (super_admin, zone/state/
    // district/org admins) get the state-wise aggregate; KVK-bound users get
    // their own entries in full detail. A KVK admin's own report is generated
    // through the aggregated *scope* path (kvkId null → isAggregatedReport true),
    // so we key off isAggregatedView (which is derived from the user's role) —
    // keying off isAggregatedReport would wrongly give a KVK admin the State view.
    const isAggregated = Boolean(reportContext.isAggregatedView);
    return isAggregated
        ? renderAggregatedState(section, data, sectionId, isFirstSection)
        : renderKvkDetailed(section, data, sectionId, isFirstSection);
}

module.exports = {
    renderSoilWaterAnalysisDetailStateReportSection,
};
