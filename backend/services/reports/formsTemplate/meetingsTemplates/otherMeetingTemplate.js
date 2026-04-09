/**
 * Details of other meeting related to ATARI Template
 * Columns: KVK | Meeting Date | Type of Meeting | Agenda | Representative from ATARI
 */

function _formatDate(v) {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderOtherMeetingSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of other meeting related to ATARI</h1>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <colgroup>
            <col style="width:12%;"><col style="width:10%;"><col style="width:15%;">
            <col style="width:40%;"><col style="width:23%;">
        </colgroup>
        <thead>
            <tr>
                <th>KVK</th>
                <th>Meeting Date</th>
                <th>Type of Meeting</th>
                <th>Agenda</th>
                <th>Representative from ATARI</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = row.kvk?.kvkName || '-';
        const date = _formatDate(row.meetingDate);
        const type = row.typeOfMeeting || '-';
        const agenda = row.agenda || '-';
        const representative = row.representativeFromAtari || '-';

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(date)}</td>
                <td>${this._escapeHtml(type)}</td>
                <td style="word-wrap:break-word;word-break:break-word;">${this._escapeHtml(agenda)}</td>
                <td style="word-wrap:break-word;word-break:break-word;">${this._escapeHtml(representative)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderOtherMeetingSection };
