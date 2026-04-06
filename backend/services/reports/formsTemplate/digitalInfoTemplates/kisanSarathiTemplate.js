/**
 * Kisan Sarathi Template
 * Columns: Name of KVK | No. of farmers registered on KSP portal | Phone call addressed | Answered Call
 */
function renderKisanSarathiSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of Kisan Sarathi</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th>Name of KVK</th>
                <th>No. of farmers registered on KSP portal</th>
                <th>Phone call addressed</th>
                <th>Answered Call</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr><td colspan="4" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = row.kvk?.kvkName || '-';
        const registered = row.noOfFarmersRegisteredOnKspPortal != null ? String(row.noOfFarmersRegisteredOnKspPortal) : '0';
        const addressed = row.phoneCallAddressed != null ? String(row.phoneCallAddressed) : '0';
        const answered = row.phoneCallAnswered != null ? String(row.phoneCallAnswered) : '0';
        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td style="text-align:center;">${this._escapeHtml(registered)}</td>
                <td style="text-align:center;">${this._escapeHtml(addressed)}</td>
                <td style="text-align:center;">${this._escapeHtml(answered)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderKisanSarathiSection };
