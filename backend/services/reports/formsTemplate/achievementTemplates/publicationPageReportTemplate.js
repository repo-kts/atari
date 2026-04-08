/**
 * Modular all-report: summary counts by publication master (Publication × No (Counts)).
 * Input: repository rows (`category`) or API rows (`publicationItem` / `publication`).
 */

function publicationLabel(r) {
    if (r == null) return 'Not categorized';
    if (r.category != null && String(r.category).trim() !== '') {
        return String(r.category).trim();
    }
    if (r.publicationItem != null && String(r.publicationItem).trim() !== '') {
        return String(r.publicationItem).trim();
    }
    const p = r.publication;
    if (p != null) {
        if (typeof p === 'string' && p.trim() !== '') return p.trim();
        if (typeof p === 'number' && Number.isFinite(p)) return `Publication type (${p})`;
    }
    return 'Not categorized';
}

/**
 * @param {unknown} rawData
 * @returns {{ rows: Array<{ publication: string, count: number }> }}
 */
function resolvePublicationPageReportPayload(rawData) {
    const arr = Array.isArray(rawData) ? rawData : [];
    const counts = new Map();
    for (const r of arr) {
        const key = publicationLabel(r);
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    const rows = [...counts.entries()]
        .map(([publication, count]) => ({ publication, count }))
        .sort((a, b) => a.publication.localeCompare(b.publication));
    return { rows };
}

/**
 * @param {unknown} rawData
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildPublicationPageTabularData(rawData) {
    const { rows } = resolvePublicationPageReportPayload(rawData);
    return {
        headers: ['Publication', 'No (Counts)'],
        rows: rows.map((x) => [x.publication, x.count]),
    };
}

function renderPublicationPageReportSection(section, data, sectionId, isFirstSection) {
    const { rows } = resolvePublicationPageReportPayload(data);
    const esc = (v) => this._escapeHtml(v ?? '');

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const body = rows
        .map(
            (r) => `<tr>
                <td>${esc(r.publication)}</td>
                <td style="text-align:center;">${esc(String(r.count))}</td>
            </tr>`,
        )
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .pub-sum-table { width: 100%; max-width: 720px; border-collapse: collapse; font-size: 8pt; }
        .pub-sum-table th, .pub-sum-table td { border: 0.2px solid #000; padding: 4px 6px; vertical-align: middle; }
        .pub-sum-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .pub-sum-table tbody td:first-child { text-align: left; }
    </style>
    <table class="data-table pub-sum-table">
        <thead>
            <tr>
                <th>Publication</th>
                <th style="width:22%;">No (Counts)</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderPublicationPageReportSection,
    resolvePublicationPageReportPayload,
    buildPublicationPageTabularData,
};
