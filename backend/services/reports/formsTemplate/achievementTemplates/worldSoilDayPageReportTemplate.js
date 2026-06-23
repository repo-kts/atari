const { resolveWorldSoilDayGroupedPayload } = require('../../../../repositories/reports/worldSoilDayReport/worldSoilDayReportRepository.js');

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
  .wsd-page-wrap { width:100%; font-size:6pt; line-height:1.15; }
  .wsd-page-title { font-size:8pt; font-weight:bold; margin:0 0 4px 0; }
  .wsd-group { margin-bottom:8px; page-break-inside:avoid; break-inside:avoid; }
  .wsd-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; border-bottom:0; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
  .wsd-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
  .wsd-page-tbl th, .wsd-page-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .wsd-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .wsd-page-tbl .c { text-align:center; }
  .wsd-page-tbl .l { text-align:left; }
  .wsd-page-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .wsd-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function colGroup() {
    return `
  <colgroup>
    <col style="width:5%" />
    <col style="width:13%" />
    <col style="width:15%" />
    <col style="width:14%" />
    <col style="width:9%" />
    <col style="width:30%" />
    <col style="width:14%" />
  </colgroup>`;
}

function headHtml() {
    return `
      <thead>
        <tr>
          <th>Sl.</th>
          <th>No. of Activity conducted</th>
          <th>Soil Health Cards distributed</th>
          <th>No. of farmers benefitted</th>
          <th>No. of VIPs</th>
          <th class="l">Name(s) of VIP(s) involved if any</th>
          <th>Total No. of Participants attended the program</th>
        </tr>
      </thead>`;
}

function dataRow(r) {
    return `
      <tr>
        <td class="c">${fmtInt(r.sl)}</td>
        <td class="c">${fmtInt(r.activitiesConducted)}</td>
        <td class="c">${fmtInt(r.soilHealthCards)}</td>
        <td class="c">${fmtInt(r.farmersBenefitted)}</td>
        <td class="c">${fmtInt(r.vipCount)}</td>
        <td class="l">${esc(r.vipNames)}</td>
        <td class="c">${fmtInt(r.participants)}</td>
      </tr>`;
}

function totalRow(r, cls) {
    return `
      <tr class="${cls}">
        <td class="c">—</td>
        <td class="l">${esc(r.label)}</td>
        <td class="c">${fmtInt(r.soilHealthCards)}</td>
        <td class="c">${fmtInt(r.farmersBenefitted)}</td>
        <td class="c">${fmtInt(r.vipCount)}</td>
        <td class="l"></td>
        <td class="c">${fmtInt(r.participants)}</td>
      </tr>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map((r) => dataRow(r)).join('');
    const sub = totalRow(g.subtotal, 'sub');
    const kvkHd = showKvkHeader ? `<div class="wsd-kvk-hd">${esc(g.kvkName)}</div>` : '';
    return `
    <div class="wsd-group">${kvkHd}
      <table class="wsd-page-tbl">${colGroup()}${headHtml()}
        <tbody>${body}${sub}</tbody>
      </table>
    </div>`;
}

function renderWorldSoilDayPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveWorldSoilDayGroupedPayload(data);
    const groups = payload.groups || [];

    if (groups.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No World Soil Day celebration data for this period.</p>
</div>`;
    }

    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
    <div class="wsd-group">
      <table class="wsd-page-tbl">${colGroup()}${headHtml()}
        <tbody>${totalRow(payload.grandTotal, 'grand')}</tbody>
      </table>
    </div>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="wsd-page-wrap">
    <div class="wsd-page-title">7. SOIL &amp; WATER TESTING</div>
    <div class="wsd-page-title">d. Details of World Soil Day Celebration</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderWorldSoilDayPageReportSection,
};
