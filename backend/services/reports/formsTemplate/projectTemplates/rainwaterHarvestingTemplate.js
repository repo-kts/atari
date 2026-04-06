/**
 * Rainwater Harvesting Template
 * Handles rendering the Rainwater Harvesting (Section 10.14) section
 * Title: "E. Activities under Rain Water Harvesting structure and micro irrigation system"
 * Layout: Sl. | KVK (Optional) | No of training programme conducted | No. of demonstrations | No. of plant material produced | Visit by the farmers (No.) | Visit by the officials (No.)
 */

function renderRainwaterHarvestingTable(ctx, records, showKvkColumn) {
    const headers = `
        <tr>
            <th>Sl.</th>
            ${showKvkColumn ? '<th>KVK</th>' : ''}
            <th>No of training programme conducted</th>
            <th>No. of demonstrations</th>
            <th>No. of plant material produced</th>
            <th>Visit by the farmers (No.)</th>
            <th>Visit by the officials (No.)</th>
        </tr>`;

    let sl = 1;
    const rows = records.map((record) => `
        <tr>
            <td style="text-align: center;">${sl++}</td>
            ${showKvkColumn ? `<td>${ctx._escapeHtml(record.kvkName)}</td>` : ''}
            <td style="text-align: center;">${record.trainingProgrammes}</td>
            <td style="text-align: center;">${record.demonstrations}</td>
            <td style="text-align: center;">${record.plantMaterial}</td>
            <td style="text-align: center;">${record.farmerVisits}</td>
            <td style="text-align: center;">${record.officialVisits}</td>
        </tr>`).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderRainwaterHarvestingSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const showKvkColumn = reportContext.showKvkNames || false;
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px;">E. Activities under Rain Water Harvesting structure and micro irrigation system</h2>
    <div style="overflow-x: auto;">
        ${renderRainwaterHarvestingTable(this, records, showKvkColumn)}
    </div>
</div>`;
}

module.exports = {
    renderRainwaterHarvestingSection,
};
