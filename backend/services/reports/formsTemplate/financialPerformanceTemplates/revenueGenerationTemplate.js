/**
 * Financial Performance — Revenue generation. Page + modular report.
 */

const { kvkNameOf } = require('./kvkLabel.js');

function fmtMoney(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function renderRevenueGenerationSection(section, data, sectionId, isFirstSection) {
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
                <td>${esc(row.headName || '—')}</td>
                <td style="text-align:right;">${esc(fmtMoney(row.income))}</td>
                <td>${esc(row.sponsoringAgency || '—')}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .fin-rev-gen-table { width: 100%; border-collapse: collapse; font-size: 7pt; }
        .fin-rev-gen-table th, .fin-rev-gen-table td { border: 0.2px solid #000; padding: 3px 5px; vertical-align: top; word-break: break-word; }
        .fin-rev-gen-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table fin-rev-gen-table">
        <thead>
            <tr>
                <th style="width:8%;">Sl.No.</th>
                <th style="width:22%;">KVK</th>
                <th style="width:22%;">Name of Head</th>
                <th style="width:18%;">Income (Rs.)</th>
                <th style="width:30%;">Sponsoring agency</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildRevenueGenerationTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = ['Sl.No.', 'KVK', 'Name of Head', 'Income (Rs.)', 'Sponsoring agency'];
    const out = rows.map((row, idx) => [
        idx + 1,
        kvkNameOf(row) || '—',
        row.headName || '—',
        fmtMoney(row.income),
        row.sponsoringAgency || '—',
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderRevenueGenerationSection,
    buildRevenueGenerationTabularData,
};
