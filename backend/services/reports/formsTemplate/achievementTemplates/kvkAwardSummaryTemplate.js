/**
 * Page report / data-management export: Sl. No., Name of the KVK, Total Award (counts per KVK).
 */

function resolveKvkAwardSummaryPayload(rawData) {
    const arr = Array.isArray(rawData) ? rawData : [];
    const counts = new Map();
    const displayName = new Map();

    for (const r of arr) {
        const idPart = r.kvkId != null && r.kvkId !== '' ? `id:${r.kvkId}` : null;
        const name =
            r.kvkName != null && String(r.kvkName).trim() !== ''
                ? String(r.kvkName).trim()
                : r.kvkId != null
                  ? `KVK ${r.kvkId}`
                  : 'Unknown KVK';
        const key = idPart || `name:${name}`;
        if (!displayName.has(key)) {
            displayName.set(key, name);
        }
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    const rows = [...counts.entries()]
        .map(([key, count]) => ({
            kvkName: displayName.get(key) || 'Unknown KVK',
            totalAward: count,
        }))
        .sort((a, b) => a.kvkName.localeCompare(b.kvkName));

    return { rows };
}

/**
 * @param {unknown} rawData
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildKvkAwardSummaryTabularData(rawData) {
    const { rows } = resolveKvkAwardSummaryPayload(rawData);
    return {
        headers: ['Sl. No.', 'Name of the KVK', 'Total Award'],
        rows: rows.map((x, idx) => [idx + 1, x.kvkName, x.totalAward]),
    };
}

function renderKvkAwardSummarySection(section, data, sectionId, isFirstSection) {
    const { rows } = resolveKvkAwardSummaryPayload(data);
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
                <td style="text-align:center;">${esc(String(r.totalAward))}</td>
            </tr>`,
        )
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .kvk-award-sum-table { width: 100%; max-width: 720px; border-collapse: collapse; font-size: 8pt; }
        .kvk-award-sum-table th, .kvk-award-sum-table td { border: 0.2px solid #000; padding: 4px 6px; vertical-align: middle; }
        .kvk-award-sum-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .kvk-award-sum-table tbody td:nth-child(2) { text-align: left; }
    </style>
    <table class="data-table kvk-award-sum-table">
        <thead>
            <tr>
                <th style="width:12%;">Sl. No.</th>
                <th>Name of the KVK</th>
                <th style="width:22%;">Total Award</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderKvkAwardSummarySection,
    resolveKvkAwardSummaryPayload,
    buildKvkAwardSummaryTabularData,
};
