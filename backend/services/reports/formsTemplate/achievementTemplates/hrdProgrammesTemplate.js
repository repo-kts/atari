/**
 * HRD programmes — same detailed table for Data Management export and modular all-report.
 * Columns: Sl., Staff + designation, Course, Start, End, Duration (days), Organizer, Venue.
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

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function displayRow(row) {
    const organizerRaw = row.organizer ?? row.organizerVenue;
    const venueRaw = row.venue;
    return {
        staffCol: staffDisplay(row),
        course: row.courseName != null && row.courseName !== '' ? row.courseName : '—',
        start: formatDDMMYYYY(row.startDate),
        end: formatDDMMYYYY(row.endDate),
        dur: durationLabel(row),
        organizer: organizerRaw != null && organizerRaw !== '' ? organizerRaw : '—',
        venue: venueRaw != null && venueRaw !== '' ? venueRaw : '—',
    };
}

/**
 * Groups HRD rows by KVK. Sl.No resets within each group.
 * @returns {{ groups: {kvkName: string, rows: object[]}[], isMultiKvk: boolean }}
 */
function buildHrdGroups(rawData) {
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

function renderHrdProgrammesSection(section, data, sectionId, isFirstSection) {
    const { groups } = buildHrdGroups(data);
    if (groups.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const headRow = `
            <tr>
                <th style="width:5%;">Sl. No.</th>
                <th style="width:18%;">Name of Staff and designation</th>
                <th style="width:20%;">Name of course/training program attended</th>
                <th style="width:9%;">Start Date</th>
                <th style="width:9%;">End Date</th>
                <th style="width:7%;">Duration</th>
                <th style="width:16%;">Organizer</th>
                <th style="width:16%;">Venue</th>
            </tr>`;

    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `<tr>
                <td style="text-align:center;">${r.sl}</td>
                <td>${esc(r.staffCol)}</td>
                <td>${esc(r.course)}</td>
                <td style="text-align:center;">${esc(r.start)}</td>
                <td style="text-align:center;">${esc(r.end)}</td>
                <td style="text-align:center;">${esc(r.dur)}</td>
                <td>${esc(r.organizer)}</td>
                <td>${esc(r.venue)}</td>
            </tr>`).join('');

        return `
    <div class="hrd-prog-group">
        <div class="hrd-prog-kvk-hd">${esc(g.kvkName)}</div>
        <table class="data-table hrd-prog-table">
            <thead>${headRow}</thead>
            <tbody>${body}</tbody>
        </table>
    </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .hrd-prog-group { page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; }
        .hrd-prog-kvk-hd { font-size: 8pt; font-weight: bold; background: #dce6f1; padding: 3px 5px; border: 0.2px solid #000; border-bottom: 0; page-break-after: avoid; break-after: avoid; }
        .hrd-prog-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; }
        .hrd-prog-table th, .hrd-prog-table td { border: 0.2px solid #000; padding: 3px 4px; vertical-align: top; word-break: break-word; }
        .hrd-prog-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
    </style>
    ${groupsHtml}
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
        'Organizer',
        'Venue',
    ];
    const out = rows.map((row, idx) => {
        const staffCol = staffDisplay(row);
        const course = row.courseName != null && row.courseName !== '' ? row.courseName : '—';
        const start = formatDDMMYYYY(row.startDate);
        const end = formatDDMMYYYY(row.endDate);
        const dur = durationLabel(row);
        const organizerRaw = row.organizer ?? row.organizerVenue;
        const venueRaw = row.venue;
        const organizer = organizerRaw != null && organizerRaw !== '' ? organizerRaw : '—';
        const venue = venueRaw != null && venueRaw !== '' ? venueRaw : '—';
        return [idx + 1, staffCol, course, start, end, dur, organizer, venue];
    });
    return { headers, rows: out };
}

module.exports = {
    renderHrdProgrammesSection,
    buildHrdProgrammesTabularData,
    buildHrdGroups,
};
