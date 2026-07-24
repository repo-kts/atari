/**
 * Details of messages sent through other channels Template
 *
 * One table per KVK with 4 channel rows. Matches original layout:
 *   KVK (col 1) | Channel description (col 2, no header) |
 *   No. of farmers covered | No of advisories sent |
 *   Type of messages: Crop | Livestock | Weather | Marketing | Awareness | Other Enterprises
 */

const CHANNELS = [
    { label: 'Advisories through Text messages', prefix: 'text' },
    { label: 'Advisories through WhatsApp', prefix: 'whatsapp' },
    { label: 'Advisories through weather advisory bulletin', prefix: 'weather' },
    { label: 'Advisories through social media/FB/Twitter/Instagram/Other', prefix: 'social' },
];

function pickValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}

function getKvkName(row) {
    return pickValue(row?.kvk?.kvkName, row?.kvkName, row?.data?.kvkName) || '-';
}

function _channelValue(row, prefix, field) {
    const key = prefix + field.charAt(0).toUpperCase() + field.slice(1);
    return row[key];
}

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function _renderTableHeader(ctx) {
    return `
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2"></th>
                <th rowspan="2" style="vertical-align:bottom;">No. of farmers covered</th>
                <th rowspan="2" style="vertical-align:bottom;">No of advisories sent</th>
                <th colspan="6" style="text-align:center;">Type of messages</th>
            </tr>
            <tr>
                <th style="text-align:center;">Crop</th>
                <th style="text-align:center;">Livestock</th>
                <th style="text-align:center;">Weather</th>
                <th style="text-align:center;">Marketing</th>
                <th style="text-align:center;">Awareness</th>
                <th style="text-align:center;">Other Enterprises</th>
            </tr>
        </thead>`;
}

function renderMsgDetailsSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:16px;">Details of messages send through other channels</h1>`;

    if (records.length === 0) {
        html += `
    <table class="data-table" style="width:100%;">
        ${_renderTableHeader(this)}
        <tbody>
            <tr><td colspan="10" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>
        </tbody>
    </table>`;
    } else {
        records.forEach(row => {
            const kvk = getKvkName(row);
            let totalFarmersCovered = 0;
            let totalAdvisoriesSent = 0;
            html += `
    <table class="data-table" style="width:100%;margin-bottom:20px;">
        ${_renderTableHeader(this)}
        <tbody>`;

            CHANNELS.forEach(ch => {
                const covered = _channelValue(row, ch.prefix, 'noOfFarmersCovered');
                const sent = _channelValue(row, ch.prefix, 'noOfAdvisoriesSent');
                const coveredNumber = toNumber(covered);
                const sentNumber = toNumber(sent);
                totalFarmersCovered += coveredNumber;
                totalAdvisoriesSent += sentNumber;
                const crop = _channelValue(row, ch.prefix, 'crop');
                const livestock = _channelValue(row, ch.prefix, 'livestock');
                const weather = _channelValue(row, ch.prefix, 'weather');
                const marketing = _channelValue(row, ch.prefix, 'marketing');
                const awareness = _channelValue(row, ch.prefix, 'awareness');
                const otherEnterprises = _channelValue(row, ch.prefix, 'otherEnterprises');

                html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(ch.label)}</td>
                <td style="text-align:center;">${coveredNumber}</td>
                <td style="text-align:center;">${sentNumber}</td>
                <td style="text-align:center;">${this._escapeHtml(String(crop || '0'))}</td>
                <td style="text-align:center;">${this._escapeHtml(String(livestock || '0'))}</td>
                <td style="text-align:center;">${this._escapeHtml(String(weather || '0'))}</td>
                <td style="text-align:center;">${this._escapeHtml(String(marketing || '0'))}</td>
                <td style="text-align:center;">${this._escapeHtml(String(awareness || '0'))}</td>
                <td style="text-align:center;">${this._escapeHtml(String(otherEnterprises || '0'))}</td>
            </tr>`;
            });

            html += `
            <tr style="font-weight:bold;background:#f5f5f5;page-break-inside:avoid;">
                <td>Total</td>
                <td>—</td>
                <td style="text-align:center;">${totalFarmersCovered}</td>
                <td style="text-align:center;">${totalAdvisoriesSent}</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
            </tr>
        </tbody>
    </table>`;
        });
    }

    html += `
</div>`;
    return html;
}

module.exports = { renderMsgDetailsSection };
