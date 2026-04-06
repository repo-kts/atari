/**
 * Instructional Farm Crop Template
 * Handles rendering the Performance of Instructional Farm (Crops) section (Section 10.9)
 * Layout: multi-level header with "Details of Production" and "Amount(Rs.)" colspan groups
 * Columns: Season | Name Of the Crop | Area(ha) | Variety | Type of Produce | Qty. | Cost of Inputs | Gross Income | Remarks
 */

function renderInstructionalFarmCropTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2">Season</th>
            <th rowspan="2">Name Of the Crop</th>
            <th rowspan="2">Area(ha)</th>
            <th colspan="3" style="text-align: center;">Details of Production</th>
            <th colspan="2" style="text-align: center;">Amount(Rs.)</th>
            <th rowspan="2">Remarks</th>
        </tr>
        <tr>
            <th>Variety</th>
            <th>Type of Produce</th>
            <th>Qty.</th>
            <th>Cost of Inputs</th>
            <th>Gross Income</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td>${ctx._escapeHtml(record.seasonName)}</td>
            <td>${ctx._escapeHtml(record.cropName)}</td>
            <td style="text-align: center;">${record.area}</td>
            <td>${ctx._escapeHtml(record.variety)}</td>
            <td style="text-align: center;">${ctx._escapeHtml(record.typeOfProduce)}</td>
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

function renderInstructionalFarmCropSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Performance of Instructional Farm(Crops)</h2>
    <div style="overflow-x: auto;">
        ${renderInstructionalFarmCropTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderInstructionalFarmCropSection,
};
