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
  .tcap-type-wrap { margin-bottom:10px; }
  .tcap-type-heading { font-size:6.75pt; font-weight:bold; margin:8px 0 4px 0; padding-bottom:2px; border-bottom:0.5pt solid #999; }
  .tcap-type-wrap:first-child .tcap-type-heading { margin-top:0; }
  .tcap-sub { font-size:6.25pt; font-weight:bold; margin:4px 0 2px 0; page-break-after:avoid; break-after:avoid-page; }
  .tcap-block-title { font-size:6.25pt; font-weight:bold; margin:8px 0 3px 0; }
  .tcap-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:auto; }
  .tcap-tbl th, .tcap-tbl td { border:0.35pt solid #000; padding:1px 1.5px; vertical-align:middle; text-align:center; word-break:normal; overflow-wrap:normal; }
  .tcap-tbl thead { display:table-header-group; }
  .tcap-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .tcap-tbl tr { page-break-inside:avoid; break-inside:avoid-page; }
  .tcap-tbl .l { text-align:left; white-space:normal; overflow-wrap:anywhere; }
  .tcap-tbl .grand { font-weight:bold; background:#f5f5f5; }
  .tcap-tbl .area-row td { font-weight:bold; background:rgba(31, 110, 67, 0.10); }
  .tcap-tbl .indent { padding-left:10px; }
  .tcap-kvk-split { font-size:4.2pt; }
  .tcap-kvk-split thead th { line-height:1.05; }
  .tcap-kvk-split .participant-col { width:2.25%; }
  .tcap-kvk-split .course-col { width:3.2%; }
  .tcap-kvk-split .label-col { width:18%; }
  .tcap-kvk-consolidated { font-size:4.8pt; }
  .tcap-kvk-consolidated .participant-col { width:3.6%; }
  .tcap-kvk-consolidated .course-col { width:4.5%; }
  .tcap-kvk-consolidated .label-col { width:20%; }
  .tcap-sponsored { font-size:4.6pt; }
  .tcap-sponsored thead th { word-break:keep-all; overflow-wrap:normal; white-space:normal; }
  .tcap-sponsored .sr-col { width:3%; }
  .tcap-sponsored .title-col { width:17.5%; }
  .tcap-sponsored .thematic-col { width:11%; }
  .tcap-sponsored .month-col { width:4%; }
  .tcap-sponsored .duration-col { width:4.5%; }
  .tcap-sponsored .client-col { width:7.5%; }
  .tcap-sponsored .course-col { width:3.5%; }
  .tcap-sponsored .participant-col { width:3.5%; }
  .tcap-sponsored .agency-col { width:11.5%; }
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

function campusParticipantCells(row) {
    const on = row.onCampus || {};
    const off = row.offCampus || {};
    return `
        <td>${fmtInt(on.courses)}</td>
        <td>${fmtInt(on.generalM)}</td>
        <td>${fmtInt(on.generalF)}</td>
        <td>${fmtInt(on.genT)}</td>
        <td>${fmtInt(on.obcM)}</td>
        <td>${fmtInt(on.obcF)}</td>
        <td>${fmtInt(on.obcT)}</td>
        <td>${fmtInt(on.scM)}</td>
        <td>${fmtInt(on.scF)}</td>
        <td>${fmtInt(on.scT)}</td>
        <td>${fmtInt(on.stM)}</td>
        <td>${fmtInt(on.stF)}</td>
        <td>${fmtInt(on.stT)}</td>
        <td>${fmtInt(on.grandM)}</td>
        <td>${fmtInt(on.grandF)}</td>
        <td>${fmtInt(on.grandT)}</td>
        <td>${fmtInt(off.courses)}</td>
        <td>${fmtInt(off.generalM)}</td>
        <td>${fmtInt(off.generalF)}</td>
        <td>${fmtInt(off.genT)}</td>
        <td>${fmtInt(off.obcM)}</td>
        <td>${fmtInt(off.obcF)}</td>
        <td>${fmtInt(off.obcT)}</td>
        <td>${fmtInt(off.scM)}</td>
        <td>${fmtInt(off.scF)}</td>
        <td>${fmtInt(off.scT)}</td>
        <td>${fmtInt(off.stM)}</td>
        <td>${fmtInt(off.stF)}</td>
        <td>${fmtInt(off.stT)}</td>
        <td>${fmtInt(off.grandM)}</td>
        <td>${fmtInt(off.grandF)}</td>
        <td>${fmtInt(off.grandT)}</td>`;
}

function renderGlobalStateTable(stateSummary, y) {
    const rows = (stateSummary && stateSummary.rows) || [];
    const gt = (stateSummary && stateSummary.grandTotal) || {};
    if (rows.length === 0) return '';
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
  <div class="tcap-sub">State-wise details of training programme${y ? ` for ${esc(y)}` : ''}</div>
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
  <div class="tcap-sub">Training area wise details of training programs of ${esc(sectionLabel(block))}${y ? ` for ${esc(y)}` : ''}</div>
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
    html += renderTrainingAreaSummaryTable(block, y);
    const blocks = block.thematicDetailBlocks || [];
    for (const b of blocks) {
        html += renderThematicDetailTable(b.trainingAreaName, b.rows, b.grandTotal);
    }
    html += `
  </div>`;
    return html;
}

function renderKvkConsolidatedTable(block) {
    const rows = block.rows || [];
    const body = rows.map((row) => {
        if (row.kind === 'area') {
            return `<tr class="area-row"><td class="l">${esc(row.trainingAreaName)}</td><td></td>${'<td></td>'.repeat(15)}</tr>`;
        }
        if (row.kind === 'subtotal') {
            return `<tr class="grand"><td class="l">${esc(row.label || 'Sub Total')}</td>${participantCells(row)}</tr>`;
        }
        return `<tr><td class="l indent">${esc(row.thematicAreaName)}</td>${participantCells(row)}</tr>`;
    }).join('');

    return `
  <div class="tcap-type-wrap">
    <div class="tcap-type-heading">${esc(block.trainingTypeName)}</div>
    <table class="tcap-tbl tcap-kvk-consolidated">
      <colgroup>
        <col class="label-col" />
        <col class="course-col" />
        ${'<col class="participant-col" />'.repeat(15)}
      </colgroup>
      <thead>
        <tr>
          <th rowspan="3" class="l">Training Area with Thematic Area</th>
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
      <tbody>${body || `<tr><td colspan="17">No data available.</td></tr>`}</tbody>
    </table>
  </div>`;
}

function renderSuperadminClienteleTable(block) {
    const rows = block.rows || [];
    const body = rows.map((row) => {
        if (row.kind === 'area') {
            return `<tr class="area-row"><td class="l">${esc(row.trainingAreaName)}</td><td></td>${'<td></td>'.repeat(15)}</tr>`;
        }
        if (row.kind === 'subtotal') {
            return `<tr class="grand"><td class="l">${esc(row.label || 'Sub Total')}</td>${participantCells(row)}</tr>`;
        }
        return `<tr><td class="l indent">${esc(row.thematicAreaName)}</td>${participantCells(row)}</tr>`;
    }).join('');

    return `
  <div class="tcap-type-wrap">
    <div class="tcap-type-heading">${esc(block.clienteleName)}</div>
    <table class="tcap-tbl tcap-kvk-consolidated">
      <colgroup>
        <col class="label-col" />
        <col class="course-col" />
        ${'<col class="participant-col" />'.repeat(15)}
      </colgroup>
      <thead>
        <tr>
          <th rowspan="3" class="l">Training Area with Thematic Area</th>
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
      <tbody>${body || `<tr><td colspan="17">No data available.</td></tr>`}</tbody>
    </table>
  </div>`;
}

function renderKvkCampusSplitTable(block) {
    const rows = block.rows || [];
    const body = rows.map((row) => {
        if (row.kind === 'area') {
            return `<tr class="area-row"><td class="l">${esc(row.trainingAreaName)}</td>${'<td></td>'.repeat(32)}</tr>`;
        }
        if (row.kind === 'subtotal') {
            return `<tr class="grand"><td class="l">${esc(row.label || 'Sub Total')}</td>${campusParticipantCells(row)}</tr>`;
        }
        return `<tr><td class="l indent">${esc(row.thematicAreaName)}</td>${campusParticipantCells(row)}</tr>`;
    }).join('');

    return `
  <div class="tcap-type-wrap">
    <div class="tcap-type-heading">${esc(block.trainingTypeName)}</div>
    <table class="tcap-tbl tcap-kvk-split">
      <colgroup>
        <col class="label-col" />
        <col class="course-col" />
        ${'<col class="participant-col" />'.repeat(15)}
        <col class="course-col" />
        ${'<col class="participant-col" />'.repeat(15)}
      </colgroup>
      <thead>
        <tr>
          <th rowspan="4" class="l">Training Area with Thematic Area</th>
          <th colspan="16">ON CAMPUS</th>
          <th colspan="16">OFF CAMPUS</th>
        </tr>
        <tr>
          <th>No. of Courses</th>
          <th colspan="12">No. of Participants</th>
          <th colspan="3">TOTAL</th>
          <th>No. of Courses</th>
          <th colspan="12">No. of Participants</th>
          <th colspan="3">TOTAL</th>
        </tr>
        <tr>
          <th></th>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
          <th rowspan="2">M</th><th rowspan="2">F</th><th rowspan="2">T</th>
          <th></th>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
          <th rowspan="2">M</th><th rowspan="2">F</th><th rowspan="2">T</th>
        </tr>
        <tr>
          <th></th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th></th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
        </tr>
      </thead>
      <tbody>${body || `<tr><td colspan="33">No data available.</td></tr>`}</tbody>
    </table>
  </div>`;
}

function renderSponsoredProgrammesTable(rows) {
    const body = (rows || []).map((row) => `
      <tr>
        <td>${fmtInt(row.srNo)}</td>
        <td class="l">${esc(row.trainingTitle)}</td>
        <td class="l">${esc(row.thematicAreaName)}</td>
        <td>${fmtInt(row.month)}</td>
        <td>${fmtInt(row.durationDays)}</td>
        <td>${esc(row.clientCode)}</td>
        <td>${fmtInt(row.courses)}</td>
        <td>${fmtInt(row.generalM)}</td><td>${fmtInt(row.generalF)}</td><td>${fmtInt(row.genT)}</td>
        <td>${fmtInt(row.obcM)}</td><td>${fmtInt(row.obcF)}</td><td>${fmtInt(row.obcT)}</td>
        <td>${fmtInt(row.scM)}</td><td>${fmtInt(row.scF)}</td><td>${fmtInt(row.scT)}</td>
        <td>${fmtInt(row.stM)}</td><td>${fmtInt(row.stF)}</td><td>${fmtInt(row.stT)}</td>
        <td>${fmtInt(row.grandM)}</td><td>${fmtInt(row.grandF)}</td><td>${fmtInt(row.grandT)}</td>
        <td class="l">${esc(row.sponsoringAgency)}</td>
      </tr>`).join('');

    return `
  <table class="tcap-tbl tcap-sponsored">
    <colgroup>
      <col class="sr-col" />
      <col class="title-col" />
      <col class="thematic-col" />
      <col class="month-col" />
      <col class="duration-col" />
      <col class="client-col" />
      <col class="course-col" />
      ${'<col class="participant-col" />'.repeat(15)}
      <col class="agency-col" />
    </colgroup>
    <thead>
      <tr>
        <th rowspan="3">Sr. No.</th>
        <th rowspan="3">Training title</th>
        <th rowspan="3">Thematic area</th>
        <th rowspan="3">Month</th>
        <th rowspan="3">Duration (Days)</th>
        <th rowspan="3">Client(PF/RY/EF)</th>
        <th rowspan="3">No. Of Courses</th>
        <th colspan="12">No. of Participants</th>
        <th colspan="3">Grand Total</th>
        <th rowspan="3">Sponsoring Agency</th>
      </tr>
      <tr>
        <th colspan="3">General</th>
        <th colspan="3">OBC</th>
        <th colspan="3">SC</th>
        <th colspan="3">ST</th>
        <th rowspan="2">M</th><th rowspan="2">F</th><th rowspan="2">T</th>
      </tr>
      <tr>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
      </tr>
    </thead>
    <tbody>${body || `<tr><td colspan="23">No data available.</td></tr>`}</tbody>
  </table>`;
}

function renderKvkTrainingCapacityReport(section, payload, sectionId, isFirstSection) {
    const y = payload.yearLabel || '';
    const consolidated = payload.kvkConsolidatedSections || [];
    const campus = payload.kvkCampusSections || [];
    const sponsored = payload.sponsoredProgrammeRows || [];
    const hasData = consolidated.some((b) => (b.rows || []).length > 0)
        || campus.some((b) => (b.rows || []).length > 0)
        || sponsored.length > 0;

    if (!hasData) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="tcap-wrap">
    <div class="tcap-sub">${section.id}.A - Consolidate table (On & Off Campus) Training Type Wise${y ? ` for ${esc(y)}` : ''}</div>
    ${(consolidated || []).map((b) => renderKvkConsolidatedTable(b)).join('')}
    <div class="tcap-sub">${section.id}.B - Separate On Campus and Off Campus Training Type Wise${y ? ` for ${esc(y)}` : ''}</div>
    ${(campus || []).map((b) => renderKvkCampusSplitTable(b)).join('')}
    <div class="tcap-sub">${section.id}.C - Sponsored Training Programmes${y ? ` for ${esc(y)}` : ''}</div>
    ${renderSponsoredProgrammesTable(sponsored)}
  </div>
</div>`;
}

function renderSuperadminTrainingCapacityReport(section, payload, sectionId, isFirstSection) {
    const clienteleSections = payload.superadminClienteleSections || [];
    const consolidatedSections = payload.kvkConsolidatedSections || [];
    const hasData = (payload.stateSummary?.rows || []).length > 0
        || consolidatedSections.length > 0
        || clienteleSections.length > 0;
    const y = payload.yearLabel || '';

    if (!hasData) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    const stateTable = renderGlobalStateTable(payload.stateSummary, y);
    const consolidatedHtml = (consolidatedSections || []).map((b) => renderKvkConsolidatedTable(b)).join('');
    const clienteleHtml = (clienteleSections || []).map((b) => renderSuperadminClienteleTable(b)).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="tcap-wrap">
    <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
    ${stateTable}
    <div class="tcap-sub">${section.id}.A - Consolidate table (On & Off Campus) Training Type Wise${y ? ` for ${esc(y)}` : ''}</div>
    ${consolidatedHtml}
    <div class="tcap-sub">${section.id}.C - Consolidate table (On & Off Campus) Clientele Wise${y ? ` for ${esc(y)}` : ''}</div>
    ${clienteleHtml}
  </div>
</div>`;
}

function renderTrainingCapacityReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const payload = resolveTrainingCapacityPayload(data);
    if (reportContext.isAggregatedView) {
        return renderSuperadminTrainingCapacityReport(section, payload, sectionId, isFirstSection);
    }
    return renderKvkTrainingCapacityReport(section, payload, sectionId, isFirstSection);
}

module.exports = {
    renderTrainingCapacityReportSection,
};
