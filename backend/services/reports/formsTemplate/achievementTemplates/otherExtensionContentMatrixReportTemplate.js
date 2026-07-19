const { resolveOtherExtensionMatrixPayload } = require('../../../../repositories/reports/otherExtensionContentReport/otherExtensionContentReportRepository.js');

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

function tableCss() {
  return `
  .oec-mx-wrap { width:100%; font-size:5.5pt; line-height:1.12; }
  .oec-mx-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:avoid; }
  .oec-mx-tbl th, .oec-mx-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-break:break-word; }
  .oec-mx-tbl.no-bottom-border tbody tr:last-child td { border-bottom:0; }
  .oec-mx-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .oec-mx-tbl .l { text-align:left; }
`;
}

function renderOtherExtensionContentMatrixReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
  const payload = resolveOtherExtensionMatrixPayload(data);
  const stateColumns = payload.stateColumns || [];
  const matrixRows = payload.matrixRows || [];
  const y = payload.yearLabel || '';

  if (!matrixRows.length) {
    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No other extension activity data for this period.</p>
</div>`;
  }

  // State columns are an aggregated/superadmin view. A KVK report only needs
  // the activity total and must not expose a state list.
  const showStateColumns = Boolean(reportContext.isAggregatedView);
  const visibleStateColumns = showStateColumns ? stateColumns : [];
  const colspan = Math.max(1, visibleStateColumns.length);
  const subHead = visibleStateColumns.length
    ? visibleStateColumns.map((s) => `<th>${esc(s)}</th>`).join('')
    : '<th>—</th>';

  const body = matrixRows.map((row) => {
    const cells = visibleStateColumns.length
      ? visibleStateColumns.map((st) => `<td>${fmtInt(row.valuesByState && row.valuesByState[st])}</td>`).join('')
      : `<td>${fmtInt(row.total)}</td>`;
    return `
      <tr>
        <td class="l">${esc(row.label)}</td>
        ${cells}
        ${showStateColumns ? `<td>${fmtInt(row.total)}</td>` : ''}
      </tr>`;
  }).join('');

  const header = showStateColumns
    ? `
        <tr>
          <th rowspan="2" class="l">Nature of Extension Activity</th>
          <th colspan="${colspan}">No. of activities</th>
          <th rowspan="2">Total</th>
        </tr>
        <tr>
          ${subHead}
        </tr>`
    : `
        <tr>
          <th class="l">Nature of Extension Activity</th>
          <th>No. of activities</th>
        </tr>`;

  return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="oec-mx-wrap">
    <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
    <table class="oec-mx-tbl no-bottom-border">
      <thead>
        ${header}
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
  renderOtherExtensionContentMatrixReportSection,
};
