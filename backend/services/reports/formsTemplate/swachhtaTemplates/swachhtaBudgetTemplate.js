/**
 * Swachhta Budget (Quarterly Expenditure) Template
 *
 * One table per KVK with 2 rows:
 *   1. Vermicomposting
 *   2. Other than vermicomposting activities under Swachata
 *
 * Columns: KVK | Activities | No of village covered | Total Expenditure(Rs.in Lakhs)
 */

const COLGROUP = `
        <colgroup>
            <col style="width:15%;"><col style="width:45%;"><col style="width:18%;"><col style="width:22%;">
        </colgroup>`;

const THEAD = `
        <thead>
            <tr>
                <th>KVK</th>
                <th>Activities</th>
                <th>No of village covered</th>
                <th>Total Expenditure(Rs.in Lakhs)</th>
            </tr>
        </thead>`;

function renderSwachhtaBudgetSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:16px;">Other than vermicomposting activities under Swachata</h1>`;

    if (records.length === 0) {
        html += `
    <table class="data-table" style="width:100%;table-layout:fixed;">
        ${COLGROUP}${THEAD}
        <tbody>
            <tr><td colspan="4" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td></tr>
        </tbody>
    </table>`;
    } else {
        records.forEach(row => {
            const kvk = row.kvk?.kvkName || '-';
            html += `
    <table class="data-table" style="width:100%;table-layout:fixed;margin-bottom:20px;">
        ${COLGROUP}${THEAD}
        <tbody>
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>Vermicomposting</td>
                <td style="text-align:center;">${row.vermiVillageCovered != null ? row.vermiVillageCovered : 0}</td>
                <td style="text-align:center;">${row.vermiTotalExpenditure != null ? row.vermiTotalExpenditure : 0}</td>
            </tr>
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>Other than vermicomposting activities under Swachata</td>
                <td style="text-align:center;">${row.otherVillageCovered != null ? row.otherVillageCovered : 0}</td>
                <td style="text-align:center;">${row.otherTotalExpenditure != null ? row.otherTotalExpenditure : 0}</td>
            </tr>
        </tbody>
    </table>`;
        });
    }

    html += `
</div>`;
    return html;
}

module.exports = { renderSwachhtaBudgetSection };
