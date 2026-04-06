/**
 * Details of messages sent through other channels Template
 *
 * Renders one table per KVK showing 4 channels as rows:
 *   - Advisories through Text messages
 *   - Advisories through WhatsApp
 *   - Advisories through weather advisory system
 *   - Advisories through social media/FB/Twitter/Instagram/Other
 *
 * Columns: KVK | Channel | No. of farmers covered | No of advisories sent |
 *          Type of messages: Crop | Livestock | Weather | Marketing | Awareness | Other Enterprises
 */

const CHANNELS = [
    {
        label: 'Advisories through Text messages',
        prefix: 'text',
    },
    {
        label: 'Advisories through WhatsApp',
        prefix: 'whatsapp',
    },
    {
        label: 'Advisories through weather advisory system',
        prefix: 'weather',
    },
    {
        label: 'Advisories through social media/FB/Twitter/Instagram/Other',
        prefix: 'social',
    },
];

function _channelValue(row, prefix, field) {
    const key = prefix + field.charAt(0).toUpperCase() + field.slice(1);
    return row[key];
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
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of farmers covered</th>
                <th rowspan="2" style="vertical-align:bottom;">No of advisories sent</th>
                <th colspan="6" style="text-align:center;">Type of messages</th>
            </tr>
            <tr>
                <th>Crop</th><th>Livestock</th><th>Weather</th><th>Marketing</th><th>Awareness</th><th>Other Enterprises</th>
            </tr>
        </thead>
        <tbody>
            <tr><td colspan="9" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>
        </tbody>
    </table>`;
    } else {
        records.forEach(row => {
            const kvk = row.kvk?.kvkName || '-';
            html += `
    <table class="data-table" style="width:100%;margin-bottom:20px;">
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of farmers covered</th>
                <th rowspan="2" style="vertical-align:bottom;">No of advisories sent</th>
                <th colspan="6" style="text-align:center;">Type of messages</th>
            </tr>
            <tr>
                <th>Crop</th><th>Livestock</th><th>Weather</th><th>Marketing</th><th>Awareness</th><th>Other Enterprises</th>
            </tr>
        </thead>
        <tbody>`;

            CHANNELS.forEach(ch => {
                const covered = _channelValue(row, ch.prefix, 'noOfFarmersCovered');
                const sent = _channelValue(row, ch.prefix, 'noOfAdvisoriesSent');
                const crop = _channelValue(row, ch.prefix, 'crop');
                const livestock = _channelValue(row, ch.prefix, 'livestock');
                const weather = _channelValue(row, ch.prefix, 'weather');
                const marketing = _channelValue(row, ch.prefix, 'marketing');
                const awareness = _channelValue(row, ch.prefix, 'awareness');
                const otherEnterprises = _channelValue(row, ch.prefix, 'otherEnterprises');

                html += `
            <tr>
                <td>${this._escapeHtml(kvk)} &mdash; ${this._escapeHtml(ch.label)}</td>
                <td style="text-align:center;">${covered != null ? covered : '0'}</td>
                <td style="text-align:center;">${sent != null ? sent : '0'}</td>
                <td>${this._escapeHtml(crop || '-')}</td>
                <td>${this._escapeHtml(livestock || '-')}</td>
                <td>${this._escapeHtml(weather || '-')}</td>
                <td>${this._escapeHtml(marketing || '-')}</td>
                <td>${this._escapeHtml(awareness || '-')}</td>
                <td>${this._escapeHtml(otherEnterprises || '-')}</td>
            </tr>`;
            });

            html += `
        </tbody>
    </table>`;
        });
    }

    html += `
</div>`;
    return html;
}

module.exports = { renderMsgDetailsSection };
