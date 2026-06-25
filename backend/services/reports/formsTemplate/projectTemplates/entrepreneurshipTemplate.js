/**
 * Entrepreneurship Template
 * Handles rendering the Entrepreneurship section (Section 10.2)
 *
 * Renders a columnar table that matches the Excel/Word export exactly
 * (same columns, same single 'Sr.No.' serial column) so all three formats
 * are consistent. Columns mirror buildEntrepreneurshipTabularData().
 */

function renderEntrepreneurshipSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${this._escapeHtml(record.entrepreneurName || '-')}</td>
            <td>${this._escapeHtml(record.enterpriseType || '-')}</td>
            <td style="text-align: center;">${this._escapeHtml(record.yearOfEstablishment || '-')}</td>
            <td style="text-align: right;">${record.annualIncome || 0}</td>
            <td style="text-align: center;">${record.membersAssociated || 0}</td>
            <td>${this._escapeHtml(record.technicalComponents || '-')}</td>
        </tr>`).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 20px;">Details of entrepreneurship/startup developed by KVK</h2>
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
            <tr>
                <th style="width: 40px;">Sr.No.</th>
                <th>Name of the entrepreneur</th>
                <th>Type of Enterprise</th>
                <th>Year of establishment</th>
                <th>Annual Income</th>
                <th>No of members</th>
                <th>Technical components</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderEntrepreneurshipSection,
};
