const { resolveWorldSoilDayPagePayload } = require('../../../../repositories/reports/worldSoilDayReport/worldSoilDayReportRepository.js');

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

function renderWorldSoilDayPageReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const isAgg = Boolean(reportContext.isAggregatedReport);
    const payload = resolveWorldSoilDayPagePayload(data, { isAggregatedReport: isAgg });
    const rows = payload.rows || [];
    const y = payload.yearLabel || '';

    if (rows.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No World Soil Day celebration data for this period.</p>
</div>`;
    }

    if (isAgg) {
        const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.stateName)}</td>
        <td class="c">${fmtInt(r.noOfKvks)}</td>
        <td class="c">${fmtInt(r.farmersBenefitted)}</td>
        <td class="c">${fmtInt(r.soilHealthCards)}</td>
        <td class="c">${fmtInt(r.participants)}</td>
        <td class="c">${fmtInt(r.vipsAttended)}</td>
      </tr>`).join('');

        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="wsd-page-wrap">
    <h1 class="section-title">${this._escapeHtml(section.id)} State wise Details of World Soil Day Celebration at KVKs</h1>
    <p class="muted">${esc(`(Reporting year ${y})`)}</p>
    <table class="wsd-page-tbl">
      <thead>
        <tr>
          <th class="l">State</th>
          <th>No. of KVKs</th>
          <th>No. of farmers benefitted</th>
          <th>Soil Health Cards distributed</th>
          <th>No. of Participants</th>
          <th>No. of VIPs attended</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
    }

    const body = rows.map((r) => `
      <tr>
        <td class="c">${fmtInt(r.sl)}</td>
        <td class="c">${fmtInt(r.activitiesConducted)}</td>
        <td class="c">${fmtInt(r.soilHealthCards)}</td>
        <td class="c">${fmtInt(r.farmersBenefitted)}</td>
        <td class="c">${fmtInt(r.vipCount)}</td>
        <td class="l">${esc(r.vipNames)}</td>
        <td class="c">${fmtInt(r.participants)}</td>
      </tr>`).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="wsd-page-wrap">
    <div class="wsd-page-title">7. SOIL &amp; WATER TESTING</div>
    <div class="wsd-page-title">d. Details of World Soil Day Celebration</div>
    ${y ? `<div class="muted">Reporting year ${esc(y)}</div>` : ''}
    <table class="wsd-page-tbl">
      <thead>
        <tr>
          <th>Sl.</th>
          <th>No. of Activity conducted</th>
          <th>Soil Health Cards distributed</th>
          <th>No. of farmers benefitted</th>
          <th>No. of VIPs</th>
          <th class="l">Name (s) of VIP(s) involved if any</th>
          <th>Total No. of Participants attended the program</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderWorldSoilDayPageReportSection,
};
