const { resolveTrainingsPageReportPayload } = require('../../../../repositories/reports/trainingsPageReport/trainingsPageReportPayload.js');

const MAIN_TITLE = '3.4 ACHIEVEMENTS ON TRAINING / CAPACITY BUILDING PROGRAMMES';
const SUBTITLE = '(Mandated KVK trainings / sponsored training / FLD training programmes)';

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
  .tp-wrap { width:100%; font-size:5pt; line-height:1.12; }
  .tp-main-title { text-align:center; font-size:9pt; font-weight:bold; margin:0 0 4px 0; }
  .tp-subtitle { text-align:center; font-size:6.5pt; margin:0 0 12px 0; }
  .tp-sec { font-size:7pt; font-weight:bold; margin:14px 0 6px 0; padding-bottom:3px; border-bottom:0.5pt solid #666; }
  .tp-sub { font-size:6.5pt; font-weight:bold; margin:10px 0 4px 0; }
  .tp-type { font-size:6.5pt; font-weight:bold; margin:12px 0 4px 0; }
  .tp-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .tp-tbl th, .tp-tbl td { border:0.35pt solid #000; padding:1px 2px; vertical-align:middle; text-align:center; word-break:break-word; }
  .tp-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .tp-tbl .l { text-align:left; }
  .tp-tbl .grand { font-weight:bold; background:#f5f5f5; }
  .tp-c-detail { font-size:4.5pt; }
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

function thematicTableHead() {
    return `
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
    </thead>`;
}

function renderThematicTable(rows, grandTotal, yearLabel, caption) {
    const body = (rows || []).map((r) => `
      <tr>
        <td class="l">${esc(r.thematicAreaName)}</td>
        ${participantCells(r)}
      </tr>`).join('');
    const gt = grandTotal || {};
    const grandRow = `
      <tr class="grand">
        <td class="l">${esc('Sub Total')}</td>
        ${participantCells(gt)}
      </tr>`;
    return `
  <div class="tp-sub">${esc(caption)} during the year ${esc(yearLabel)}</div>
  <table class="tp-tbl">
    ${thematicTableHead()}
    <tbody>${body}${grandRow}</tbody>
  </table>`;
}

function renderCampusBlock(block, yearLabel) {
    if (!block || !block.rowCount) {
        return `<p class="tp-sub">No trainings recorded.</p>`;
    }
    return renderThematicTable(block.thematicRows, block.grandTotal, yearLabel, block.label);
}

function renderSectionA(payload) {
    const y = payload.yearLabel || '';
    let html = `<div class="tp-sec">A. Consolidated summary (On and Off Campus combined)</div>`;
    for (const block of payload.sectionA || []) {
        html += `
  <div class="tp-type">${esc(block.index)}. ${esc(block.trainingTypeName)}</div>`;
        html += renderThematicTable(block.thematicRows, block.grandTotal, y,
            `Thematic area wise summary (all venues)`);
    }
    return html;
}

function renderSectionB(payload) {
    const y = payload.yearLabel || '';
    let html = `<div class="tp-sec">B. Training-wise details by campus (On Campus, then Off Campus)</div>`;
    for (const block of payload.sectionB || []) {
        html += `
  <div class="tp-type">${esc(block.index)}. ${esc(block.trainingTypeName)}</div>`;
        html += `<div class="tp-sub">${esc(block.onCampus.label)}</div>`;
        html += renderCampusBlock(block.onCampus, y);
        html += `<div class="tp-sub">${esc(block.offCampus.label)}</div>`;
        html += renderCampusBlock(block.offCampus, y);
        if (block.unspecifiedCampus) {
            html += `<div class="tp-sub">${esc(block.unspecifiedCampus.label)}</div>`;
            html += renderCampusBlock(block.unspecifiedCampus, y);
        }
    }
    return html;
}

function detailParticipantCells(row) {
    return participantCells(row);
}

function renderSectionC(payload) {
    const rows = payload.sectionC || [];
    if (rows.length === 0) {
        return `<div class="tp-sec">C. Training details</div><p>No records.</p>`;
    }
    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.discipline)}</td>
        <td class="l">${esc(r.clientele)}</td>
        <td class="l">${esc(r.title)}</td>
        <td>${esc(r.dateRange)}</td>
        <td>${esc(r.durationDays)}</td>
        <td class="l">${esc(r.venue)}</td>
        <td>${esc(r.campusLabel)}</td>
        ${detailParticipantCells(r)}
      </tr>`).join('');
    return `
  <div class="tp-sec">C. Report with training details</div>
  <table class="tp-tbl tp-c-detail">
    <thead>
      <tr>
        <th rowspan="3" class="l">Discipline</th>
        <th rowspan="3" class="l">Clientele</th>
        <th rowspan="3" class="l">Title of the Training</th>
        <th rowspan="3">Date</th>
        <th rowspan="3">Duration (Days)</th>
        <th rowspan="3" class="l">Venue</th>
        <th rowspan="3">Campus</th>
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
    <tbody>${body}</tbody>
  </table>`;
}

function renderTrainingsPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveTrainingsPageReportPayload(data);
    const hasAny = (payload.sectionA && payload.sectionA.length > 0)
        || (payload.sectionC && payload.sectionC.length > 0);

    if (!hasAny) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No training data available for export.</p>
</div>`;
    }

    const inner = `
    <div class="tp-main-title">${esc(MAIN_TITLE)}</div>
    <div class="tp-subtitle">${esc(SUBTITLE)}</div>
    ${renderSectionA(payload)}
    ${renderSectionB(payload)}
    ${renderSectionC(payload)}
`;

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="tp-wrap">
    <h1 class="section-title" style="display:none">${this._escapeHtml(section.title)}</h1>
    ${inner}
  </div>
</div>`;
}

module.exports = {
    renderTrainingsPageReportSection,
};
