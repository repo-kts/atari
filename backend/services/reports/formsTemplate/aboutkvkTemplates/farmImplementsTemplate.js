const { formatCostValue, formatStatusValue } = require('./farmImplementsFormatters.js');

function renderFarmImplementsSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data)
        ? data
        : (data && typeof data === 'object' ? [data] : []);

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const sectionTitle = section.customSectionLabel || `${section.id} ${section.title}`;
    const fields = Array.isArray(section.fields) ? section.fields : [];
    const headers = fields.map(field => field.displayName);

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${this._escapeHtml(sectionTitle)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S.No.</th>
                ${headers.map(header => `<th>${this._escapeHtml(header)}</th>`).join('')}
            </tr>
        </thead>
        <tbody>`;

    rows.forEach((row, index) => {
        const kvkName = this._formatFieldValue(this._pickValue(row, ['kvk.kvkName', 'kvkName', 'KVK']));
        const implementName = this._formatFieldValue(this._pickValue(row, ['implementName', 'Name of equipment']));
        const yearOfPurchase = this._formatFieldValue(this._pickValue(row, ['yearOfPurchase', 'Year', 'Year of purchase']));
        const totalCost = formatCostValue(this._pickValue(row, ['totalCost', 'Cost (Rs.)']));
        const presentStatus = formatStatusValue(this._pickValue(row, ['presentStatus', 'Present status']));
        const sourceOfFund = this._formatFieldValue(
            this._pickValue(row, ['sourceOfFund', 'sourceOfFunding', 'Source of fund', 'Source of Funding'])
        );

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}.</td>
                <td>${this._escapeHtml(kvkName)}</td>
                <td>${this._escapeHtml(implementName)}</td>
                <td>${this._escapeHtml(yearOfPurchase)}</td>
                <td>${this._escapeHtml(totalCost)}</td>
                <td>${this._escapeHtml(presentStatus)}</td>
                <td>${this._escapeHtml(sourceOfFund)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = {
    renderFarmImplementsSection,
};
