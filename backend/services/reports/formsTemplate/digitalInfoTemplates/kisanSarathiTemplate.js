/**
 * Kisan Sarathi Template
 * Columns: Name of KVK | No. of farmers registered on KSP portal | Phone call addressed | Answered Call
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

    let totalRegistered = 0;
    let totalAddressed = 0;
    let totalAnswered = 0;
    records.forEach(row => {
        const kvk = getKvkName(row);
        const registeredValue = pickValue(row.noOfFarmersRegisteredOnKspPortal, row.numberOfFarmersRegisteredOnKspPortal);
        const registeredNumber = toNumber(registeredValue);
        const addressedNumber = toNumber(row.phoneCallAddressed);
        const answeredValue = pickValue(row.phoneCallAnswered, row.answeredCall);
        const answeredNumber = toNumber(answeredValue);
        const registered = String(registeredNumber);
        const addressed = String(addressedNumber);
        const answered = String(answeredNumber);
        totalRegistered += registeredNumber;
        totalAddressed += addressedNumber;
        totalAnswered += answeredNumber;
        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td style="text-align:center;">${this._escapeHtml(registered)}</td>
                <td style="text-align:center;">${this._escapeHtml(addressed)}</td>
                <td style="text-align:center;">${this._escapeHtml(answered)}</td>
            </tr>`;
    });

    if (records.length > 0) {
        html += `
            <tr style="font-weight:bold;background:#f5f5f5;page-break-inside:avoid;">
                <td>Total</td>
                <td style="text-align:center;">${totalRegistered}</td>
                <td style="text-align:center;">${totalAddressed}</td>
                <td style="text-align:center;">${totalAnswered}</td>
            </tr>`;
    }

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderKisanSarathiSection };
