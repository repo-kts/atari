/**
 * Modular all-report (section 2.57): Sl. No., Name of the KVK, Name of the Head/Scientist, Total Award.
 * Aggregates counts per (kvkId, scientist name).
 * (Page export uses scientist-award-detailed for the line-by-line table.)
 */

function kvkLabel(r) {
    if (r.kvkName != null && String(r.kvkName).trim() !== '') return String(r.kvkName).trim();
    if (r.kvkId != null) return `KVK ${r.kvkId}`;
    return 'Unknown KVK';
}

function scientistLabel(r) {
    const s = r.scientistName ?? r.headScientist;
    if (s != null && String(s).trim() !== '') return String(s).trim();
    return '—';
}

function resolveScientistAwardSummaryPayload(rawData) {
    const arr = Array.isArray(rawData) ? rawData : [];
    const counts = new Map();
    const labels = new Map();

    for (const r of arr) {
        const kvk = kvkLabel(r);
        const sci = scientistLabel(r);
        const key = r.kvkId != null ? `id:${r.kvkId}|${sci}` : `name:${kvk}|${sci}`;
        if (!labels.has(key)) {
            labels.set(key, { kvkName: kvk, scientistName: sci });
        }
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    const rows = [...counts.entries()]
        .map(([key, totalAward]) => {
            const L = labels.get(key) || { kvkName: 'Unknown KVK', scientistName: '—' };
            return { kvkName: L.kvkName, scientistName: L.scientistName, totalAward };
        })
        .sort((a, b) => {
            const c = a.kvkName.localeCompare(b.kvkName);
            if (c !== 0) return c;
            return a.scientistName.localeCompare(b.scientistName);
        });

    return { rows };
}

/**
 * @param {unknown} rawData
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildScientistAwardSummaryTabularData(rawData) {
    const { rows } = resolveScientistAwardSummaryPayload(rawData);
    return {
        headers: ['Sl. No.', 'Name of the KVK', 'Name of the Head/Scientist', 'Total Award'],
        rows: rows.map((x, idx) => [idx + 1, x.kvkName, x.scientistName, x.totalAward]),
    };
}

function renderScientistAwardSummarySection(section, data, sectionId, isFirstSection) {
    const { rows } = resolveScientistAwardSummaryPayload(data);
    const esc = (v) => this._escapeHtml(v ?? '');

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const body = rows
        .map(
            (r, idx) => `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(r.kvkName)}</td>
                <td>${esc(r.scientistName)}</td>
                <td style="text-align:center;">${esc(String(r.totalAward))}</td>
            </tr>`,
        )
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .sci-award-sum-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
        .sci-award-sum-table th, .sci-award-sum-table td { border: 0.2px solid #000; padding: 4px 6px; vertical-align: middle; }
        .sci-award-sum-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .sci-award-sum-table tbody td:nth-child(2), .sci-award-sum-table tbody td:nth-child(3) { text-align: left; }
    </style>
    <table class="data-table sci-award-sum-table">
        <thead>
            <tr>
                <th style="width:8%;">Sl. No.</th>
                <th style="width:28%;">Name of the KVK</th>
                <th style="width:40%;">Name of the Head/Scientist</th>
                <th style="width:14%;">Total Award</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderScientistAwardSummarySection,
    resolveScientistAwardSummaryPayload,
    buildScientistAwardSummaryTabularData,
};
