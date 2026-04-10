/**
 * Financial Performance — Resource generation (programme-wise). Page + modular report.
 */

const { kvkNameOf } = require('./kvkLabel.js');

function fmtMoney(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function renderResourceGenerationSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row, idx) => {
            return `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(kvkNameOf(row) || '—')}</td>
                <td>${esc(row.programmeName || '—')}</td>
                <td>${esc(row.programmePurpose || '—')}</td>
                <td>${esc(row.sourcesOfFund || '—')}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.amount))}</td>
                <td>${esc(row.infrastructureCreated || '—')}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .fin-res-gen-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .fin-res-gen-table th, .fin-res-gen-table td { border: 0.2px solid #000; padding: 2px 4px; vertical-align: top; word-break: break-word; }
        .fin-res-gen-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table fin-res-gen-table">
        <thead>
            <tr>
                <th style="width:5%;">Sl.No.</th>
                <th style="width:12%;">Name of KVK</th>
                <th style="width:14%;">Name of the programme</th>
                <th style="width:18%;">Purpose of the programme</th>
                <th style="width:14%;">Sources of fund</th>
                <th style="width:10%;">Amount (Rs. lakhs)</th>
                <th style="width:27%;">Infrastructure created</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildResourceGenerationTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Sl.No.',
        'Name of KVK',
        'Name of the programme',
        'Purpose of the programme',
        'Sources of fund',
        'Amount (Rs. lakhs)',
        'Infrastructure created',
    ];
    const out = rows.map((row, idx) => [
        idx + 1,
        kvkNameOf(row) || '—',
        row.programmeName || '—',
        row.programmePurpose || '—',
        row.sourcesOfFund || '—',
        fmtMoney(row.amount),
        row.infrastructureCreated || '—',
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderResourceGenerationSection,
    buildResourceGenerationTabularData,
};
