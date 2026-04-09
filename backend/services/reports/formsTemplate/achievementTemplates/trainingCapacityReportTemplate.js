const { resolveTrainingCapacityPayload } = require('../../../../repositories/reports/trainingCapacityReport/trainingCapacityReportRepository.js');

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function sectionLabel(block) {
    return block.sectionTitle || block.trainingTypeName || '';
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

function renderStateTable(block, y) {
    const rows = block.stateRows || [];
    const gt = block.stateGrandTotal || {};
    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.stateName)}</td>
        ${participantCells(r)}
      </tr>`).join('');
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc('Total')}</td>
        ${participantCells(gt)}
      </tr>`;
    return `
  <div class="tcap-sub">${esc(block.letter)}. State-wise details of training programme for ${esc(sectionLabel(block))} during the year ${esc(y)}</div>
  <table class="tcap-tbl">
    <thead>
      <tr>
        <th rowspan="3" class="l">State</th>
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
    </thead>
    <tbody>${body}${grandRow}</tbody>
  </table>`;
}

function renderTrainingAreaSummaryTable(block, y) {
    const rows = block.trainingAreaSummary || [];
    const gt = block.trainingAreaSummaryGrand || {};
    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.trainingAreaName)}</td>
        ${participantCells(r)}
      </tr>`).join('');
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc('Total')}</td>
        ${participantCells(gt)}
      </tr>`;
    return `
  <div class="tcap-sub">Training area wise details of training programs of ${esc(sectionLabel(block))} during the year ${esc(y)}</div>
  <table class="tcap-tbl">
    <thead>
      <tr>
        <th rowspan="3" class="l">Training Area</th>
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
    </thead>
    <tbody>${body}${grandRow}</tbody>
  </table>`;
}

function renderThematicDetailTable(blockTitle, detailRows, grandTotal) {
    const body = (detailRows || []).map((r) => `
      <tr>
        <td class="l">${esc(r.thematicAreaName)}</td>
        ${participantCells(r)}
      </tr>`).join('');
    const gt = grandTotal || {};
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc('Total')}</td>
        ${participantCells(gt)}
      </tr>`;
    return `
  <div class="tcap-block-title">Details of training program for ${esc(blockTitle)}</div>
  <table class="tcap-tbl">
    <thead>
      <tr>
        <th rowspan="3" class="l">Thematic Area</th>
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
    </thead>
    <tbody>${body}${grandRow}</tbody>
  </table>`;
}

function renderTrainingTypeBlock(block, y) {
    let html = `
  <div class="tcap-type-wrap">
    <div class="tcap-type-heading">Section ${esc(block.letter)} — ${esc(sectionLabel(block))}</div>`;
    html += renderStateTable(block, y);
    html += renderTrainingAreaSummaryTable(block, y);
    const blocks = block.thematicDetailBlocks || [];
    for (const b of blocks) {
        html += renderThematicDetailTable(b.trainingAreaName, b.rows, b.grandTotal);
    }
    html += `
  </div>`;
    return html;
}

function renderTrainingCapacityReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveTrainingCapacityPayload(data);
    const hasData = payload.sections && payload.sections.length > 0;
    const y = payload.yearLabel || '';

    if (!hasData) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    const blocksHtml = (payload.sections || []).map((b) => renderTrainingTypeBlock(b, y)).join('');

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
