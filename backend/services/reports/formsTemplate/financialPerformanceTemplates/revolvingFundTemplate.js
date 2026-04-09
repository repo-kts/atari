/**
 * Financial Performance — Revolving fund status. Page + modular report.
 */

const { kvkNameOf } = require('./kvkLabel.js');

function fmtMoney(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function renderRevolvingFundSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row) => {
            const closing = row.closingBalance != null && Number.isFinite(Number(row.closingBalance))
                ? row.closingBalance
                : (Number(row.openingBalance) || 0)
                    + (Number(row.incomeDuringYear) || 0)
                    - (Number(row.expenditureDuringYear) || 0);
            return `<tr>
                <td>${esc(kvkNameOf(row) || '—')}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.openingBalance))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.incomeDuringYear))}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.expenditureDuringYear))}</td>
                <td style="text-align:right;">${esc(fmtMoney(closing))}</td>
                <td style="text-align:right;">${esc(row.kind != null && row.kind !== '' ? String(row.kind) : '—')}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .fin-revolving-table { width: 100%; border-collapse: collapse; font-size: 7pt; }
        .fin-revolving-table th, .fin-revolving-table td { border: 0.2px solid #000; padding: 3px 5px; vertical-align: middle; }
        .fin-revolving-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table fin-revolving-table">
        <thead>
            <tr>
                <th style="width:22%;">Name of KVK</th>
                <th style="width:18%;">Opening balance as on 1st April</th>
                <th style="width:16%;">Income during the year</th>
                <th style="width:16%;">Expenditure during the year</th>
                <th style="width:14%;">Closing</th>
                <th style="width:14%;">Kind</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildRevolvingFundTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Name of KVK',
        'Opening balance as on 1st April',
        'Income during the year',
        'Expenditure during the year',
        'Closing',
        'Kind',
    ];
    const out = rows.map((row) => {
        const closing = row.closingBalance != null && Number.isFinite(Number(row.closingBalance))
            ? row.closingBalance
            : (Number(row.openingBalance) || 0)
                + (Number(row.incomeDuringYear) || 0)
                - (Number(row.expenditureDuringYear) || 0);
        return [
            kvkNameOf(row) || '—',
            fmtMoney(row.openingBalance),
            fmtMoney(row.incomeDuringYear),
            fmtMoney(row.expenditureDuringYear),
            fmtMoney(closing),
            row.kind != null && row.kind !== '' ? String(row.kind) : '—',
        ];
    });
    return { headers, rows: out };
}

module.exports = {
    renderRevolvingFundSection,
    buildRevolvingFundTabularData,
};
