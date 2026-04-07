const { resolveAgriDroneIntroductionPayload } = require('../../../../repositories/reports/agriDroneReport/agriDroneIntroductionReportRepository.js');

const TABLE_CAPTION = 'Information of Agri Drone project implementation by the different Institutions/KVK';

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function tableCss() {
    return `
  .ad-intro-wrap { width:100%; font-size:7pt; line-height:1.25; }
  .ad-intro-caption { text-align:center; font-size:9pt; font-weight:bold; margin:0 0 8px 0; }
  .ad-intro-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:avoid; }
  .ad-intro-tbl th, .ad-intro-tbl td { border:0.35pt solid #000; padding:3px 4px; vertical-align:top; word-break:break-word; }
  .ad-intro-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .ad-intro-tbl td:nth-child(1) { width:8%; text-align:center; }
  .ad-intro-tbl td:nth-child(2) { width:42%; text-align:left; }
  .ad-intro-tbl td:nth-child(3) { width:50%; text-align:left; }
  .ad-intro-spacer td { border:none; height:10px; padding:4px 0; }
`;
}

function renderIntroTable(rows) {
    const body = (rows && rows.length > 0)
        ? rows.map((r) => {
            if (r._spacer) {
                return '<tr class="ad-intro-spacer"><td colspan="3"></td></tr>';
            }
            return `
      <tr>
        <td>${esc(r.sNo)}</td>
        <td>${esc(r.parameterName)}</td>
        <td>${esc(r.details)}</td>
      </tr>`;
        }).join('')
        : `<tr><td colspan="3">${esc('No data')}</td></tr>`;

    return `
  <table class="ad-intro-tbl">
    <thead>
      <tr>
        <th>S.No.</th>
        <th>Name of parameter</th>
        <th>Details of parameter</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

function renderAgriDroneIntroductionSection(section, data, sectionId, isFirstSection) {
    const payload = resolveAgriDroneIntroductionPayload(data);
    const rows = payload.rows || [];

    if (rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="ad-intro-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="ad-intro-caption">${esc(TABLE_CAPTION)}</div>
    ${renderIntroTable(rows)}
  </div>
</div>`;
}

module.exports = {
    renderAgriDroneIntroductionSection,
};
