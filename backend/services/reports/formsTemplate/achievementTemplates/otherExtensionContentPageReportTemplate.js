const { resolveOtherExtensionDetailedPayload } = require('../../../../repositories/reports/otherExtensionContentReport/otherExtensionContentReportRepository.js');

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

function fmtDate(v) {
    return v ? esc(v) : '—';
}

function tableCss() {
    return `
  .oec-page-wrap { width:100%; font-size:7pt; line-height:1.2; }
  .oec-page-sec { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .oec-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; }
  .oec-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:avoid; }
  .oec-page-tbl th, .oec-page-tbl td { border:0.35pt solid #000; padding:2px 4px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .oec-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .oec-page-tbl .l { text-align:left; }
  .oec-page-tbl .c { text-align:center; }
  .oec-page-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .oec-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

// Column widths sum to 100% — fits a portrait page without cropping.
function colGroup() {
    return `
  <colgroup>
    <col style="width:5%" />
    <col style="width:30%" />
    <col style="width:21%" />
    <col style="width:12%" />
    <col style="width:11%" />
    <col style="width:11%" />
    <col style="width:9%" />
  </colgroup>`;
}

function headRow() {
    return `
      <thead>
        <tr>
          <th>S.No</th>
          <th class="l">Nature of Extension Activity</th>
          <th class="l">Name of SMS/KVK Head</th>
          <th>No. of activities</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Year</th>
        </tr>
      </thead>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map((r) => `
      <tr>
        <td class="c">${r.sno}</td>
        <td class="l">${esc(r.nature)}</td>
        <td class="l">${r.smsName ? esc(r.smsName) : '—'}</td>
        <td class="c">${fmtInt(r.num)}</td>
        <td class="c">${fmtDate(r.startDate)}</td>
        <td class="c">${fmtDate(r.endDate)}</td>
        <td class="c">${r.reportingYear ? esc(r.reportingYear) : '—'}</td>
      </tr>`).join('');

    const subtotal = `
      <tr class="sub">
        <td class="l" colspan="3">Sub-total — ${esc(g.kvkName)}</td>
        <td class="c">${fmtInt(g.subtotal)}</td>
        <td colspan="3"></td>
      </tr>`;

    const kvkHd = showKvkHeader ? `<div class="oec-kvk-hd">${esc(g.kvkName)}</div>` : '';

    return `${kvkHd}
    <table class="oec-page-tbl">${colGroup()}${headRow()}
      <tbody>${body}${subtotal}</tbody>
    </table>`;
}

function renderOtherExtensionContentPageReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveOtherExtensionDetailedPayload(data);
    const groups = payload.groups || [];

    if (groups.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No other extension activity data for export.</p>
</div>`;
    }

    // Admins see multiple KVKs → label each group; a single KVK user does not.
    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
    <table class="oec-page-tbl">${colGroup()}
      <tbody>
        <tr class="grand">
          <td class="l" colspan="3">Grand Total (all KVKs)</td>
          <td class="c">${fmtInt(payload.grandTotal)}</td>
          <td colspan="3"></td>
        </tr>
      </tbody>
    </table>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="oec-page-wrap">
    <div class="oec-page-sec">B. Other Extension/content mobilization activities</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderOtherExtensionContentPageReportSection,
};
