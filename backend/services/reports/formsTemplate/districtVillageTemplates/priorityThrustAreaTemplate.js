/**
 * District & Village — Priority thrust areas (same for page export + modular report).
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

function renderPriorityThrustAreaSection(section, data, sectionId, isFirstSection) {
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
                <td>${esc(txt(row, 'thrustArea'))}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .pri-thrust-table { width: 100%; border-collapse: collapse; font-size: 7pt; table-layout: fixed; }
        .pri-thrust-table th, .pri-thrust-table td { border: 0.2px solid #000; padding: 3px 5px; vertical-align: top; word-break: break-word; }
        .pri-thrust-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table pri-thrust-table">
        <thead>
            <tr>
                <th style="width:8%;">Sr. No.</th>
                <th style="width:22%;">KVK Name</th>
                <th style="width:70%;">Thrust area</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

function buildPriorityThrustAreaTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = ['Sr. No.', 'KVK Name', 'Thrust area'];
    const out = rows.map((row, idx) => [
        idx + 1,
        kvkNameOf(row) || '—',
        txt(row, 'thrustArea'),
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderPriorityThrustAreaSection,
    buildPriorityThrustAreaTabularData,
};
