/**
 * Functional Linkage Template
 * Handles rendering the Functional Linkage section (Section 2.14)
 */

function renderFunctionalLinkageTable(ctx, records) {
    const headers = `
        <tr>
            <th style="width: 50px;">Sr.No.</th>
            <th style="width: 300px;">Name of Organization</th>
            <th>Nature of Linkage</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${ctx._escapeHtml(record.organizationName)}</td>
            <td>${ctx._escapeHtml(record.natureOfLinkage)}</td>
        </tr>`).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderFunctionalLinkageSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    
    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px;">Functional Linkage with Different Organisations</h2>
    ${renderFunctionalLinkageTable(this, records)}
</div>`;
}

module.exports = {
    renderFunctionalLinkageSection,
};
