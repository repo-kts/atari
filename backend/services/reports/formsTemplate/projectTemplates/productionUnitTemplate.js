/**
 * Production Unit Template
 * Handles rendering the Performance of Production Units section (Section 10.10)
 * Layout: multi-level header — Name of the Product | Qty.(Kg) | Amount(Rs.) colspan 3 [Cost of Inputs | Gross Income | Remarks]
 */

function renderProductionUnitTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2" style="width: 40px;">Sr.No.</th>
            <th rowspan="2">Name of the Product</th>
            <th rowspan="2">Qty.(Kg)</th>
            <th colspan="3" style="text-align: center;">Amount(Rs.)</th>
        </tr>
        <tr>
            <th>Cost of Inputs</th>
            <th>Gross Income</th>
            <th>Remarks</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${ctx._escapeHtml(record.productName)}</td>
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

function renderProductionUnitSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Performance of Production Units(Bio-agents/Bio-pesticides/Bio-fertilizers etc.,)</h2>
    <div style="overflow-x: auto;">
        ${renderProductionUnitTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderProductionUnitSection,
};
