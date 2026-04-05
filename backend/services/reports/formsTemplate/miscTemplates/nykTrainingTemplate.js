/**
 * Nehru Yuva Kendra (NYK) Training Template
 *
 * Renders training records grouped by KVK with multi-level header:
 *   Title | Period (From/To) | No. of participant:
 *     General (M/F/T) | OBC (M/F/T) | SC (M/F/T) | ST (M/F/T) | Total (M/F/T)
 *   | Amount of Fund Received (Rs)
 *
 * Matches the original ATARI website layout exactly.
 *
 * Bound to reportTemplateService (`this`).
 */

function _formatDate(dateValue) {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function _groupByKvk(records) {
    const map = new Map();
    for (const r of records) {
        const name = (r.kvk && r.kvk.kvkName) || 'Unknown KVK';
        if (!map.has(name)) map.set(name, []);
        map.get(name).push(r);
    }
    return map;
}

function renderNykTrainingSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const records = Array.isArray(data) ? data : [data];
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:16px;">Nehru Yuva Kendra</h1>`;

    const grouped = _groupByKvk(records);

    for (const [kvkName, kvkRecords] of grouped) {
        // KVK heading — bold, left-aligned
        html += `
    <p style="font-size:11px;font-weight:bold;margin:20px 0 10px 0;">${this._escapeHtml(kvkName)}</p>
    <table class="data-table" style="width:100%;margin-bottom:20px;">
        <thead>
            <tr>
                <th rowspan="3" style="vertical-align:bottom;">Title of the training programme</th>
                <th colspan="2" style="text-align:center;">Period</th>
                <th colspan="15" style="text-align:center;">No. of the participant</th>
                <th rowspan="3" style="vertical-align:bottom;">Amount of Fund Received (Rs)</th>
            </tr>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">From</th>
                <th rowspan="2" style="vertical-align:bottom;">To</th>
                <th colspan="3" style="text-align:center;">General</th>
                <th colspan="3" style="text-align:center;">OBC</th>
                <th colspan="3" style="text-align:center;">SC</th>
                <th colspan="3" style="text-align:center;">ST</th>
                <th colspan="3" style="text-align:center;">Total</th>
            </tr>
            <tr>`;

        // M/F/T sub-headers for each category (5 categories)
        for (let i = 0; i < 5; i++) {
            html += `
                <th style="text-align:center;">M</th>
                <th style="text-align:center;">F</th>
                <th style="text-align:center;">T</th>`;
        }

        html += `
            </tr>
        </thead>
        <tbody>`;

        for (const row of kvkRecords) {
            const title = row.title || '-';
            const from = _formatDate(row.startDate);
            const to = _formatDate(row.endDate);

            const gM = row.generalM || 0;
            const gF = row.generalF || 0;
            const gT = gM + gF;
            const oM = row.obcM || 0;
            const oF = row.obcF || 0;
            const oT = oM + oF;
            const sM = row.scM || 0;
            const sF = row.scF || 0;
            const sT = sM + sF;
            const tM = row.stM || 0;
            const tF = row.stF || 0;
            const tT = tM + tF;
            const totalM = gM + oM + sM + tM;
            const totalF = gF + oF + sF + tF;
            const totalT = totalM + totalF;
            const fund = row.fundReceived != null ? String(row.fundReceived) : '0';

            html += `
            <tr>
                <td>${this._escapeHtml(title)}</td>
                <td>${this._escapeHtml(from)}</td>
                <td>${this._escapeHtml(to)}</td>
                <td style="text-align:center;">${gM}</td>
                <td style="text-align:center;">${gF}</td>
                <td style="text-align:center;">${gT}</td>
                <td style="text-align:center;">${oM}</td>
                <td style="text-align:center;">${oF}</td>
                <td style="text-align:center;">${oT}</td>
                <td style="text-align:center;">${sM}</td>
                <td style="text-align:center;">${sF}</td>
                <td style="text-align:center;">${sT}</td>
                <td style="text-align:center;">${tM}</td>
                <td style="text-align:center;">${tF}</td>
                <td style="text-align:center;">${tT}</td>
                <td style="text-align:center;">${totalM}</td>
                <td style="text-align:center;">${totalF}</td>
                <td style="text-align:center;">${totalT}</td>
                <td style="text-align:center;">${this._escapeHtml(fund)}</td>
            </tr>`;
        }

        html += `
        </tbody>
    </table>`;
    }

    html += `
</div>`;

    return html;
}

module.exports = {
    renderNykTrainingSection,
};
