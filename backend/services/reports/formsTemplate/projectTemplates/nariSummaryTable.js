// Generic superadmin NARI summary: Activity rows × state columns, each state
// group = Count | M | F | T, plus a Total group and a Grand Total row.
// Shared by all 5 NARI templates (rendered only when isAggregatedView).

function esc(ctx, t) {
    return ctx._escapeHtml(t === null || t === undefined ? '' : t);
}

function fmt(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

function cellHtml(cell) {
    const c = cell || { count: 0, m: 0, f: 0, t: 0 };
    return `<td>${fmt(c.count)}</td><td>${fmt(c.m)}</td><td>${fmt(c.f)}</td><td>${fmt(c.t)}</td>`;
}

function renderNariActivitySummary(ctx, section, sectionId, isFirstSection, payload) {
    const states = (payload && payload.stateColumns) || [];
    const rows = (payload && payload.rows) || [];
    const countLabel = (payload && payload.countLabel) || 'Count';
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const heading = `<h1 class="section-title">${esc(ctx, section.id)} ${esc(ctx, section.title)}</h1>`;

    if (rows.length === 0 || states.length === 0) {
        return `<div id="${sectionId}" class="${pageClass}">${heading}<p class="no-data">No data found</p></div>`;
    }

    const groups = [...states, 'Total'];
    const topCells = groups.map((g) => `<th colspan="4">${esc(ctx, g)}</th>`).join('');
    const subCells = groups.map(() => `<th>${esc(ctx, countLabel)}</th><th>M</th><th>F</th><th>T</th>`).join('');
    const colgroup = `<colgroup><col style="width:4%"/><col style="width:18%"/>${
        groups.map(() => '<col style="width:3%"/><col style="width:3%"/><col style="width:3%"/><col style="width:3%"/>').join('')
    }</colgroup>`;

    const body = rows.map((r, i) => {
        const stateCells = states.map((st) => cellHtml(r.byState[st])).join('');
        return `<tr><td>${i + 1}</td><td class="l">${esc(ctx, r.activityName)}</td>${stateCells}${cellHtml(r.total)}</tr>`;
    }).join('');

    const g = (payload && payload.grandTotal) || { byState: {}, total: {} };
    const grandCells = states.map((st) => cellHtml(g.byState[st])).join('');
    const grandRow = `<tr class="grand"><td></td><td class="l">Grand Total</td>${grandCells}${cellHtml(g.total)}</tr>`;

    return `
<div id="${sectionId}" class="${pageClass}">
  <style>
    .nari-sum { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nari-sum th, .nari-sum td { border:0.3pt solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nari-sum thead th { background:#e8e8e8; font-weight:bold; }
    .nari-sum td.l { text-align:left; }
    .nari-sum tr.grand td { font-weight:bold; background:#f5f5f5; }
  </style>
  ${heading}
  <table class="nari-sum">${colgroup}
    <thead>
      <tr><th rowspan="2">Sl. No</th><th rowspan="2" class="l">Activity</th>${topCells}</tr>
      <tr>${subCells}</tr>
    </thead>
    <tbody>${body}${grandRow}</tbody>
  </table>
</div>`;
}

module.exports = { renderNariActivitySummary };
