/**
 * HRD programmes — same detailed table for Data Management export and modular all-report.
 * Columns: Sl., Staff + designation, Course, Start, End, Duration (days), Organizer/Venue.
 */

function staffDisplay(row) {
    if (row.staffAndDesignation) return row.staffAndDesignation;
    const name = (row.staffName || row.staff || '').trim();
    const post = (row.postName || '').trim();
    if (name && post) return `${name} and ${post}`;
    return name || '—';
}

function formatDDMMYYYY(d) {
    if (!d) return '—';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function inclusiveDurationFromDates(startDate, endDate) {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const utc1 = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const utc2 = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    const days = Math.floor((utc2 - utc1) / 86400000) + 1;
    return days > 0 ? days : null;
}

function durationLabel(row) {
    if (row.durationDays != null && Number.isFinite(Number(row.durationDays))) {
        return String(row.durationDays);
    }
    const computed = inclusiveDurationFromDates(row.startDate, row.endDate);
    return computed != null ? String(computed) : '—';
}

function renderHrdProgrammesSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const body = rows
        .map((row, idx) => {
            const staffCol = staffDisplay(row);
            const course = row.courseName != null && row.courseName !== '' ? row.courseName : '—';
            const start = formatDDMMYYYY(row.startDate);
            const end = formatDDMMYYYY(row.endDate);
            const dur = durationLabel(row);
            const org = row.organizerVenue != null && row.organizerVenue !== '' ? row.organizerVenue : '—';

            return `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(staffCol)}</td>
                <td>${esc(course)}</td>
                <td style="text-align:center;">${esc(start)}</td>
                <td style="text-align:center;">${esc(end)}</td>
                <td style="text-align:center;">${esc(dur)}</td>
                <td>${esc(org)}</td>
            </tr>`;
        })
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .hrd-prog-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .hrd-prog-table th, .hrd-prog-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
        .hrd-prog-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    <table class="data-table hrd-prog-table">
        <thead>
            <tr>
                <th style="width:5%;">Sl. No.</th>
                <th style="width:18%;">Name of Staff and designation</th>
                <th style="width:22%;">Name of course/training program attended</th>
                <th style="width:10%;">Start Date</th>
                <th style="width:10%;">End Date</th>
                <th style="width:8%;">Duration</th>
                <th style="width:27%;">Organizer/Venue</th>
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
function buildHrdProgrammesTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'Sl. No.',
        'Name of Staff and designation',
        'Name of course/training program attended',
        'Start Date',
        'End Date',
        'Duration',
        'Organizer/Venue',
    ];
    const out = rows.map((row, idx) => {
        const staffCol = staffDisplay(row);
        const course = row.courseName != null && row.courseName !== '' ? row.courseName : '—';
        const start = formatDDMMYYYY(row.startDate);
        const end = formatDDMMYYYY(row.endDate);
        const dur = durationLabel(row);
        const org = row.organizerVenue != null && row.organizerVenue !== '' ? row.organizerVenue : '—';
        return [idx + 1, staffCol, course, start, end, dur, org];
    });
    return { headers, rows: out };
}

module.exports = {
    renderHrdProgrammesSection,
    buildHrdProgrammesTabularData,
};
