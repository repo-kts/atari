/**
 * Publication details grouped first by KVK and then by publication item.
 * Each publication-item table includes its expected conditional fields, plus
 * any other optional field that is populated on the source records.
 */

const CORE_COLUMNS = [
    { key: 'year', label: 'Publication Year', align: 'center' },
    { key: 'title', label: 'Title' },
    { key: 'authors', label: 'Author Name' },
];

const OPTIONAL_COLUMNS = [
    { key: 'journal', label: 'Journal Name' },
    { key: 'pageNo', label: 'Page Number', align: 'center' },
    { key: 'naasRating', label: 'NAAS Rating', align: 'center' },
    { key: 'publisher', label: 'Publisher Name' },
    { key: 'venue', label: 'Venue' },
    { key: 'isbnNumber', label: 'ISBN Number' },
];

const EXPECTED_FIELDS_BY_PUBLICATION = new Map([
    ['research paper published', ['journal', 'pageNo', 'naasRating']],
    ['abstracts published in seminar or conference or symposia', ['publisher', 'venue']],
    ['books published', ['publisher', 'isbnNumber']],
    ['book chapter published', ['publisher', 'isbnNumber']],
    ['popular articles published', ['publisher', 'pageNo']],
]);

const TABULAR_COLUMNS = [
    { key: 'category', label: 'Publication Item' },
    ...CORE_COLUMNS,
    ...OPTIONAL_COLUMNS,
];

function normalizeCategory(row) {
    if (row == null) return 'Not categorized';
    const direct = row.category ?? row.publicationOther ?? row.publicationName ?? row.publicationItem;
    if (direct != null && String(direct).trim() !== '') return String(direct).trim();
    if (typeof row.publication === 'string' && row.publication.trim() !== '') {
        return row.publication.trim();
    }
    return 'Not categorized';
}

function normalizeYear(row) {
    if (row.year != null && row.year !== '') return String(row.year);
    if (row.reportingYear == null || row.reportingYear === '') return '-';

    if (typeof row.reportingYear === 'string') {
        const match = row.reportingYear.match(/^(\d{4})/);
        if (match) return match[1];
    }

    const date = row.reportingYear instanceof Date
        ? row.reportingYear
        : new Date(row.reportingYear);
    return Number.isNaN(date.getTime()) ? String(row.reportingYear) : String(date.getUTCFullYear());
}

function present(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
}

function displayValue(value) {
    return present(value) ? String(value) : '-';
}

function displayRow(row) {
    return {
        category: normalizeCategory(row),
        year: normalizeYear(row),
        title: displayValue(row.title),
        authors: displayValue(row.authorName),
        journal: displayValue(row.journalName),
        pageNo: displayValue(row.pageNo ?? row.pageNumber),
        naasRating: displayValue(row.naasRating),
        publisher: displayValue(row.publisherName),
        venue: displayValue(row.venue),
        isbnNumber: displayValue(row.isbnNumber),
    };
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function columnsForPublication(publicationItem, rows) {
    const expected = new Set(
        EXPECTED_FIELDS_BY_PUBLICATION.get(publicationItem.toLocaleLowerCase()) || ['publisher'],
    );

    for (const column of OPTIONAL_COLUMNS) {
        if (rows.some((row) => row[column.key] !== '-')) expected.add(column.key);
    }

    return [
        ...CORE_COLUMNS,
        ...OPTIONAL_COLUMNS.filter((column) => expected.has(column.key)),
    ];
}

/**
 * @returns {{ groups: Array<{kvkName: string, publicationGroups: object[]}>, isMultiKvk: boolean }}
 */
function buildPublicationGroups(rawData) {
    const sourceRows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();

    for (const sourceRow of sourceRows) {
        const kvkName = present(sourceRow?.kvkName) ? String(sourceRow.kvkName).trim() : 'Unknown KVK';
        const row = displayRow(sourceRow || {});
        if (!byKvk.has(kvkName)) byKvk.set(kvkName, new Map());
        const byPublication = byKvk.get(kvkName);
        if (!byPublication.has(row.category)) byPublication.set(row.category, []);
        byPublication.get(row.category).push(row);
    }

    const groups = [...byKvk.entries()]
        .sort(([a], [b]) => sortStr(a, b))
        .map(([kvkName, byPublication]) => ({
            kvkName,
            publicationGroups: [...byPublication.entries()]
                .sort(([a], [b]) => sortStr(a, b))
                .map(([publicationItem, rows]) => ({
                    publicationItem,
                    columns: columnsForPublication(publicationItem, rows),
                    rows: rows.map((row, index) => ({ sl: index + 1, ...row })),
                })),
        }));

    return { groups, isMultiKvk: groups.length > 1 };
}

function buildPublicationDetailsTabularData(rawData) {
    const sourceRows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const rows = sourceRows.map((sourceRow, index) => {
        const row = displayRow(sourceRow || {});
        return [index + 1, ...TABULAR_COLUMNS.map((column) => row[column.key])];
    });

    return {
        headers: ['Sl. No.', ...TABULAR_COLUMNS.map((column) => column.label)],
        rows,
    };
}

function renderPublicationDetailsDetailedSection(section, data, sectionId, isFirstSection) {
    const { groups } = buildPublicationGroups(data);
    if (groups.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (value) => this._escapeHtml(value ?? '');

    const groupsHtml = groups.map((kvkGroup) => {
        const publicationHtml = kvkGroup.publicationGroups.map((publicationGroup) => {
            const headers = publicationGroup.columns
                .map((column) => `<th>${esc(column.label)}</th>`)
                .join('');
            const rows = publicationGroup.rows.map((row) => {
                const cells = publicationGroup.columns.map((column) => {
                    const align = column.align ? ` style="text-align:${column.align};"` : '';
                    return `<td${align}>${esc(row[column.key])}</td>`;
                }).join('');
                return `<tr><td style="text-align:center;">${row.sl}</td>${cells}</tr>`;
            }).join('');

            return `
        <div class="pub-item-group">
            <div class="pub-item-heading">Publication Item: ${esc(publicationGroup.publicationItem)}</div>
            <table class="data-table pub-detail-table">
                <thead><tr><th style="width:5%;">Sl. No.</th>${headers}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
        }).join('');

        return `
    <div class="pub-kvk-group">
        <div class="pub-kvk-heading">KVK: ${esc(kvkGroup.kvkName)}</div>
        ${publicationHtml}
    </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .pub-kvk-group { margin-bottom: 12px; }
        .pub-kvk-heading { font-size: 8.5pt; font-weight: bold; background: #dce6f1; border: 0.2px solid #000; padding: 4px 6px; }
        .pub-item-group { page-break-inside: avoid; break-inside: avoid; margin: 6px 0 10px; }
        .pub-item-heading { font-size: 7.5pt; font-weight: bold; padding: 3px 5px; background: #f3f3f3; border: 0.2px solid #000; border-bottom: 0; }
        .pub-detail-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .pub-detail-table th, .pub-detail-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; overflow-wrap: anywhere; }
        .pub-detail-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    ${groupsHtml}
</div>`;
}

module.exports = {
    renderPublicationDetailsDetailedSection,
    buildPublicationDetailsTabularData,
    buildPublicationGroups,
};
