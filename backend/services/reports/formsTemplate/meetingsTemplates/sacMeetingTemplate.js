/**
 * Details of Scientific Advisory Committee (SAC) Meetings Template
 * Columns: KVK | Start Date | End Date | No of Participants | Statutory Members Present |
 *          Salient Recommendations | Action Taken | Reason
 */

function _formatDate(v) {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function pickValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}

function getKvkName(row) {
    return pickValue(row?.kvk?.kvkName, row?.kvkName, row?.data?.kvkName) || '-';
}

function renderSacMeetingSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <style>
      .sac-table { width:100%; table-layout:fixed; border-collapse:collapse; }
      .sac-table th, .sac-table td {
        font-size:7.5pt; line-height:1.25; padding:3px 4px; vertical-align:top;
        white-space:normal; word-break:break-word; overflow-wrap:anywhere;
      }
      .sac-table th { vertical-align:bottom; text-align:center; }
    </style>
    <h1 class="section-title" style="margin-bottom:10px;">Details of Scientific Advisory Committee(SAC) Meetings</h1>
    <table class="data-table sac-table">
        <colgroup>
            <col style="width:9%;"><col style="width:8%;"><col style="width:8%;"><col style="width:8%;">
            <col style="width:11%;"><col style="width:34%;"><col style="width:10%;"><col style="width:12%;">
        </colgroup>
        <thead>
            <tr>
                <th>KVK</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>No of Participants</th>
                <th>Total Statutory Members Present</th>
                <th>Salient Recommendations</th>
                <th>Action Taken</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `<tr><td colspan="8" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = getKvkName(row);
        const start = _formatDate(row.startDate);
        const end = _formatDate(row.endDate);
        const participants = row.numberOfParticipants != null ? row.numberOfParticipants : 0;
        const statutory = row.statutoryMembersPresent != null ? row.statutoryMembersPresent : 0;
        const recommendations = row.salientRecommendations || '-';
        const storedAction = row.inCompliance === 'YES' ? 'IN_COMPLIANCE' : row.actionTaken;
        const action = storedAction === 'YES'
            ? 'Yes'
            : storedAction === 'NO'
                ? 'No'
                : storedAction === 'IN_COMPLIANCE'
                    ? 'In Compliance'
                    : '-';
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
