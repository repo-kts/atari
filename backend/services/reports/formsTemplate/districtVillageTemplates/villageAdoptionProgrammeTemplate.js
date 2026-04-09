/**
 * District & Village — Village adoption programme (same for page export + modular report).
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

function renderVillageAdoptionProgrammeSection(section, data, sectionId, isFirstSection) {
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
                <td>${esc(txt(row, 'village'))}</td>
                <td>${esc(txt(row, 'block'))}</td>
                <td>${esc(txt(row, 'actionTaken'))}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .vil-adopt-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .vil-adopt-table th, .vil-adopt-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
        .vil-adopt-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table vil-adopt-table">
        <thead>
            <tr>
                <th style="width:6%;">Sr. No.</th>
                <th style="width:16%;">KVK Name</th>
                <th style="width:16%;">Name of village</th>
                <th style="width:14%;">Block</th>
                <th style="width:48%;">Action taken for development</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildVillageAdoptionProgrammeTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Sr. No.',
        'KVK Name',
        'Name of village',
        'Block',
        'Action taken for development',
    ];
    const out = rows.map((row, idx) => [
        idx + 1,
        kvkNameOf(row) || '—',
        txt(row, 'village'),
        txt(row, 'block'),
        txt(row, 'actionTaken'),
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderVillageAdoptionProgrammeSection,
    buildVillageAdoptionProgrammeTabularData,
};
