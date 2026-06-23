/**
 * Page report / data-management export: one row per publication entry (10 columns),
 * grouped by KVK so admins (and KVK users) can see which KVK each block belongs to.
 * Repository rows use `category`; form/API rows use `publicationItem` / `publication`.
 * Volume/issue/page/impact not stored on form — shown as "-".
 */

const COLUMNS = [
    'Sl. No.',
    'Category',
    'Authors',
    'Title',
    'Journal Name',
    'Volume',
    'Issue',
    'Page No.',
    'Year',
    'Impact Factor',
];

function normalizeCategory(row) {
    if (row == null) return '-';
    const c = row.category ?? row.publicationName ?? row.publicationItem;
    if (c != null && String(c).trim() !== '') return String(c).trim();
    const p = row.publication;
    if (typeof p === 'string' && p.trim() !== '') return p.trim();
    return '-';
}

function normalizeYear(row) {
    if (row.year != null && row.year !== '') return String(row.year);
    if (row.reportingYear != null && row.reportingYear !== '') {
        const y = row.reportingYear;
        if (typeof y === 'string') {
            const m = y.match(/^(\d{4})/);
            if (m) return m[1];
        }
        const d = y instanceof Date ? y : new Date(y);
        if (!Number.isNaN(d.getTime())) return String(d.getUTCFullYear());
    }
    return '';
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function displayRow(row) {
    return {
        category: normalizeCategory(row),
        authors: row.authorName ?? '-',
        title: row.title ?? '-',
        journal: row.journalName ?? '-',
        vol: row.volume != null && row.volume !== '' ? row.volume : '-',
        issue: row.issue != null && row.issue !== '' ? row.issue : '-',
        pageNo: row.pageNo != null && row.pageNo !== '' ? row.pageNo : '-',
        year: normalizeYear(row) || '-',
        impact: row.impactFactor != null && row.impactFactor !== '' ? row.impactFactor : '-',
    };
}

/**
 * Groups publication rows by KVK. Each group's rows are Sl.No-ed within the group.
 * @returns {{ groups: {kvkName: string, rows: object[]}[], isMultiKvk: boolean }}
 */
function buildPublicationGroups(rawData) {
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();
    for (const r of rows) {
        const k = (r && r.kvkName && String(r.kvkName).trim()) || 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => ({
        kvkName,
        rows: byKvk.get(kvkName).map((r, i) => ({ sl: i + 1, ...displayRow(r) })),
    }));
    return { groups, isMultiKvk: groups.length > 1 };
}

/**
 * Flat tabular form (kept for any non-template caller). Single Sl.No column.
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildPublicationDetailsTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const out = rows.map((row, idx) => {
        const d = displayRow(row);
        return [idx + 1, d.category, d.authors, d.title, d.journal, d.vol, d.issue, d.pageNo, d.year, d.impact];
    });
    return { headers: COLUMNS.slice(), rows: out };
}

function renderPublicationDetailsDetailedSection(section, data, sectionId, isFirstSection) {
    const { groups, isMultiKvk } = buildPublicationGroups(data);
    if (groups.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const headRow = `
            <tr>
                <th style="width:4%;">Sl. No.</th>
                <th style="width:14%;">Category</th>
                <th style="width:14%;">Authors</th>
                <th style="width:16%;">Title</th>
                <th style="width:14%;">Journal Name</th>
                <th style="width:6%;">Volume</th>
                <th style="width:6%;">Issue</th>
                <th style="width:6%;">Page No.</th>
                <th style="width:6%;">Year</th>
                <th style="width:10%;">Impact Factor</th>
            </tr>`;

    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `<tr>
                <td style="text-align:center;">${r.sl}</td>
                <td>${esc(r.category)}</td>
                <td>${esc(r.authors)}</td>
                <td>${esc(r.title)}</td>
                <td>${esc(r.journal)}</td>
                <td style="text-align:center;">${esc(r.vol)}</td>
                <td style="text-align:center;">${esc(r.issue)}</td>
                <td style="text-align:center;">${esc(r.pageNo)}</td>
                <td style="text-align:center;">${esc(r.year)}</td>
                <td style="text-align:center;">${esc(r.impact)}</td>
            </tr>`).join('');

        return `
    <div class="pub-det-group">
        <div class="pub-det-kvk-hd">${esc(g.kvkName)}</div>
        <table class="data-table pub-det-table">
            <thead>${headRow}</thead>
            <tbody>${body}</tbody>
        </table>
    </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
    <style>
        .pub-det-group { page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; }
        .pub-det-kvk-hd { font-size: 8pt; font-weight: bold; background: #dce6f1; padding: 3px 5px; border: 0.2px solid #000; border-bottom: 0; page-break-after: avoid; break-after: avoid; }
        .pub-det-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .pub-det-table th, .pub-det-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
        .pub-det-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    ${groupsHtml}
</div>`;
}

module.exports = {
    renderPublicationDetailsDetailedSection,
    buildPublicationDetailsTabularData,
    buildPublicationGroups,
};
