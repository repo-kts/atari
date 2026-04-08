/**
 * Page report / data-management export: one row per publication entry (10 columns).
 * Repository rows use `category`; form/API rows use `publicationItem` / `publication`.
 * Volume/issue/page/impact not stored on form — shown as "-".
 */

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

/**
 * @param {unknown} rawData
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildPublicationDetailsTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
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
    const out = rows.map((row, idx) => {
        const category = normalizeCategory(row);
        const authors = row.authorName ?? '-';
        const title = row.title ?? '-';
        const journal = row.journalName ?? '-';
        const vol = row.volume != null && row.volume !== '' ? row.volume : '-';
        const issue = row.issue != null && row.issue !== '' ? row.issue : '-';
        const pageNo = row.pageNo != null && row.pageNo !== '' ? row.pageNo : '-';
        const year = normalizeYear(row) || '-';
        const impact = row.impactFactor != null && row.impactFactor !== '' ? row.impactFactor : '-';
        return [idx + 1, category, authors, title, journal, vol, issue, pageNo, year, impact];
    });
    return { headers, rows: out };
}

function renderPublicationDetailsDetailedSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row, idx) => {
            const category = normalizeCategory(row);
            const authors = row.authorName ?? '-';
            const title = row.title ?? '-';
            const journal = row.journalName ?? '-';
            const vol = row.volume != null && row.volume !== '' ? row.volume : '-';
            const issue = row.issue != null && row.issue !== '' ? row.issue : '-';
            const pageNo = row.pageNo != null && row.pageNo !== '' ? row.pageNo : '-';
            const yearRaw = normalizeYear(row);
            const year = yearRaw !== '' ? yearRaw : '-';
            const impact = row.impactFactor != null && row.impactFactor !== '' ? row.impactFactor : '-';

            return `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(category)}</td>
                <td>${esc(authors)}</td>
                <td>${esc(title)}</td>
                <td>${esc(journal)}</td>
                <td style="text-align:center;">${esc(vol)}</td>
                <td style="text-align:center;">${esc(issue)}</td>
                <td style="text-align:center;">${esc(pageNo)}</td>
                <td style="text-align:center;">${esc(year)}</td>
                <td style="text-align:center;">${esc(impact)}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
    <style>
        .pub-det-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .pub-det-table th, .pub-det-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
        .pub-det-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table pub-det-table">
        <thead>
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
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderPublicationDetailsDetailedSection,
    buildPublicationDetailsTabularData,
};
