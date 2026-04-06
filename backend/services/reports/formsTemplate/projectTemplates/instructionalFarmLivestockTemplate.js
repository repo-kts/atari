/**
 * Instructional Farm Livestock Template
 * Handles rendering the Performance of Instructional Farm (livestock) section (Section 10.11)
 * Layout: Name of the Animal/Bird/Aquatics | Details of Production (colspan 3) | Amount(Rs.) (colspan 3)
 *   - Details of Production: Species/Breed/Variety | Type of Produce | Qty.
 *   - Amount(Rs.): Cost of Inputs | Gross Income | Remarks
 */

function renderInstructionalFarmLivestockTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2">Name of the Animal/Bird/Aquatics</th>
            <th colspan="3" style="text-align: center;">Details of Production</th>
            <th colspan="3" style="text-align: center;">Amount(Rs.)</th>
        </tr>
        <tr>
            <th>Species / Breed / Variety</th>
            <th>Type of Produce</th>
            <th>Qty.</th>
            <th>Cost of Inputs</th>
            <th>Gross Income</th>
            <th>Remarks</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td>${ctx._escapeHtml(record.animalName)}</td>
            <td>${ctx._escapeHtml(record.speciesBreed)}</td>
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

function renderInstructionalFarmLivestockSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Performance of Instructional Farm (livestock and fisheries production)</h2>
    <div style="overflow-x: auto;">
        ${renderInstructionalFarmLivestockTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderInstructionalFarmLivestockSection,
};
