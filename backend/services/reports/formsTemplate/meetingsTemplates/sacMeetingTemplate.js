/**
 * Details of Scientific Advisory Committee (SAC) Meetings Template
 * Columns: KVK | Start Date | End Date | No of Participants | Statutory Members Present |
 *          Salient Recommendations | Action | Reason
 */

function _formatDate(v) {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderSacMeetingSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of Scientific Advisory Committee(SAC) Meetings</h1>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <colgroup>
            <col style="width:8%;"><col style="width:6%;"><col style="width:6%;"><col style="width:5%;">
            <col style="width:6%;"><col style="width:50%;"><col style="width:5%;"><col style="width:14%;">
        </colgroup>
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2" style="vertical-align:bottom;">Start Date</th>
                <th rowspan="2" style="vertical-align:bottom;">End Date</th>
                <th rowspan="2" style="vertical-align:bottom;">No of Participants</th>
                <th rowspan="2" style="vertical-align:bottom;">Total Statutory Members Present</th>
                <th rowspan="2" style="vertical-align:bottom;">Salient Recommendations</th>
                <th colspan="2" style="text-align:center;">Action</th>
            </tr>
            <tr>
                <th style="text-align:center;">Reason</th>
                <th style="text-align:center;"></th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `<tr><td colspan="8" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = row.kvk?.kvkName || '-';
        const start = _formatDate(row.startDate);
        const end = _formatDate(row.endDate);
        const participants = row.numberOfParticipants != null ? row.numberOfParticipants : 0;
        const statutory = row.statutoryMembersPresent != null ? row.statutoryMembersPresent : 0;
        const recommendations = row.salientRecommendations || '-';
        const action = row.actionTaken === 'YES' ? 'yes' : row.actionTaken === 'NO' ? 'no' : '-';
        const reason = row.reason || '-';

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(start)}</td>
                <td>${this._escapeHtml(end)}</td>
                <td style="text-align:center;">${participants}</td>
                <td style="text-align:center;">${statutory}</td>
                <td style="word-wrap:break-word;word-break:break-word;">${this._escapeHtml(recommendations)}</td>
                <td style="text-align:center;">${action}</td>
                <td style="word-wrap:break-word;word-break:break-word;">${this._escapeHtml(reason)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderSacMeetingSection };
