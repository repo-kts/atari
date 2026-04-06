/**
 * Observation of Swachhta hi Sewa SBA Template
 * Columns: KVK | Date/Duration of Observation | Total No of Activities undertaken |
 *          No. of Participants: Staffs | Farmers | Others | Total
 */

function _formatDate(v) {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderSwachhtaSewaSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Observation of Swachhta hi Sewa SBA</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2" style="vertical-align:bottom;">Date/ Duration of Observation</th>
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

    if (records.length === 0) {
        html += `<tr><td colspan="7" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = row.kvk?.kvkName || '-';
        const date = _formatDate(row.observationDate);
        const activities = row.totalActivities != null ? row.totalActivities : 0;
        const staff = row.staffCount || 0;
        const farmers = row.farmerCount || 0;
        const others = row.othersCount || 0;
        const total = staff + farmers + others;

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(date)}</td>
                <td style="text-align:center;">${activities}</td>
                <td style="text-align:center;">${staff}</td>
                <td style="text-align:center;">${farmers}</td>
                <td style="text-align:center;">${others}</td>
                <td style="text-align:center;">${total}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderSwachhtaSewaSection };
