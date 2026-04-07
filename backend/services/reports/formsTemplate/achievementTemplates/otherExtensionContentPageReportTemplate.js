const { resolveOtherExtensionPagePayload } = require('../../../../repositories/reports/otherExtensionContentReport/otherExtensionContentReportRepository.js');

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
  .oec-page-wrap { width:100%; font-size:7pt; line-height:1.2; }
  .oec-page-sec { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .oec-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:10px; page-break-inside:avoid; }
  .oec-page-tbl th, .oec-page-tbl td { border:0.35pt solid #000; padding:3px 5px; vertical-align:middle; }
  .oec-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .oec-page-tbl .l { text-align:left; }
  .oec-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function renderOtherExtensionContentPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveOtherExtensionPagePayload(data);
    const rows = payload.rows || [];
    const y = payload.yearLabel || '';

    if (rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No other extension activity data for export.</p>
</div>`;
    }

    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.label)}</td>
        <td>${fmtInt(r.numActivities)}</td>
      </tr>`).join('');

    const grandRow = `
      <tr class="grand">
        <td class="l">${esc('Total')}</td>
        <td>${fmtInt(payload.grandTotal)}</td>
      </tr>`;

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="oec-page-wrap">
    <div class="oec-page-sec">B. Other Extension/content mobilization activities${y ? ` — year ${esc(y)}` : ''}</div>
    <table class="oec-page-tbl">
      <thead>
        <tr>
          <th class="l">Nature of Extension Activity</th>
          <th>No. of activities</th>
        </tr>
      </thead>
      <tbody>${body}${grandRow}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderOtherExtensionContentPageReportSection,
};
