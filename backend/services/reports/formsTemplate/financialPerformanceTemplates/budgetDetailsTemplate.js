/**
 * Financial Performance — Budget details (allocation breakdown). Page + modular report.
 */

const { kvkNameOf } = require('./kvkLabel.js');

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/** DB rows have no total columns; modular report may pre-fill these — prefer sum of components. */
function budgetDetailComputedTotals(row) {
    const genTotal = num(row.generalMainGrantAllocation) + num(row.generalTspGrantAllocation) + num(row.generalScspGrantAllocation);
    const capTotal = num(row.capitalMainGrantAllocation) + num(row.capitalTspGrantAllocation) + num(row.capitalScspGrantAllocation);
    const salary = num(row.salaryAllocation);
    return {
        generalTotal: genTotal,
        capitalTotal: capTotal,
        grandTotal: salary + genTotal + capTotal,
    };
}

function fmtMoney(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function renderBudgetDetailsSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row, idx) => {
            const kvk = kvkNameOf(row) || '—';
            const t = budgetDetailComputedTotals(row);
            return `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(kvk)}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.salaryAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.generalMainGrantAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.generalTspGrantAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.generalScspGrantAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(t.generalTotal))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.capitalMainGrantAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.capitalTspGrantAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.capitalScspGrantAllocation))}</td>
                <td style="text-align:right;">${esc(fmtMoney(t.capitalTotal))}</td>
                <td style="text-align:right;font-weight:bold;">${esc(fmtMoney(t.grandTotal))}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .fin-budget-det-table { width: 100%; border-collapse: collapse; font-size: 5.5pt; table-layout: fixed; }
        .fin-budget-det-table th, .fin-budget-det-table td { border: 0.2px solid #000; padding: 2px 3px; vertical-align: middle; word-break: break-word; }
        .fin-budget-det-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table fin-budget-det-table">
        <thead>
            <tr>
                <th rowspan="2" style="width:4%;">Sr.</th>
                <th rowspan="2" style="width:12%;">KVK</th>
                <th rowspan="2" style="width:8%;">Salary Allocation</th>
                <th colspan="4">General Allocation</th>
                <th colspan="4">Capital Allocation</th>
                <th rowspan="2" style="width:8%;">Grand Total</th>
            </tr>
            <tr>
                <th style="width:7%;">Main Grant</th>
                <th style="width:6%;">TSP</th>
                <th style="width:6%;">SCSP</th>
                <th style="width:7%;">Total</th>
                <th style="width:7%;">Main Grant</th>
                <th style="width:6%;">TSP</th>
                <th style="width:6%;">SCSP</th>
                <th style="width:7%;">Total</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildBudgetDetailsTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Sr.',
        'KVK',
        'Salary Allocation',
        'General — Main Grant',
        'General — TSP',
        'General — SCSP',
        'General — Total',
        'Capital — Main Grant',
        'Capital — TSP',
        'Capital — SCSP',
        'Capital — Total',
        'Grand Total',
    ];
    const out = rows.map((row, idx) => {
        const t = budgetDetailComputedTotals(row);
        return [
            idx + 1,
            kvkNameOf(row) || '—',
            fmtMoney(row.salaryAllocation),
            fmtMoney(row.generalMainGrantAllocation),
            fmtMoney(row.generalTspGrantAllocation),
            fmtMoney(row.generalScspGrantAllocation),
            fmtMoney(t.generalTotal),
            fmtMoney(row.capitalMainGrantAllocation),
            fmtMoney(row.capitalTspGrantAllocation),
            fmtMoney(row.capitalScspGrantAllocation),
            fmtMoney(t.capitalTotal),
            fmtMoney(t.grandTotal),
        ];
    });
    return { headers, rows: out };
}

module.exports = {
    renderBudgetDetailsSection,
    buildBudgetDetailsTabularData,
};
