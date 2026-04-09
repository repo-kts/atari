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

function outreachTableCss() {
    return `
  .eox-wrap { width:100%; font-size:4.5pt; line-height:1.1; }
  .eox-title { text-align:center; font-size:8pt; font-weight:bold; margin:0 0 4px 0; }
  .eox-sub { text-align:center; font-size:6pt; margin:0 0 10px 0; }
  .eox-sec { font-size:6.5pt; font-weight:bold; margin:12px 0 6px 0; }
  .eox-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:avoid; }
  .eox-tbl th, .eox-tbl td { border:0.35pt solid #000; padding:1px 2px; vertical-align:middle; text-align:center; word-break:break-word; }
  .eox-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .eox-tbl .l { text-align:left; }
  .eox-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

/** One data row: label in first column + numeric columns from payload row */
function cellsFromDataRow(r) {
    const v = [
        r.numActivities,
        r.farmersGeneralM, r.farmersGeneralF, r.farmersGeneralT,
        r.farmersObcM, r.farmersObcF, r.farmersObcT,
        r.farmersScM, r.farmersScF, r.farmersScT,
        r.farmersStM, r.farmersStF, r.farmersStT,
        r.officialsGeneralM, r.officialsGeneralF, r.officialsGeneralT,
        r.officialsObcM, r.officialsObcF, r.officialsObcT,
        r.officialsScM, r.officialsScF, r.officialsScT,
        r.officialsStM, r.officialsStF, r.officialsStT,
        r.grandM, r.grandF, r.grandT,
    ];
    return v.map((x) => `<td>${fmtInt(x)}</td>`).join('');
}

function theadHtml(firstColHeader) {
    return `
    <thead>
      <tr>
        <th rowspan="3" class="l">${esc(firstColHeader)}</th>
        <th rowspan="3">No. of activities</th>
        <th colspan="12">Farmers</th>
        <th colspan="12">Extension Officials</th>
        <th colspan="3">Total</th>
      </tr>
      <tr>
        <th colspan="3">General</th><th colspan="3">OBC</th><th colspan="3">SC</th><th colspan="3">ST</th>
        <th colspan="3">General</th><th colspan="3">OBC</th><th colspan="3">SC</th><th colspan="3">ST</th>
        <th rowspan="2">M</th><th rowspan="2">F</th><th rowspan="2">T</th>
      </tr>
      <tr>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
      </tr>
    </thead>`;
}

function renderOutreachTable(firstColHeader, rows, grandTotal, caption, yearLabel) {
    const body = (rows || []).map((r) => `
      <tr>
        <td class="l">${esc(r.label)}</td>
        ${cellsFromDataRow(r)}
      </tr>`).join('');
    const gt = grandTotal || {};
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc('Total')}</td>
        ${cellsFromDataRow({ label: 'Total', ...gt })}
      </tr>`;
    return `
  <div class="eox-sec">${esc(caption)} during the year ${esc(yearLabel)}</div>
  <table class="eox-tbl">
    ${theadHtml(firstColHeader)}
    <tbody>${body}${grandRow}</tbody>
  </table>`;
}

module.exports = {
    esc,
    fmtInt,
    outreachTableCss,
    renderOutreachTable,
    cellsFromDataRow,
};
