/**
 * Mobile App Template
 * Columns: KVK | Number of Mobile Apps developed by KVK | Name of the Apps |
 *          Language of the Apps | Meant for crop/livestock/fishery/others | No. of times downloaded
 */
function pickValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}

function getKvkName(row) {
    return pickValue(row?.kvk?.kvkName, row?.kvkName, row?.data?.kvkName) || '-';
}

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function renderMobileAppSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of Mobile App</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th>KVK</th>
                <th>Number of Mobile Apps developed by KVK</th>
                <th>Name of the Apps</th>
                <th>Language of the Apps</th>
                <th>Meant for crop/ livestock/ fishery/ others</th>
                <th>No. of times downloaded</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr><td colspan="6" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    let totalApps = 0;
    let totalDownloads = 0;
    records.forEach(row => {
        const kvk = getKvkName(row);
        const countValue = pickValue(row.numberOfAppsDeveloped, row.numberOfMobileAppsDevelopedByKvk);
        const countNumber = toNumber(countValue);
        const count = String(countNumber);
        const name = row.nameOfApp || '-';
        const language = row.languageOfApp || '-';
        const meantFor = row.meantFor || '-';
        const downloadsValue = pickValue(row.numberOfTimesDownloaded, row.noOfTimesDownloaded);
        const downloadsNumber = toNumber(downloadsValue);
        const downloads = String(downloadsNumber);
        totalApps += countNumber;
        totalDownloads += downloadsNumber;
        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td style="text-align:center;">${this._escapeHtml(count)}</td>
                <td>${this._escapeHtml(name)}</td>
                <td>${this._escapeHtml(language)}</td>
                <td>${this._escapeHtml(meantFor)}</td>
                <td style="text-align:center;">${this._escapeHtml(downloads)}</td>
            </tr>`;
    });

    if (records.length > 0) {
        html += `
            <tr style="font-weight:bold;background:#f5f5f5;page-break-inside:avoid;">
                <td>Total</td>
                <td style="text-align:center;">${totalApps}</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td style="text-align:center;">${totalDownloads}</td>
            </tr>`;
    }

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderMobileAppSection };
