const { resolveNicraDignitariesDetailedPayload } = require('../../../../repositories/reports/nicraDignitariesReport/nicraDignitariesReportRepository.js');

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtDate(v) {
    if (v === null || v === undefined || v === '') return '—';
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return esc(v);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getUTCFullYear()}`;
}

function tableCss() {
    return `
  .ndg-page-wrap { width:100%; font-size:7pt; line-height:1.2; }
  .ndg-page-sec { font-size:8pt; font-weight:bold; margin:0 0 8px 0; }
  .ndg-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; }
  .ndg-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:avoid; }
  .ndg-page-tbl th, .ndg-page-tbl td { border:0.35pt solid #000; padding:2px 4px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .ndg-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .ndg-page-tbl .l { text-align:left; }
  .ndg-page-tbl .c { text-align:center; }
  .ndg-page-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .ndg-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

// Column widths sum to 100% — fits a portrait page without cropping.
function colGroup() {
    return `
  <colgroup>
    <col style="width:6%" />
    <col style="width:15%" />
    <col style="width:20%" />
    <col style="width:24%" />
    <col style="width:35%" />
  </colgroup>`;
}

function headRow() {
    return `
      <thead>
        <tr>
          <th>S.No</th>
          <th>Date of Visit</th>
          <th class="l">Dignitary Type</th>
          <th class="l">Name</th>
          <th class="l">Remark</th>
        </tr>
      </thead>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map((r) => `
      <tr>
        <td class="c">${r.sno}</td>
        <td class="c">${fmtDate(r.dateOfVisit)}</td>
        <td class="l">${r.type ? esc(r.type) : '—'}</td>
        <td class="l">${r.name ? esc(r.name) : '—'}</td>
        <td class="l">${r.remark ? esc(r.remark) : '—'}</td>
      </tr>`).join('');

    const subtotal = `
      <tr class="sub">
        <td class="l" colspan="4">Sub-total — ${esc(g.kvkName)} (visits)</td>
        <td class="c">${g.subtotal}</td>
      </tr>`;

    const kvkHd = showKvkHeader ? `<div class="ndg-kvk-hd">${esc(g.kvkName)}</div>` : '';

    return `${kvkHd}
    <table class="ndg-page-tbl">${colGroup()}${headRow()}
      <tbody>${body}${subtotal}</tbody>
    </table>`;
}

function renderNicraDignitariesReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveNicraDignitariesDetailedPayload(data);
    const groups = payload.groups || [];

    if (groups.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No dignitaries visited data for export.</p>
</div>`;
    }

    // Admins see multiple KVKs → label each group; a single KVK user does not.
    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
    <table class="ndg-page-tbl">${colGroup()}
      <tbody>
        <tr class="grand">
          <td class="l" colspan="4">Grand Total (all KVKs) — visits</td>
          <td class="c">${payload.grandTotal}</td>
        </tr>
      </tbody>
    </table>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <div class="ndg-page-wrap">
    <div class="ndg-page-sec">NICRA Others — Dignitaries Visited</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderNicraDignitariesReportSection,
};
