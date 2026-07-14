const { resolveCelebrationDaysGroupedPayload } = require('../../../../repositories/reports/celebrationDaysReport/celebrationDaysReportRepository.js');

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
  @page { size: A4 landscape; }
  .cd-page-wrap { width:100%; font-size:5.6pt; line-height:1.15; }
  .cd-page-sec { font-size:9pt; font-weight:bold; margin:0 0 6px 0; }
  .cd-group { margin-bottom:8px; page-break-inside:avoid; break-inside:avoid; }
  .cd-kvk-hd { font-size:8pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; border-bottom:0; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
  .cd-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
  .cd-page-tbl th, .cd-page-tbl td { border:0.35pt solid #000; padding:1px 2px; vertical-align:middle; text-align:center; word-wrap:break-word; overflow-wrap:anywhere; }
  .cd-page-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .cd-page-tbl .l { text-align:left; }
  .cd-page-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .cd-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function cellsDataRow(r) {
    const parts = [
        r.farmersGenM, r.farmersGenF, r.farmersGenT,
        r.farmersObcM, r.farmersObcF, r.farmersObcT,
        r.farmersScM, r.farmersScF, r.farmersScT,
        r.farmersStM, r.farmersStF, r.farmersStT,
        r.offGenM, r.offGenF, r.offGenT,
        r.offObcM, r.offObcF, r.offObcT,
        r.offScM, r.offScF, r.offScT,
        r.offStM, r.offStF, r.offStT,
        r.totalM, r.totalF, r.totalT,
    ];
    return parts.map((c) => `<td>${fmtInt(c)}</td>`).join('');
}

function headHtml() {
    return `
      <thead>
        <tr>
          <th rowspan="3" class="l">Celebration of Important Days</th>
          <th rowspan="3">No. of activities</th>
          <th colspan="12">Farmers</th>
          <th colspan="12">Extension Officials</th>
          <th colspan="3">Total</th>
        </tr>
        <tr>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
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
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
        </tr>
      </thead>`;
}

function dataRow(r, cls) {
    return `
      <tr${cls ? ` class="${cls}"` : ''}>
        <td class="l">${esc(r.label)}</td>
        <td>${fmtInt(r.numActivities)}</td>
        ${cellsDataRow(r)}
      </tr>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map((r) => dataRow(r)).join('');
    const sub = dataRow(g.subtotal, 'sub');
    const kvkHd = showKvkHeader ? `<div class="cd-kvk-hd">${esc(g.kvkName)}</div>` : '';
    return `
    <div class="cd-group">${kvkHd}
      <table class="cd-page-tbl">${headHtml()}
        <tbody>${body}${sub}</tbody>
      </table>
    </div>`;
}

function renderCelebrationDaysPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveCelebrationDaysGroupedPayload(data);
    const groups = payload.groups || [];

    if (groups.length === 0) {
        return `
        <div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
            <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
            <p class="no-data">No celebration days data for export.</p>
        </div>`;
    }

    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
        <table class="cd-page-tbl">${headHtml()}
        <tbody>${dataRow(payload.grandTotal, 'grand')}</tbody>
        </table>`
        : '';

    return `
        <div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
            <style>${tableCss()}</style>
            <div class="cd-page-wrap">
                <div class="cd-page-sec">D. Celebration of important days in KVKs</div>
                ${groupsHtml}
                ${grandHtml}
            </div>
        </div>`;
}

module.exports = {
    renderCelebrationDaysPageReportSection,
};
