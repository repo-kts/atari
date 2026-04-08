const { resolveAgriDroneDemonstrationDetailsPayload } = require('../../../../repositories/reports/agriDroneReport/agriDroneDemonstrationDetailsReportRepository.js');

const CAPTION = 'Details of Demonstrations under Agri-drone Project';

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function num(n) {
    if (n === null || n === undefined || n === '') return '—';
    const v = Number(n);
    return Number.isFinite(v) ? String(v) : '—';
}

function tableCss() {
    return `
  .ad-demo-wrap { width:100%; font-size:5.5pt; line-height:1.15; }
  .ad-demo-caption { text-align:center; font-size:8pt; font-weight:bold; margin:0 0 6px 0; }
  .ad-demo-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:auto; }
  .ad-demo-tbl th, .ad-demo-tbl td { border:0.35pt solid #000; padding:2px 2px; vertical-align:middle; text-align:center; word-break:break-word; }
  .ad-demo-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .ad-demo-tbl td.l { text-align:left; }
`;
}

function renderBody(rows) {
    return rows.map((r) => `
      <tr>
        <td class="l">${esc(r.demonstrationsOn)}</td>
        <td class="l">${esc(r.districtName)}</td>
        <td>${esc(r.dateOfDemonstration)}</td>
        <td class="l">${esc(r.placeOfDemonstration)}</td>
        <td class="l">${esc(r.cropName)}</td>
        <td>${esc(r.noOfDemos)}</td>
        <td>${esc(r.areaHa)}</td>
        <td>${num(r.generalM)}</td><td>${num(r.generalF)}</td><td>${num(r.generalT)}</td>
        <td>${num(r.obcM)}</td><td>${num(r.obcF)}</td><td>${num(r.obcT)}</td>
        <td>${num(r.scM)}</td><td>${num(r.scF)}</td><td>${num(r.scT)}</td>
        <td>${num(r.stM)}</td><td>${num(r.stF)}</td><td>${num(r.stT)}</td>
        <td>${num(r.grandM)}</td><td>${num(r.grandF)}</td><td>${num(r.grandT)}</td>
      </tr>`).join('');
}

function renderAgriDroneDemonstrationDetailsSection(section, data, sectionId, isFirstSection) {
    const payload = resolveAgriDroneDemonstrationDetailsPayload(data);
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
  <div class="ad-demo-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="ad-demo-caption">${esc(CAPTION)}</div>
    <table class="ad-demo-tbl">
      <thead>
        <tr>
          <th rowspan="3">Demos on</th>
          <th rowspan="3">Name of district</th>
          <th rowspan="3">Date of demonstration</th>
          <th rowspan="3">Place of demonstration</th>
          <th rowspan="3">Crop Name</th>
          <th rowspan="3">No. of demos</th>
          <th rowspan="3">Area covered under demos (area in ha)</th>
          <th colspan="12">No. of Participants</th>
          <th colspan="3" rowspan="2">Grand Total</th>
        </tr>
        <tr>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
        </tr>
        <tr>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
        </tr>
      </thead>
      <tbody>${renderBody(rows)}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderAgriDroneDemonstrationDetailsSection,
};
