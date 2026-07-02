/**
 * Poshan Maah Template
 *
 * Renders datewise Poshan Maah event/programme records grouped by KVK with a
 * multi-level header matching the source sheet:
 *
 *   Datewise activity (date) | No. of activities conducted | Name of Event/Programme
 *   | No. of saplings planted | No. of vegetable kits distributed
 *   | No. of participants: Girls | Farm Woman | Farmers | Anganwadi Workers
 *                          | Govt Officials | Public Representatives
 *   | Total Participants
 *
 * Bound to reportTemplateService (`this`) so `this._escapeHtml` is available —
 * the same generic HTML that feeds the PDF, Excel and Word exports.
 */

const PARTICIPANT_FIELDS = [
    'girls',
    'farmWomen',
    'farmers',
    'anganwadiWorkers',
    'govtOfficials',
    'publicRepresentatives',
];

// Total number of columns (used for the empty-state colspan).
const COLUMN_COUNT = 12;

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

function _headerHtml() {
    return `
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">Datewise activity</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of activities conducted</th>
                <th rowspan="2" style="vertical-align:bottom;">Name of Event/Programme</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of saplings planted</th>
                <th rowspan="2" style="vertical-align:bottom;">No. of vegetable kits distributed</th>
                <th colspan="6" style="text-align:center;">No. of participants</th>
                <th rowspan="2" style="vertical-align:bottom;">Total Participants</th>
            </tr>
            <tr>
                <th style="text-align:center;">Girls</th>
                <th style="text-align:center;">Farm Woman</th>
                <th style="text-align:center;">Farmers</th>
                <th style="text-align:center;">Anganwadi Workers</th>
                <th style="text-align:center;">Govt Officials</th>
                <th style="text-align:center;">Public Representatives</th>
            </tr>
        </thead>`;
}

function renderPoshanMaahSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:16px;">Poshan Maah</h1>`;

    const grouped = _groupByKvk(records);

    // No data → standard header with an empty-state row.
    if (grouped.size === 0) {
        html += `
    <table class="data-table" style="width:100%;margin-bottom:20px;">
        ${_headerHtml()}
        <tbody>
            <tr>
                <td colspan="${COLUMN_COUNT}" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td>
            </tr>
        </tbody>
    </table>
</div>`;
        return html;
    }

    for (const [kvkName, kvkRecords] of grouped) {
        // KVK heading — bold, left-aligned (mirrors the other misc reports).
        html += `
    <p style="font-size:11px;font-weight:bold;margin:20px 0 10px 0;">${this._escapeHtml(kvkName)}</p>
    <table class="data-table" style="width:100%;margin-bottom:20px;">
        ${_headerHtml()}
        <tbody>`;

        for (const row of kvkRecords) {
            const participantSum = PARTICIPANT_FIELDS.reduce(
                (sum, field) => sum + (Number(row[field]) || 0),
                0
            );
            // Prefer the stored (server-computed) total; fall back to the sum.
            const total = row.totalParticipants != null ? Number(row.totalParticipants) : participantSum;

            html += `
            <tr>
                <td>${this._escapeHtml(_formatDate(row.activityDate))}</td>
                <td style="text-align:center;">${Number(row.activitiesConducted) || 0}</td>
                <td>${this._escapeHtml(row.eventName || '-')}</td>
                <td style="text-align:center;">${Number(row.saplingsPlanted) || 0}</td>
                <td style="text-align:center;">${Number(row.vegetableKitsDistributed) || 0}</td>
                <td style="text-align:center;">${Number(row.girls) || 0}</td>
                <td style="text-align:center;">${Number(row.farmWomen) || 0}</td>
                <td style="text-align:center;">${Number(row.farmers) || 0}</td>
                <td style="text-align:center;">${Number(row.anganwadiWorkers) || 0}</td>
                <td style="text-align:center;">${Number(row.govtOfficials) || 0}</td>
                <td style="text-align:center;">${Number(row.publicRepresentatives) || 0}</td>
                <td style="text-align:center;">${total}</td>
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
    renderPoshanMaahSection,
};
