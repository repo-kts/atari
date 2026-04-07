const { resolveExtensionOutreachPayload } = require('../../../../repositories/reports/extensionOutreachReport/extensionOutreachReportRepository.js');
const { outreachTableCss, renderOutreachTable } = require('./extensionOutreachHelpers.js');

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
  <style>${outreachTableCss()}</style>
  <div class="eox-wrap">
    <div class="eox-title">${this._escapeHtml(t1)}</div>
    <div class="eox-sub">${this._escapeHtml(sub)}</div>
    ${stateBlock}
    ${actBlock}
  </div>
</div>`;
}

module.exports = {
    renderExtensionOutreachReportSection,
};
