/**
 * SAC Meetings State-wise Template
 * Aggregates SAC meeting data by state:
 *   State | No. of Meetings | No of Participants | Total Statutory Members Present(Sate Line Department)
 */

function renderSacMeetingStatewiseSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    // Aggregate by state
    const stateMap = new Map();
    records.forEach(row => {
        const state = row.kvk?.state?.stateName || 'Unknown';
        if (!stateMap.has(state)) {
            stateMap.set(state, { meetings: 0, participants: 0, statutory: 0 });
        }
        const agg = stateMap.get(state);
        agg.meetings += 1;
        agg.participants += (row.numberOfParticipants || 0);
        agg.statutory += (row.statutoryMembersPresent || 0);
    });

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of Scientific Advisory Committee(SAC) Meetings</h1>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <colgroup>
            <col style="width:20%;"><col style="width:20%;"><col style="width:25%;"><col style="width:35%;">
        </colgroup>
        <thead>
            <tr>
                <th>State</th>
                <th>No. of Meetings</th>
                <th>No of Participants</th>
                <th>Total Statutory Members Present(Sate Line Department)</th>
            </tr>
        </thead>
        <tbody>`;

    if (stateMap.size === 0) {
        html += `<tr><td colspan="4" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    for (const [state, agg] of stateMap) {
        html += `
            <tr>
                <td>${this._escapeHtml(state)}</td>
                <td style="text-align:center;">${agg.meetings}</td>
                <td style="text-align:center;">${agg.participants}</td>
                <td style="text-align:center;">${agg.statutory}</td>
            </tr>`;
    }

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderSacMeetingStatewiseSection };
