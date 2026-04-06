/**
 * Demonstration Unit Template
 * Handles rendering the Performance of Demonstration Units section (Section 10.8)
 * Layout matches: multi-level header with "Details of Production" and "Amount(Rs.)" colspan groups
 */

function renderDemonstrationUnitTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2" style="width: 40px;">Sr.No.</th>
            <th rowspan="2">Name of Demo Unit</th>
            <th rowspan="2">Year of estt.</th>
            <th rowspan="2">Area(Sq. mt)</th>
            <th colspan="3" style="text-align: center;">Details of Production</th>
            <th colspan="3" style="text-align: center;">Amount(Rs.)</th>
        </tr>
        <tr>
            <th>Variety/Breed</th>
            <th>Produce</th>
            <th>Qty.</th>
            <th>Cost of Inputs</th>
            <th>Gross Income</th>
            <th>Remarks</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${ctx._escapeHtml(record.demoUnitName)}</td>
            <td style="text-align: center;">${record.yearOfEstablishment}</td>
            <td style="text-align: center;">${record.area}</td>
            <td>${ctx._escapeHtml(record.varietyBreed)}</td>
            <td>${ctx._escapeHtml(record.produce)}</td>
            <td style="text-align: center;">${record.quantity}</td>
            <td style="text-align: right;">${record.costOfInputs}</td>
            <td style="text-align: right;">${record.grossIncome}</td>
            <td>${ctx._escapeHtml(record.remarks)}</td>
        </tr>`).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderDemonstrationUnitSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Performance of Demonstration Units(Other than Instructional Farm)</h2>
    <div style="overflow-x: auto;">
        ${renderDemonstrationUnitTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderDemonstrationUnitSection,
};
