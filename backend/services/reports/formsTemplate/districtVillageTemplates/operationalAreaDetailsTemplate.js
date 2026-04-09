/**
 * District & Village — Operational area / villages (same for page export + modular report).
 */

function kvkNameOf(row) {
    return row.kvkName != null && String(row.kvkName).trim() !== ''
        ? String(row.kvkName).trim()
        : (row.kvk?.kvkName != null ? String(row.kvk.kvkName).trim() : '');
}

function txt(row, key) {
    const v = row[key];
    if (v == null || String(v).trim() === '') return '—';
    return String(v).trim();
}

function renderOperationalAreaDetailsSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row, idx) => {
            const kvk = kvkNameOf(row) || '—';
            return `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(kvk)}</td>
                <td>${esc(txt(row, 'taluk'))}</td>
                <td>${esc(txt(row, 'block'))}</td>
                <td>${esc(txt(row, 'village'))}</td>
                <td>${esc(txt(row, 'majorCrops'))}</td>
                <td>${esc(txt(row, 'majorProblems'))}</td>
                <td>${esc(txt(row, 'thrustAreas'))}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .op-area-table { width: 100%; border-collapse: collapse; font-size: 6pt; table-layout: fixed; }
        .op-area-table th, .op-area-table td { border: 0.2px solid #000; padding: 2px 3px; vertical-align: top; word-break: break-word; }
        .op-area-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table op-area-table">
        <thead>
            <tr>
                <th style="width:4%;">Sr. No.</th>
                <th style="width:10%;">KVK</th>
                <th style="width:9%;">Name of Taluk</th>
                <th style="width:9%;">Name of the block</th>
                <th style="width:10%;">Name of the villages</th>
                <th style="width:14%;">Major crops</th>
                <th style="width:22%;">Major problems identified (crop-wise)</th>
                <th style="width:22%;">Identified Thrust Areas</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildOperationalAreaDetailsTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Sr. No.',
        'KVK',
        'Name of Taluk',
        'Name of the block',
        'Name of the villages',
        'Major crops',
        'Major problems identified (crop-wise)',
        'Identified Thrust Areas',
    ];
    const out = rows.map((row, idx) => [
        idx + 1,
        kvkNameOf(row) || '—',
        txt(row, 'taluk'),
        txt(row, 'block'),
        txt(row, 'village'),
        txt(row, 'majorCrops'),
        txt(row, 'majorProblems'),
        txt(row, 'thrustAreas'),
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderOperationalAreaDetailsSection,
    buildOperationalAreaDetailsTabularData,
};
