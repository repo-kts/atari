const { resolveTrainingCapacityPayload } = require('../../../../repositories/reports/trainingCapacityReport/trainingCapacityReportRepository.js');

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
  .tcap-wrap { width:100%; font-size:5pt; line-height:1.15; }
  .tcap-type-wrap { margin-bottom:14px; page-break-inside:avoid; }
  .tcap-type-heading { font-size:7pt; font-weight:bold; margin:16px 0 8px 0; padding-bottom:4px; border-bottom:0.5pt solid #999; }
  .tcap-type-wrap:first-child .tcap-type-heading { margin-top:0; }
  .tcap-sub { font-size:6.5pt; font-weight:bold; margin:10px 0 4px 0; }
  .tcap-block-title { font-size:6.5pt; font-weight:bold; margin:12px 0 4px 0; }
  .tcap-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:8px; page-break-inside:avoid; }
  .tcap-tbl th, .tcap-tbl td { border:0.35pt solid #000; padding:1px 2px; vertical-align:middle; text-align:center; word-break:break-word; }
  .tcap-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .tcap-tbl .l { text-align:left; }
  .tcap-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function participantCells(row) {
    return `
        <td>${fmtInt(row.courses)}</td>
        <td>${fmtInt(row.generalM)}</td>
        <td>${fmtInt(row.generalF)}</td>
        <td>${fmtInt(row.genT)}</td>
        <td>${fmtInt(row.obcM)}</td>
        <td>${fmtInt(row.obcF)}</td>
        <td>${fmtInt(row.obcT)}</td>
        <td>${fmtInt(row.scM)}</td>
        <td>${fmtInt(row.scF)}</td>
        <td>${fmtInt(row.scT)}</td>
        <td>${fmtInt(row.stM)}</td>
        <td>${fmtInt(row.stF)}</td>
        <td>${fmtInt(row.stT)}</td>
        <td>${fmtInt(row.grandM)}</td>
        <td>${fmtInt(row.grandF)}</td>
        <td>${fmtInt(row.grandT)}</td>`;
}

// One block per thematic area: a heading + a single-row participant table.
function thematicTableHead() {
    return `
    <thead>
      <tr>
        <th rowspan="3">No. of Courses</th>
        <th colspan="12">No. of Participants</th>
        <th colspan="3">Grand Total</th>
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

function renderThematicBlock(row) {
    return `
  <div class="tcap-block-title">Details of training program for ${esc(row.thematicAreaName)}</div>
  <table class="tcap-tbl">
    ${thematicTableHead()}
    <tbody>
      <tr>${participantCells(row)}</tr>
    </tbody>
  </table>`;
}

function renderTrainingCapacityReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveTrainingCapacityPayload(data);
    const summary = payload.thematicSummary || [];
    const hasData = summary.length > 0;

    if (!hasData) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    // One block per thematic area, in canonical order (from the repository).
    const blocksHtml = summary.map((row) => renderThematicBlock(row)).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="tcap-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    ${blocksHtml}
  </div>
</div>`;
}

module.exports = {
    renderTrainingCapacityReportSection,
};
