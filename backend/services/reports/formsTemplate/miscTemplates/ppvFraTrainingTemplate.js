/**
 * PPV & FRA Training Programme Template
 *
 * Renders training records with multi-level header matching original:
 *   KVK | Date... | Title | Type | Venue | Resource Person |
 *   No. of the participants: General (M/F) | OBC (M/F) | SC (M/F) | ST (M/F) | Total (M/F/T)
 *
 * Title: "PPV & FRA Sensitization training Programme"
 * Bound to reportTemplateService (`this`).
 */

function _formatDate(dateValue) {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function _resolveTypeLabel(row) {
    if (row.trainingType?.typeName) return row.trainingType.typeName;
    const raw = row.type || '';
    if (raw === 'TRAINING') return 'Training';
    if (raw === 'AWARENESS') return 'Awareness';
    return raw || '-';
}

function renderPpvFraTrainingSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">PPV &amp; FRA Sensitization training Programme</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>
                <th rowspan="2" style="vertical-align:bottom;">Date of training/awareness programme</th>
                <th rowspan="2" style="vertical-align:bottom;">Title</th>
                <th rowspan="2" style="vertical-align:bottom;">Type</th>
                <th rowspan="2" style="vertical-align:bottom;">Venue</th>
                <th rowspan="2" style="vertical-align:bottom;">Resource Person</th>
                <th colspan="11" style="text-align:center;">No. of the participants</th>
            </tr>
            <tr>
                <th colspan="2" style="text-align:center;">General</th>
                <th colspan="2" style="text-align:center;">OBC</th>
                <th colspan="2" style="text-align:center;">SC</th>
                <th colspan="2" style="text-align:center;">ST</th>
                <th colspan="3" style="text-align:center;">Total</th>
            </tr>
            <tr>
                <th colspan="6"></th>
                <th style="text-align:center;">M</th>
                <th style="text-align:center;">F</th>
                <th style="text-align:center;">M</th>
                <th style="text-align:center;">F</th>
                <th style="text-align:center;">M</th>
                <th style="text-align:center;">F</th>
                <th style="text-align:center;">M</th>
                <th style="text-align:center;">F</th>
                <th style="text-align:center;">M</th>
                <th style="text-align:center;">F</th>
                <th style="text-align:center;">T</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr>
                <td colspan="17" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td>
            </tr>`;
    }

    records.forEach((row) => {
        const kvk = row.kvk?.kvkName || '-';
        const date = _formatDate(row.programmeDate);
        const title = row.title || '-';
        const typeLabel = _resolveTypeLabel(row);
        const venue = row.venue || '-';
        const resourcePerson = row.resourcePerson || '-';

        const gM = row.generalM || 0;
        const gF = row.generalF || 0;
        const oM = row.obcM || 0;
        const oF = row.obcF || 0;
        const sM = row.scM || 0;
        const sF = row.scF || 0;
        const tM = row.stM || 0;
        const tF = row.stF || 0;
        const totalM = gM + oM + sM + tM;
        const totalF = gF + oF + sF + tF;
        const totalT = totalM + totalF;

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(date)}</td>
                <td>${this._escapeHtml(title)}</td>
                <td>${this._escapeHtml(typeLabel)}</td>
                <td>${this._escapeHtml(venue)}</td>
                <td>${this._escapeHtml(resourcePerson)}</td>
                <td style="text-align:center;">${gM}</td>
                <td style="text-align:center;">${gF}</td>
                <td style="text-align:center;">${oM}</td>
                <td style="text-align:center;">${oF}</td>
                <td style="text-align:center;">${sM}</td>
                <td style="text-align:center;">${sF}</td>
                <td style="text-align:center;">${tM}</td>
                <td style="text-align:center;">${tF}</td>
                <td style="text-align:center;">${totalM}</td>
                <td style="text-align:center;">${totalF}</td>
                <td style="text-align:center;">${totalT}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = { renderPpvFraTrainingSection };
