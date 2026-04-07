/**
 * List of VIP Visitors Template
 *
 * Renders a flat table matching the original ATARI website:
 *   KVK | Date | Name of the person | Purpose of visit
 *
 * Title: "List of other visitors (MP/MLA/DM/VC/Zila Parishad/Other Head of Organization/Foreigners)"
 * Bound to reportTemplateService (`this`).
 */

function _formatDate(dateValue) {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderVipVisitorsSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">List of other visitors (MP/MLA/DM/VC/Zila Parishad/Other Head of Organization/Foreigners)</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th>KVK</th>
                <th>Date</th>
                <th>Name of the person</th>
                <th>Purpose of visit</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr>
                <td colspan="4" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td>
            </tr>`;
    }

    records.forEach((row) => {
        const kvk = row.kvk?.kvkName || '-';
        const date = _formatDate(row.dateOfVisit);
        const name = row.ministerName || '-';
        const purpose = row.salientPoints || '-';

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(date)}</td>
                <td>${this._escapeHtml(name)}</td>
                <td>${this._escapeHtml(purpose)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = { renderVipVisitorsSection };
