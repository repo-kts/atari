/**
 * KVK Web Portal Template
 * Columns: KVK | No. of visitors visited the portal | No. of farmers registered on the portal
 */
function renderWebPortalSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of KVK Portal</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th>KVK</th>
                <th>No. of visitors visited the portal</th>
                <th>No. of farmers registered on the portal</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr><td colspan="3" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = row.kvk?.kvkName || '-';
        const visitors = row.noOfVisitors != null ? String(row.noOfVisitors) : '0';
        const registered = row.noOfFarmersRegistered != null ? String(row.noOfFarmersRegistered) : '0';
        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td style="text-align:center;">${this._escapeHtml(visitors)}</td>
                <td style="text-align:center;">${this._escapeHtml(registered)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderWebPortalSection };
