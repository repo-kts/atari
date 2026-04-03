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
        const cells = fields.map(field => {
            const raw = this._pickValue(row, field.lookupPaths || [field.dbField]);
            if (field.type === 'currency') return formatCostValue(raw);
            if (field.type === 'status') return formatStatusValue(raw);
            return this._formatFieldValue(raw);
        });

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}.</td>
                ${cells.map(cell => `<td>${this._escapeHtml(cell)}</td>`).join('')}
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
