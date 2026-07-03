const { resolveFldPageReportPayload } = require('../../../../repositories/reports/fldPageReport/fldPageReportPayload.js');
const {
    getFldResultReportColumns,
    groupColumns,
} = require('../../../../utils/fldResultReportColumns.js');

const MAIN_TITLE = 'ACHIEVEMENTS OF FRONTLINE DEMONSTRATIONS (FLD)';

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtNum(v, decimals = 2) {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toFixed(decimals);
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return String(Math.round(n));
}

function tableCss() {
    return `
  .fld-page-wrap { width:100%; font-size:6.5pt; line-height:1.2; }
  .fld-main-title { text-align:center; font-size:11pt; font-weight:bold; margin:0 0 10px 0; }
  .fld-subtitle { font-size:8pt; font-weight:bold; margin:12px 0 6px 0; }
  .fld-cat-title { font-size:7.5pt; font-weight:bold; margin:14px 0 6px 0; }
  .fld-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .fld-tbl th, .fld-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-break:break-word; }
  .fld-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .fld-tbl .l { text-align:left; }
  .fld-tbl .grand { font-weight:bold; background:#f5f5f5; }
  .fld-foot { font-size:5.5pt; margin-top:8px; line-height:1.35; }
`;
}

function renderSectionA(payload) {
    const rows = payload.sectionA || [];
    const gt = payload.grandTotal || {};
    const y = payload.yearLabel || '';

    const body = rows.map((r) => `
      <tr>
        <td>${esc(r.sno)}</td>
        <td class="l">${esc(r.category)}</td>
        <td>${fmtInt(r.noFld)}</td>
        <td>${fmtNum(r.area, 2)}</td>
        <td>${fmtInt(r.beneficiaries)}</td>
        <td>${r.yieldDemo != null ? fmtNum(r.yieldDemo, 2) : '—'}</td>
        <td>${r.yieldCheck != null ? fmtNum(r.yieldCheck, 2) : '—'}</td>
      </tr>`).join('');

    const grandRow = `
      <tr class="grand">
        <td></td>
        <td class="l">${esc('Grand Total')}</td>
        <td>${fmtInt(gt.noFld)}</td>
        <td>${fmtNum(gt.area, 2)}</td>
        <td>${fmtInt(gt.beneficiaries)}</td>
        <td>${gt.yieldDemo != null ? fmtNum(gt.yieldDemo, 2) : '—'}</td>
        <td>${gt.yieldCheck != null ? fmtNum(gt.yieldCheck, 2) : '—'}</td>
      </tr>`;

    return `
  <div class="fld-subtitle">A. Overall achievements of FLDs conducted${y ? ` for ${esc(y)}` : ''}</div>
  <table class="fld-tbl">
    <thead>
      <tr>
        <th>S. No.</th>
        <th class="l">Category</th>
        <th>No. of FLD</th>
        <th>Area</th>
        <th>No. of beneficiaries</th>
        <th>Yield in Demo (q/ha)</th>
        <th>Yield in check (q/ha)</th>
      </tr>
    </thead>
    <tbody>${body}${grandRow}</tbody>
  </table>`;
}

function renderDetailTable(rows, category) {
    const columns = getFldResultReportColumns(category || rows?.[0] || {});
    const columnGroups = groupColumns(columns);
    const fixedColspan = 6;
    const totalColspan = fixedColspan + columns.length;
    const body = (rows || []).map((r) => `
      <tr>
        <td class="l">${esc(r.crop)}</td>
        <td class="l">${esc(r.thematicArea)}</td>
        <td class="l">${esc(r.technology)}</td>
        <td>${fmtInt(r.noOfDemonstration)}</td>
        <td>${fmtInt(r.noOfFarmers)}</td>
        <td>${r.areaHa != null ? fmtNum(r.areaHa, 2) : '—'}</td>
        ${columns.map((col) => `<td>${r[col.key] != null ? fmtNum(r[col.key], col.decimals) : '—'}</td>`).join('')}
      </tr>`).join('');

    return `
  <table class="fld-tbl">
    <thead>
      <tr>
        <th rowspan="2" class="l">Crop</th>
        <th rowspan="2" class="l">Thematic Area</th>
        <th rowspan="2" class="l">Name of the technology demonstrated</th>
        <th rowspan="2">No. of Demonstration</th>
        <th rowspan="2">No. of Farmers</th>
        <th rowspan="2">Area(ha)</th>
        ${columnGroups.map((group) => `<th colspan="${group.columns.length}">${esc(group.label)}</th>`).join('')}
      </tr>
      <tr>
        ${columns.map((col) => `<th>${esc(col.label)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>${body || `<tr><td colspan="${totalColspan}">—</td></tr>`}</tbody>
  </table>`;
}

function renderSectionB(payload) {
    const blocks = (payload.sectionB || []).map((cat) => `
  <div class="fld-cat-title">${esc(cat.categoryName)}</div>
  ${renderDetailTable(cat.rows, cat)}`).join('');

    return `
  <div class="fld-subtitle">B. Details of FLDs conducted${payload.yearLabel ? ` for ${esc(payload.yearLabel)}` : ''}</div>
  ${blocks}
  <div class="fld-foot">
    * Economics to be worked out based on total cost of production per unit area and not on critical inputs alone.<br/>
    ** BCR = GROSS RETURN / GROSS COST
  </div>`;
}

function renderFldPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveFldPageReportPayload(data);
    const hasAny = (payload.sectionA && payload.sectionA.length > 0)
        || (payload.sectionB && payload.sectionB.some((c) => c.rows && c.rows.length > 0));

    if (!hasAny) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="fld-main-title">${esc(MAIN_TITLE)}</h1>
  <p class="no-data">No data available for this report.</p>
</div>`;
    }

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="fld-page-wrap">
    <h1 class="fld-main-title">${esc(MAIN_TITLE)}</h1>
    ${renderSectionA(payload)}
    ${renderSectionB(payload)}
  </div>
</div>`;
}

module.exports = {
    renderFldPageReportSection,
    MAIN_TITLE,
};
