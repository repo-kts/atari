/**
 * Swachhta Pakhwada State-wise Template
 * Aggregates pakhwada data by state:
 *   State | No. of Observation | Total No of Activities undertaken |
 *   No. of Participants: Staffs | Farmers | Others | Total
 */

function renderSwachhtaPakhwadaStatewiseSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    // Aggregate by state
    const stateMap = new Map();
    records.forEach(row => {
        const state = row.kvk?.state?.stateName || 'Unknown';
        if (!stateMap.has(state)) {
            stateMap.set(state, { observations: 0, activities: 0, staff: 0, farmers: 0, others: 0 });
        }
        const agg = stateMap.get(state);
        agg.observations += 1;
        agg.activities += (row.totalActivities || 0);
        agg.staff += (row.staffCount || 0);
        agg.farmers += (row.farmerCount || 0);
        agg.others += (row.othersCount || 0);
    });

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Observation of Swachta Pakhwada</h1>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <colgroup>
            <col style="width:12%;"><col style="width:14%;"><col style="width:26%;">
            <col style="width:12%;"><col style="width:12%;"><col style="width:12%;"><col style="width:12%;">
        </colgroup>
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">State</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of Observation</th>
                <th rowspan="2" style="vertical-align:bottom;">Total No of Activities undertaken</th>
                <th colspan="4" style="text-align:center;">No. of Participants</th>
            </tr>
            <tr>
                <th style="text-align:center;">Staffs</th>
                <th style="text-align:center;">Farmers</th>
                <th style="text-align:center;">Others</th>
                <th style="text-align:center;">Total</th>
            </tr>
        </thead>
        <tbody>`;

    if (stateMap.size === 0) {
        html += `<tr><td colspan="7" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    for (const [state, agg] of stateMap) {
        const total = agg.staff + agg.farmers + agg.others;
        html += `
            <tr>
                <td>${this._escapeHtml(state)}</td>
                <td style="text-align:center;">${agg.observations}</td>
                <td style="text-align:center;">${agg.activities}</td>
                <td style="text-align:center;">${agg.staff}</td>
                <td style="text-align:center;">${agg.farmers}</td>
                <td style="text-align:center;">${agg.others}</td>
                <td style="text-align:center;">${total}</td>
            </tr>`;
    }

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderSwachhtaPakhwadaStatewiseSection };
