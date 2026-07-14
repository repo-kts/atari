/**
 * Observation of Swachta Pakhwada Template
 *
 * KVK side (single KVK)  : simple list — Date | Activities | Staffs | Farmers | Others | Total
 * Super-admin (aggregated): structured — State | KVK prepended, sorted by State then KVK.
 */

function _formatDate(v) {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderSwachhtaPakhwadaSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const isAgg = Boolean(reportContext.isAggregatedReport);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const stateOf = (r) => r.kvk?.state?.stateName || '';
    const kvkOf = (r) => r.kvk?.kvkName || '-';
    const rows = isAgg
        ? [...records].sort((a, b) =>
            (stateOf(a).localeCompare(stateOf(b))) || (kvkOf(a).localeCompare(kvkOf(b))))
        : records;

    const leadHead = isAgg
        ? `<th rowspan="2" style="vertical-align:bottom;">State</th>
                <th rowspan="2" style="vertical-align:bottom;">KVK</th>`
        : '';
    const colCount = isAgg ? 8 : 6;
    const isPromotedFeature = section.featureNumber && section.id === section.featureNumber;
    const headingTag = isPromotedFeature ? 'h2' : 'h1';
    const headingClass = isPromotedFeature ? 'section-subtitle' : 'section-title';
    const headingText = `${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}`;

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <${headingTag} class="${headingClass}" style="margin-bottom:10px;">${headingText}</${headingTag}>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <thead>
            <tr>
                ${leadHead}
                <th rowspan="2" style="vertical-align:bottom;">Date/ Duration of Observation</th>
                <th rowspan="2" style="vertical-align:bottom;">Total No of Activities undertaken</th>
                <th colspan="4" style="text-align:center;">No. of Participants</th>
            </tr>
            <tr>
                <th style="text-align:center;">Staffs</th>
                <th style="text-align:center;">Farmers</th>
                <th style="text-align:center;">Others</th>
                <th style="text-align:center;">Total</th>
            </tr>
        </thead>
        <tbody>`;

    if (rows.length === 0) {
        html += `<tr><td colspan="${colCount}" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    rows.forEach(row => {
        const date = _formatDate(row.observationDate);
        const activities = row.totalActivities != null ? row.totalActivities : 0;
        const staff = row.staffCount || 0;
        const farmers = row.farmerCount || 0;
        const others = row.othersCount || 0;
        const total = staff + farmers + others;
        const lead = isAgg
            ? `<td>${this._escapeHtml(stateOf(row) || '-')}</td><td>${this._escapeHtml(kvkOf(row))}</td>`
            : '';

        html += `
            <tr>
                ${lead}
                <td>${this._escapeHtml(date)}</td>
                <td style="text-align:center;">${activities}</td>
                <td style="text-align:center;">${staff}</td>
                <td style="text-align:center;">${farmers}</td>
                <td style="text-align:center;">${others}</td>
                <td style="text-align:center;">${total}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderSwachhtaPakhwadaSection };
