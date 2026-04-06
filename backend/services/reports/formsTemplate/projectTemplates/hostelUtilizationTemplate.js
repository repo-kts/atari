/**
 * Hostel Utilization Template
 * Handles rendering the Hostel Facilities (Section 10.12) section
 * Layout: Simple flat table — Months | No. of Trainees Stayed | Trainee Days(Days Stayed) | Reason for Short Fall(if any)
 */

function renderHostelUtilizationTable(ctx, records) {
    const headers = `
        <tr>
            <th>Months</th>
            <th>No. of Trainees Stayed</th>
            <th>Trainee Days(Days Stayed)</th>
            <th>Reason for Short Fall(if any)</th>
        </tr>`;

    const rows = records.map((record) => `
        <tr>
            <td>${ctx._escapeHtml(record.months)}</td>
            <td style="text-align: center;">${record.traineesStayed}</td>
            <td style="text-align: center;">${record.traineeDays}</td>
            <td>${ctx._escapeHtml(record.reasonForShortFall)}</td>
        </tr>`).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderHostelUtilizationSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Utilization of Hostel Facilities Accommodation Available(No. of Beds)</h2>
    <div style="overflow-x: auto;">
        ${renderHostelUtilizationTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderHostelUtilizationSection,
};
