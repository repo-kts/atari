/**
 * Financial Performance — Project-wise budget. Page + modular report.
 */

const { kvkNameOf } = require('./kvkLabel.js');

function fmtMoney(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function projectDisplayNameOf(row) {
    if (row.projectDisplayName != null && String(row.projectDisplayName).trim() !== '') {
        return String(row.projectDisplayName).trim();
    }
    if (row.specifyProjectName != null && String(row.specifyProjectName).trim() !== '') {
        return String(row.specifyProjectName).trim();
    }
    if (row.projectName?.projectName != null && String(row.projectName.projectName).trim() !== '') {
        return String(row.projectName.projectName).trim();
    }
    return '—';
}

function fundingAgencyDisplayOf(row) {
    if (row.fundingAgencyDisplay != null && String(row.fundingAgencyDisplay).trim() !== '') {
        return String(row.fundingAgencyDisplay).trim();
    }
    if (row.specifyAgencyName != null && String(row.specifyAgencyName).trim() !== '') {
        return String(row.specifyAgencyName).trim();
    }
    if (row.fundingAgency?.agencyName != null && String(row.fundingAgency.agencyName).trim() !== '') {
        return String(row.fundingAgency.agencyName).trim();
    }
    return '—';
}

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/** Unspent = Budget allocated − Expenditure (not released − expenditure). */
function unspentBalanceOf(row) {
    return num(row.budgetAllocated) - num(row.expenditure);
}

function renderProjectBudgetSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row) => {
            return `<tr>
                <td>${esc(kvkNameOf(row) || '—')}</td>
                <td>${esc(projectDisplayNameOf(row))}</td>
                <td>${esc(row.accountNumber || '—')}</td>
                <td>${esc(fundingAgencyDisplayOf(row))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.budgetEstimate))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.budgetAllocated))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.budgetReleased))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.expenditure))}</td>
                <td style="text-align:right;">${esc(fmtMoney(unspentBalanceOf(row)))}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .fin-proj-bud-table { width: 100%; border-collapse: collapse; font-size: 6pt; table-layout: fixed; }
        .fin-proj-bud-table th, .fin-proj-bud-table td { border: 0.2px solid #000; padding: 2px 3px; vertical-align: top; word-break: break-word; }
        .fin-proj-bud-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table fin-proj-bud-table">
        <thead>
            <tr>
                <th style="width:12%;">Name of KVK</th>
                <th style="width:14%;">Name of project</th>
                <th style="width:10%;">Account Number</th>
                <th style="width:12%;">Name of Funding agency</th>
                <th style="width:9%;">Budget Estimate</th>
                <th style="width:9%;">Budget Allocated</th>
                <th style="width:9%;">Budget released</th>
                <th style="width:9%;">Expenditure</th>
                <th style="width:14%;">Unspent balance as on 31st March</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildProjectBudgetTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Name of KVK',
        'Name of project',
        'Account Number',
        'Name of Funding agency',
        'Budget Estimate',
        'Budget Allocated',
        'Budget released',
        'Expenditure',
        'Unspent balance as on 31st March',
    ];
    const out = rows.map((row) => [
        kvkNameOf(row) || '—',
        projectDisplayNameOf(row),
        row.accountNumber || '—',
        fundingAgencyDisplayOf(row),
        fmtMoney(row.budgetEstimate),
        fmtMoney(row.budgetAllocated),
        fmtMoney(row.budgetReleased),
        fmtMoney(row.expenditure),
        fmtMoney(unspentBalanceOf(row)),
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderProjectBudgetSection,
    buildProjectBudgetTabularData,
};
