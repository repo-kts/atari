const { resolveFldStateCategoryPayload } = require('../../../../repositories/reports/fldStateCategoryReport/fldStateCategoryReportRepository.js');

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
  .fld-sc-wrap { width:100%; font-size:5.5pt; line-height:1.15; }
  .fld-sc-sub { font-size:7.5pt; font-weight:bold; margin:10px 0 5px 0; }
  .fld-sc-cat { font-size:7pt; font-weight:bold; margin:12px 0 4px 0; }
  .fld-sc-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .fld-sc-tbl th, .fld-sc-tbl td { border:0.35pt solid #000; padding:2px 2px; vertical-align:middle; text-align:center; word-break:break-word; }
  .fld-sc-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .fld-sc-tbl .l { text-align:left; }
  .fld-sc-tbl .grand { font-weight:bold; background:#f5f5f5; }
  .fld-sc-foot { font-size:5pt; margin-top:6px; }
`;
}

function renderSectionA(payload) {
    const { categories = [], stateRows = [], totalRow } = payload.sectionA || {};
    const y = payload.yearLabel || '';

    if (!categories.length) {
        return `<p class="no-data">No summary data.</p>`;
    }

    const catHeader = categories.map((c) => `<th colspan="3">${esc(c)}</th>`).join('');
    const subHeader = categories.map(() => `
        <th>No. of farmers</th>
        <th>No. of demo</th>
        <th>Area(ha)</th>`).join('');

    const bodyRows = stateRows.map((row) => {
        const cells = row.cells.map((cell) => `
        <td>${fmtInt(cell.farmers)}</td>
        <td>${fmtInt(cell.demos)}</td>
        <td>${fmtNum(cell.area, 2)}</td>`).join('');
        return `
      <tr>
        <td class="l">${esc(row.stateName)}</td>
        ${cells}
      </tr>`;
    }).join('');

    const totalCells = (totalRow && totalRow.cells)
        ? totalRow.cells.map((cell) => `
        <td>${fmtInt(cell.farmers)}</td>
        <td>${fmtInt(cell.demos)}</td>
        <td>${fmtNum(cell.area, 2)}</td>`).join('')
        : '';

    const grandRow = totalRow
        ? `
      <tr class="grand">
        <td class="l">${esc(totalRow.stateName || 'Total')}</td>
        ${totalCells}
      </tr>`
        : '';

    return `
  <div class="fld-sc-sub">A. State wise details of Front-Line Demonstration during the year ${esc(y)}</div>
  <table class="fld-sc-tbl">
    <thead>
      <tr>
        <th rowspan="2" class="l">States</th>
        ${catHeader}
      </tr>
      <tr>
        ${subHeader}
      </tr>
    </thead>
    <tbody>
      ${bodyRows}
      ${grandRow}
    </tbody>
  </table>`;
}

function renderDetailRow(fr) {
    if (!fr) {
        return '<td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td>';
    }
    return `
        <td>${fr.demoYield != null ? fmtNum(fr.demoYield, 2) : '—'}</td>
        <td>${fr.checkYield != null ? fmtNum(fr.checkYield, 2) : '—'}</td>
        <td>${fr.increasePercent != null ? fmtNum(fr.increasePercent, 2) : '—'}</td>
        <td>${fr.demoGrossCost != null ? fmtNum(fr.demoGrossCost, 1) : '—'}</td>
        <td>${fr.demoGrossReturn != null ? fmtNum(fr.demoGrossReturn, 1) : '—'}</td>
        <td>${fr.demoNetReturn != null ? fmtNum(fr.demoNetReturn, 1) : '—'}</td>
        <td>${fr.demoBcr != null ? fmtNum(fr.demoBcr, 2) : '—'}</td>
        <td>${fr.checkGrossCost != null ? fmtNum(fr.checkGrossCost, 1) : '—'}</td>
        <td>${fr.checkGrossReturn != null ? fmtNum(fr.checkGrossReturn, 1) : '—'}</td>
        <td>${fr.checkNetReturn != null ? fmtNum(fr.checkNetReturn, 1) : '—'}</td>
        <td>${fr.checkBcr != null ? fmtNum(fr.checkBcr, 2) : '—'}</td>`;
}

function renderCategoryDetailTable(cropGroups) {
    if (!cropGroups || cropGroups.length === 0) {
        return '<p class="no-data">No detail rows.</p>';
    }

    let html = '';
    for (const cg of cropGroups) {
        for (const row of cg.rows || []) {
            html += `
      <tr>
        <td class="l">${esc(row.crop)}</td>
        <td class="l">${esc(row.state)}</td>
        <td>${fmtInt(row.farmers)}</td>
        <td>${fmtInt(row.demos)}</td>
        <td>${row.areaHa != null ? fmtNum(row.areaHa, 2) : '—'}</td>
        ${renderDetailRow(row.fldResult)}
      </tr>`;
        }
        const tr = cg.totalRow;
        if (tr) {
            html += `
      <tr class="grand">
        <td class="l">${esc(tr.crop)}</td>
        <td class="l">${esc(tr.state)}</td>
        <td>${fmtInt(tr.farmers)}</td>
        <td>${fmtInt(tr.demos)}</td>
        <td>${tr.areaHa != null ? fmtNum(tr.areaHa, 2) : '—'}</td>
        ${renderDetailRow(tr.fldResult)}
      </tr>`;
        }
    }

    return `
  <table class="fld-sc-tbl">
    <thead>
      <tr>
        <th rowspan="2" class="l">Crop</th>
        <th rowspan="2" class="l">States</th>
        <th rowspan="2">No of Farmers</th>
        <th rowspan="2">No of Demonstration</th>
        <th rowspan="2">Area(ha)</th>
        <th colspan="3">Yield(q/ha)</th>
        <th colspan="4">Economics of demonstration(Rs/ha)</th>
        <th colspan="4">Economics of check(Rs/ha)</th>
      </tr>
      <tr>
        <th>Demo</th><th>Check</th><th>Increase(%)</th>
        <th>Gross Cost</th><th>Gross Return</th><th>Net Return</th><th>BCR</th>
        <th>Gross Cost</th><th>Gross Return</th><th>Net Return</th><th>BCR</th>
      </tr>
    </thead>
    <tbody>${html}</tbody>
  </table>`;
}

function renderSectionB(payload) {
    const blocks = payload.sectionB || [];
    if (!blocks.length) {
        return '';
    }

    const y = payload.yearLabel || '';
    let out = `<div class="fld-sc-sub">B. Details of Front-Line Demonstration by Category during the year ${esc(y)}</div>`;

    for (const b of blocks) {
        out += `
  <div class="fld-sc-cat">Details of Front-Line Demonstration on ${esc(b.categoryName)}</div>
  ${renderCategoryDetailTable(b.cropGroups)}`;
    }

    out += `
  <div class="fld-sc-foot">
    * Economics to be worked out based on total cost of production per unit area and not on critical inputs alone.<br/>
    ** BCR = GROSS RETURN / GROSS COST
  </div>`;

    return out;
}

function renderFldStateCategoryReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveFldStateCategoryPayload(data);
    const hasData = (payload.sectionA && payload.sectionA.categories && payload.sectionA.categories.length > 0)
        || (payload.sectionB && payload.sectionB.length > 0);

    if (!hasData) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="fld-sc-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    ${renderSectionA(payload)}
    ${renderSectionB(payload)}
  </div>
</div>`;
}

module.exports = {
    renderFldStateCategoryReportSection,
};
