/**
 * Success Story Template
 * Handles rendering the Success Story section (Section 10.3)
 *
 * Renders a columnar table that matches the Excel/Word export exactly
 * (same columns, same single 'Sr.No.' serial column) so all three formats
 * are consistent. Columns mirror buildSuccessStoryTabularData().
 */

function renderSuccessStorySection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${this._escapeHtml(record.farmerName || '-')}</td>
            <td>${this._escapeHtml(record.storyTitle || '-')}</td>
            <td>${this._escapeHtml(record.enterprise || '-')}</td>
            <td style="text-align: right;">${record.netIncome || 0}</td>
            <td style="text-align: center;">${this._escapeHtml(record.costBenefitRatio || 0)}</td>
        </tr>`).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px;">Success stories/Case studies, if any</h2>
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
            <tr>
                <th style="width: 40px;">Sr.No.</th>
                <th>Farmer Name</th>
                <th>Story Title</th>
                <th>Enterprise</th>
                <th>Net Income</th>
                <th>Cost-Benefit Ratio</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderSuccessStorySection,
};
