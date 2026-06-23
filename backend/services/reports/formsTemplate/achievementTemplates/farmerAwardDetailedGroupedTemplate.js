const { resolveFarmerAwardDetailedPayload } = require('../../../../repositories/reports/farmerAwardReportRepository.js');

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '0';
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return String(Math.round(n));
}

function tableCss() {
    return `
  .fwa-wrap { width:100%; font-size:7pt; line-height:1.15; }
  .fwa-sec { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .fwa-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; }
  .fwa-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:avoid; }
  .fwa-tbl th, .fwa-tbl td { border:0.35pt solid #000; padding:2px 4px; vertical-align:top; word-wrap:break-word; overflow-wrap:anywhere; }
  .fwa-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .fwa-tbl .l { text-align:left; }
  .fwa-tbl .c { text-align:center; }
  .fwa-tbl .sub td { font-weight:bold; background:#f1f5f9; }
  .fwa-tbl .grand td { font-weight:bold; background:#f5f5f5; }
`;
}

function colGroup() {
    return `
  <colgroup>
    <col style="width:4%" />
    <col style="width:15%" />
    <col style="width:18%" />
    <col style="width:10%" />
    <col style="width:16%" />
    <col style="width:8%" />
    <col style="width:15%" />
    <col style="width:14%" />
  </colgroup>`;
}

function headRow() {
    return `
      <thead>
        <tr>
          <th>Sl. No.</th>
          <th class="l">Name of the Farmer</th>
          <th class="l">Address</th>
          <th class="l">Contact No.</th>
          <th class="l">Name of the Award</th>
          <th>Amount</th>
          <th class="l">Achievement</th>
          <th class="l">Conferring Authority</th>
        </tr>
      </thead>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map((r) => `
      <tr>
        <td class="c">${r.sno}</td>
        <td class="l">${esc(r.farmerName)}</td>
        <td class="l">${esc(r.address)}</td>
        <td class="l">${esc(r.contactNumber)}</td>
        <td class="l">${esc(r.award)}</td>
        <td class="c">${fmtInt(r.amount)}</td>
        <td class="l">${esc(r.achievement)}</td>
        <td class="l">${esc(r.conferringAuthority)}</td>
      </tr>`).join('');

    const sub = `
      <tr class="sub">
        <td class="l" colspan="5">Sub-total — ${esc(g.kvkName)} (${g.subtotal.count} award${g.subtotal.count === 1 ? '' : 's'})</td>
        <td class="c">${fmtInt(g.subtotal.amount)}</td>
        <td colspan="2"></td>
      </tr>`;

    const kvkHd = showKvkHeader ? `<div class="fwa-kvk-hd">${esc(g.kvkName)}</div>` : '';
    return `${kvkHd}
    <table class="fwa-tbl">${colGroup()}${headRow()}
      <tbody>${body}${sub}</tbody>
    </table>`;
}

function renderFarmerAwardDetailedGroupedSection(section, data, sectionId, isFirstSection) {
    const payload = resolveFarmerAwardDetailedPayload(data);
    const groups = payload.groups || [];

    if (groups.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No farmer award data for export.</p>
</div>`;
    }

    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
    <table class="fwa-tbl">${colGroup()}
      <tbody>
        <tr class="grand">
          <td class="l" colspan="5">Grand Total (all KVKs) — ${payload.grandTotal.count} award${payload.grandTotal.count === 1 ? '' : 's'}</td>
          <td class="c">${fmtInt(payload.grandTotal.amount)}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="fwa-wrap">
    <div class="fwa-sec">Awards / Recognition received by farmers</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderFarmerAwardDetailedGroupedSection,
};
