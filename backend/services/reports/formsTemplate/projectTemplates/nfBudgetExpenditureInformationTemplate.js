const { resolveBudgetGroupedPayload } = require('../../../../repositories/reports/naturalFarmingReport/budgetExpenditureReportRepository.js');

const TABLE_CAPTION = 'Budget Expenditure (Rs. in Rs)';

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtMoney(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return esc(String(v));
    if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    return String(Number(n.toFixed(2)));
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return esc(String(v));
    return String(Math.round(n));
}

function tableCss() {
    return `
  .nf-budget-wrap { width:100%; font-size:7pt; line-height:1.2; }
  .nf-budget-caption { text-align:center; font-size:9pt; font-weight:bold; margin:0 0 8px 0; }
  .nf-budget-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:avoid; }
  .nf-budget-tbl th, .nf-budget-tbl td { border:0.35pt solid #000; padding:3px 4px; vertical-align:middle; text-align:center; word-break:break-word; }
  .nf-budget-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .nf-budget-tbl td:first-child { text-align:left; font-weight:600; }
  .nf-budget-tbl tr.total td { font-weight:bold; background:#f1f5f9; }
  .nf-budget-tbl tr.total td:first-child { text-align:right; }
  .nf-budget-kvk-hd { font-size:8pt; font-weight:bold; background:#dce6f1; padding:3px 6px; border:0.35pt solid #000; margin:10px 0 6px 0; }
`;
}

function renderBudgetTable(rows, totals) {
    const body = (rows && rows.length > 0)
        ? rows.map((r) => `
      <tr>
        <td>${esc(r.activityLabel || '—')}</td>
        <td>${fmtInt(r.numberOfActivities)}</td>
        <td>${fmtMoney(r.budgetSanction)}</td>
        <td>${fmtMoney(r.budgetExpenditure)}</td>
        <td>${fmtMoney(r.totalBudgetExpenditure)}</td>
      </tr>`).join('')
        : (totals ? '' : `<tr><td colspan="5">${esc('No data')}</td></tr>`);

    const totalRow = totals ? `
      <tr class="total">
        <td>Total</td>
        <td>${fmtInt(totals.numberOfActivities)}</td>
        <td>${fmtMoney(totals.budgetSanction)}</td>
        <td>${fmtMoney(totals.budgetExpenditure)}</td>
        <td>${fmtMoney(totals.totalBudgetExpenditure)}</td>
      </tr>` : '';

    return `
  <table class="nf-budget-tbl">
    <thead>
      <tr>
        <th>Name of activity</th>
        <th>Number of activities organized</th>
        <th>Budget sanction (Rs)</th>
        <th>Budget expenditure (Rs)</th>
        <th>Total Budget Expenditure (Rs)</th>
      </tr>
    </thead>
    <tbody>${body}${totalRow}</tbody>
  </table>`;
}

function renderNfBudgetExpenditureInformationSection(section, data, sectionId, isFirstSection) {
    const payload = resolveBudgetGroupedPayload(data);
    const groups = payload.groups || [];

    if (payload.totalRecords === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    const groupsHtml = groups.map((g) => {
        const kvkHd = g.kvkName ? `<div class="nf-budget-kvk-hd">KVK: ${esc(g.kvkName)}</div>` : '';
        return `${kvkHd}${renderBudgetTable(g.rows, g.totals)}`;
    }).join('');

    const grandHtml = payload.isMultiKvk ? `
    <div class="nf-budget-kvk-hd">Grand Total (all KVKs)</div>
    ${renderBudgetTable([], payload.grandTotals)}` : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nf-budget-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="nf-budget-caption">${esc(TABLE_CAPTION)}</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderNfBudgetExpenditureInformationSection,
};
