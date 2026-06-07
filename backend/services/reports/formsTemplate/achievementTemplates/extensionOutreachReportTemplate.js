const { resolveExtensionOutreachPayload } = require('../../../../repositories/reports/extensionOutreachReport/extensionOutreachReportRepository.js');
const { outreachTableCss, renderOutreachTable } = require('./extensionOutreachHelpers.js');

function tableCss() {
    return `
  .wsd-page-wrap { width:100%; font-size:5.5pt; line-height:1.15; }
  .wsd-page-title { font-size:8pt; font-weight:bold; margin:0 0 4px 0; }
  .wsd-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .wsd-page-tbl th, .wsd-page-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; }
  .wsd-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .wsd-page-tbl .c { text-align:center; }
  .wsd-page-tbl .l { text-align:left; }
  .wsd-page-tbl .muted { color:#444; font-size:6pt; margin:4px 0 8px 0; }
`;
}
function renderExtensionOutreachReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveExtensionOutreachPayload(data);
    const y = payload.yearLabel || '';
    const hasData = (payload.stateSummary && payload.stateSummary.length > 0)
        || (payload.activityDetails && payload.activityDetails.length > 0);

    if (!hasData) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No extension activity data available for this period.</p>
</div>`;
    }

    const t1 = `${section.id} ${section.title}`;
    const sub = '(Including activities of FLD programmes)';

    const stateBlock = renderOutreachTable(
        'State',
        payload.stateSummary,
        payload.stateGrandTotal,
        'A. State wise details of Extension Programme',
        y,
    );
    const actBlock = renderOutreachTable(
        'Nature of Extension Activity',
        payload.activityDetails,
        payload.activityGrandTotal,
        'B. Details of various extension Programmes',
        y,
    );

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()} ${outreachTableCss()}</style>
  <div class="eox-wrap">
    <h1 class="section-title">${this._escapeHtml(t1)}</h1>
    <div class="">${this._escapeHtml(sub)}</div>
    ${stateBlock}
    ${actBlock}
  </div>
</div>`;
}

module.exports = {
    renderExtensionOutreachReportSection,
};
