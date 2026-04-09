/**
 * Data Management / page export: Award and Recognition of Scientist — one row per award.
 * Columns: Sl., Head/Scientist, Award, Amount, Achievement, Authority.
 * (Modular all-report uses scientist-award-summary-report for the aggregated table.)
 */

function fmtAmount(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return String(n);
}

function scientistLabel(row) {
    const s = row.scientistName ?? row.headScientist;
    if (s != null && String(s).trim() !== '') return String(s).trim();
    return '—';
}

function awardLabel(row) {
    const a = row.awardName ?? row.award;
    if (a != null && String(a).trim() !== '') return String(a).trim();
    return '—';
}

function renderScientistAwardDetailedSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row, idx) => {
            const scientist = scientistLabel(row);
            const award = awardLabel(row);
            const amt = fmtAmount(row.amount);
            const ach = row.achievement != null && row.achievement !== '' ? row.achievement : '—';
            const auth = row.conferringAuthority != null && row.conferringAuthority !== '' ? row.conferringAuthority : '—';

            return `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(scientist)}</td>
                <td>${esc(award)}</td>
                <td style="text-align:center;">${esc(amt)}</td>
                <td>${esc(ach)}</td>
                <td>${esc(auth)}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .sci-award-det-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .sci-award-det-table th, .sci-award-det-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
        .sci-award-det-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table sci-award-det-table">
        <thead>
            <tr>
                <th style="width:5%;">Sl. No.</th>
                <th style="width:18%;">Name of the Head/Scientist</th>
                <th style="width:24%;">Name of the Award</th>
                <th style="width:10%;">Amount</th>
                <th style="width:14%;">Achievement</th>
                <th style="width:29%;">Conferring Authority</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

/**
 * @param {unknown} rawData
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildScientistAwardDetailedTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Sl. No.',
        'Name of the Head/Scientist',
        'Name of the Award',
        'Amount',
        'Achievement',
        'Conferring Authority',
    ];
    const out = rows.map((row, idx) => {
        const scientist = scientistLabel(row);
        const award = awardLabel(row);
        const amt = row.amount != null && row.amount !== '' ? row.amount : '—';
        const ach = row.achievement != null && row.achievement !== '' ? row.achievement : '—';
        const auth = row.conferringAuthority != null && row.conferringAuthority !== '' ? row.conferringAuthority : '—';
        return [idx + 1, scientist, award, amt, ach, auth];
    });
    return { headers, rows: out };
}

module.exports = {
    renderScientistAwardDetailedSection,
    buildScientistAwardDetailedTabularData,
};
