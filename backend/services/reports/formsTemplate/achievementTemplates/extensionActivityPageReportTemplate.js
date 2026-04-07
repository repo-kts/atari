const { resolveExtensionActivityPagePayload } = require('../../../../repositories/reports/extensionOutreachReport/extensionOutreachReportRepository.js');
const { outreachTableCss, renderOutreachTable } = require('./extensionOutreachHelpers.js');

const PAGE_TITLE = '3.5 A. ACHIEVEMENTS OF EXTENSION/OUTREACH ACTIVITIES';
const PAGE_SUB = '(Including activities of FLD programmes)';

function renderExtensionActivityPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveExtensionActivityPagePayload(data);
    const y = payload.yearLabel || '';
    const rows = payload.rows || [];
    if (rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No extension activity data available for export.</p>
</div>`;
    }

    const table = renderOutreachTable(
        'Nature of Extension Activity',
        rows,
        payload.grandTotal,
        'Extension / outreach summary',
        y,
    );

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${outreachTableCss()}</style>
  <div class="eox-wrap">
    <div class="eox-title">${PAGE_TITLE}</div>
    <div class="eox-sub">${PAGE_SUB}</div>
    ${table}
  </div>
</div>`;
}

module.exports = {
    renderExtensionActivityPageReportSection,
};
