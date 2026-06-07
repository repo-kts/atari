/**
 * Swachhta Budget (Quarterly Expenditure) Template
 *
 * One combined table, one row per KVK, with grouped columns:
 *   Vermicomposting (No of village covered | Total Expenditure) |
 *   Other than vermicomposting activities under Swachata (No of village covered | Total Expenditure)
 *
 * KVK side (single KVK)  : simple list (KVK + the 4 value columns).
 * Super-admin (aggregated): structured — State | KVK prepended, sorted by State then KVK.
 */

function _num(v) {
    return v != null && v !== '' ? v : 0;
}

function renderSwachhtaBudgetSection(section, data, sectionId, isFirstSection, reportContext = {}) {
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
        : `<th rowspan="2" style="vertical-align:bottom;">KVK</th>`;
    const leadCount = isAgg ? 2 : 1;
    const colCount = leadCount + 4;

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:12px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <thead>
            <tr>
                ${leadHead}
                <th colspan="2" style="text-align:center;">Vermicomposting</th>
                <th colspan="2" style="text-align:center;">Other than vermicomposting activities under Swachata</th>
            </tr>
            <tr>
                <th style="text-align:center;">No of village covered</th>
                <th style="text-align:center;">Total Expenditure (Rs. in Lakhs)</th>
                <th style="text-align:center;">No of village covered</th>
                <th style="text-align:center;">Total Expenditure (Rs. in Lakhs)</th>
            </tr>
        </thead>
        <tbody>`;

    if (rows.length === 0) {
        html += `<tr><td colspan="${colCount}" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>`;
    }

    rows.forEach(row => {
        const lead = isAgg
            ? `<td>${this._escapeHtml(stateOf(row) || '-')}</td><td>${this._escapeHtml(kvkOf(row))}</td>`
            : `<td>${this._escapeHtml(kvkOf(row))}</td>`;
        html += `
            <tr>
                ${lead}
                <td style="text-align:center;">${_num(row.vermiVillageCovered)}</td>
                <td style="text-align:center;">${_num(row.vermiTotalExpenditure)}</td>
                <td style="text-align:center;">${_num(row.otherVillageCovered)}</td>
                <td style="text-align:center;">${_num(row.otherTotalExpenditure)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;
    return html;
}

module.exports = { renderSwachhtaBudgetSection };
