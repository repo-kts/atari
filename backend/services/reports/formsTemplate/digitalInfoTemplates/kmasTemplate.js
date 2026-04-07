/**
 * Kisan Mobile Advisory Services (KMAS) Template
 * Columns: KVK | No. of farmers covered | No of advisories sent | Type of messages:
 *          Crop | Livestock | Weather | Marketing | Awareness | Other Enterprises | Any Other
 */
function renderKmasSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Kisan Mobile Advisory Services/KMAS (m-Kisan Portal/National Farmers Portal/ SMS Portal)</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of farmers covered</th>
                <th rowspan="2" style="vertical-align:bottom;">No of advisories sent</th>
                <th colspan="7" style="text-align:center;">Type of messages</th>
            </tr>
            <tr>
                <th style="text-align:center;">Crop</th>
                <th style="text-align:center;">Livestock</th>
                <th style="text-align:center;">Weather</th>
                <th style="text-align:center;">Marketing</th>
                <th style="text-align:center;">Awareness</th>
                <th style="text-align:center;">Other Enterprises</th>
                <th style="text-align:center;">Any Other</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr><td colspan="10" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    records.forEach(row => {
        const kvk = row.kvk?.kvkName || '-';
        const covered = row.noOfFarmersCovered != null ? String(row.noOfFarmersCovered) : '0';
        const sent = row.noOfAdvisoriesSent != null ? String(row.noOfAdvisoriesSent) : '0';
        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td style="text-align:center;">${this._escapeHtml(covered)}</td>
                <td style="text-align:center;">${this._escapeHtml(sent)}</td>
                <td>${this._escapeHtml(row.crop || '-')}</td>
                <td>${this._escapeHtml(row.livestock || '-')}</td>
                <td>${this._escapeHtml(row.weather || '-')}</td>
                <td>${this._escapeHtml(row.marketing || '-')}</td>
                <td>${this._escapeHtml(row.awareness || '-')}</td>
                <td>${this._escapeHtml(row.otherEnterprises || '-')}</td>
                <td>${this._escapeHtml(row.anyOther || '-')}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderKmasSection };
