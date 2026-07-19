function esc(ctx, t) {
    return ctx._escapeHtml(t === null || t === undefined ? '' : t);
}

function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function fmtAmount(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function fmtDate(v) {
    const s = String(v || '').trim();
    if (!s) return '—';
    // Stored/API values may be yyyy-mm-dd strings, ISO timestamps, or Prisma
    // Date objects. Keep the calendar date in UTC so midnight values do not
    // shift when reports are generated in another server timezone.
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;

    const d = v instanceof Date ? v : new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getUTCFullYear()}`;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function normalizeRecord(r) {
    const kvkName = (r.kvk && r.kvk.kvkName) || r.kvkName || 'Unknown KVK';
    return {
        kvkName,
        startDate: r.startDate,
        endDate: r.endDate,
        developmentSchemeProgramme: r.developmentSchemeProgramme || '—',
        natureOfWork: r.natureOfWork || '—',
        amountRs: r.amountRs,
    };
}

function tableCss() {
    return `
  .ncv-wrap { width:100%; font-size:6.5pt; line-height:1.15; }
  .ncv-sec { font-size:8pt; font-weight:bold; margin:0 0 6px 0; }
  .ncv-kvk-hd { font-size:7pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
  .ncv-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:avoid; }
  .ncv-tbl th, .ncv-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .ncv-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .ncv-tbl .l { text-align:left; }
  .ncv-tbl .c { text-align:center; }
  .ncv-tbl .r { text-align:right; }
  .ncv-tbl .sub td { font-weight:bold; background:#f1f5f9; }
  .ncv-tbl .grand td { font-weight:bold; background:#f5f5f5; }
`;
}

function colGroup() {
    return `
  <colgroup>
    <col style="width:4%" />
    <col style="width:15%" />
    <col style="width:10%" /><col style="width:10%" />
    <col style="width:27%" /><col style="width:24%" />
    <col style="width:10%" />
  </colgroup>`;
}

function headRows() {
    return `
      <thead>
        <tr>
          <th>S.No</th>
          <th class="l">KVK</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th class="l">Development Scheme / Programme</th>
          <th class="l">Nature of Work</th>
          <th>Amount (Rs.)</th>
        </tr>
      </thead>`;
}

function bodyRow(ctx, r, sno) {
    return `
      <tr>
        <td class="c">${sno}</td>
        <td class="l">${esc(ctx, r.kvkName)}</td>
        <td class="c">${fmtDate(r.startDate)}</td>
        <td class="c">${fmtDate(r.endDate)}</td>
        <td class="l">${esc(ctx, r.developmentSchemeProgramme)}</td>
        <td class="l">${esc(ctx, r.natureOfWork)}</td>
        <td class="r">${fmtAmount(r.amountRs)}</td>
      </tr>`;
}

function sumAmount(rows) {
    return rows.reduce((s, r) => s + toNum(r.amountRs), 0);
}

function renderGroup(ctx, kvkName, rows) {
    const body = rows.map((r, i) => bodyRow(ctx, r, i + 1)).join('');
    const subRow = `
      <tr class="sub">
        <td class="l" colspan="6">Sub-total — ${esc(ctx, kvkName)} (${rows.length} record${rows.length === 1 ? '' : 's'})</td>
        <td class="r">${fmtAmount(sumAmount(rows))}</td>
      </tr>`;
    return `
    <h2 class="ncv-kvk-hd">KVK: ${esc(ctx, kvkName)}</h2>
    <table class="ncv-tbl">${colGroup()}${headRows()}
      <tbody>${body}${subRow}</tbody>
    </table>`;
}

function renderNicraConvergenceReportSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const records = rows.map((r) => normalizeRecord(r));

    if (records.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No Convergence Programme data for export.</p>
</div>`;
    }

    const byKvk = new Map();
    for (const r of records) {
        if (!byKvk.has(r.kvkName)) byKvk.set(r.kvkName, []);
        byKvk.get(r.kvkName).push(r);
    }
    const kvkNames = [...byKvk.keys()].sort(sortStr);
    const isMultiKvk = kvkNames.length > 1;

    const groupsHtml = kvkNames.map((kvk) => renderGroup(this, kvk, byKvk.get(kvk))).join('');

    const grandHtml = isMultiKvk
        ? `
    <table class="ncv-tbl">${colGroup()}
      <tbody>
        <tr class="grand">
          <td class="l" colspan="6">Grand Total (all KVKs) — ${records.length} records</td>
          <td class="r">${fmtAmount(sumAmount(records))}</td>
        </tr>
      </tbody>
    </table>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <div class="ncv-wrap">
    <div class="ncv-sec">NICRA Others — Convergence Programme</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderNicraConvergenceReportSection,
};
