/**
 * Demonstration Unit Template
 * Handles rendering the Performance of Demonstration Units section (Section 10.8)
 * BLA-50 layout: master-backed name, establishment details, area and status.
 */

function renderDemonstrationUnitTable(ctx, records) {
    const headers = `
        <tr>
            <th style="width: 40px;">Sr.No.</th>
            <th>Name of Demo Unit</th>
            <th>Year of Estt.</th>
            <th>Area (Sq. mt)</th>
            <th>Status</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${ctx._escapeHtml(record.demoUnitName)}</td>
            <td style="text-align: center;">${record.yearOfEstablishment}</td>
            <td style="text-align: center;">${record.area}</td>
            <td>${ctx._escapeHtml(record.status)}</td>
        </tr>`).join('');

    return `
    <table class="data-table report-fit" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 7pt;">
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
