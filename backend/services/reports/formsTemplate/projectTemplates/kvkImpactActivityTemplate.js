/**
 * KVK Impact Activity Template
 * Handles rendering the Impact of KVK activities section (Section 10.1)
 */

function renderKvkImpactActivityTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2" style="width: 40px;">Sr.No.</th>
            <th rowspan="2">Name of State</th>
            <th rowspan="2">Name of District</th>
            <th rowspan="2">Name of specific area</th>
            <th rowspan="2">Brief details of the area</th>
            <th rowspan="2">No. of farmers benefitted</th>
            <th rowspan="2">Horizontal spread(in area/no.)</th>
            <th rowspan="2">% Adoption</th>
            <th rowspan="2">Impact of the technology in subjective terms</th>
            <th rowspan="2">Impact of the technology in objective terms</th>
            <th colspan="2">Change in income (Rs./Unit)</th>
        </tr>
        <tr>
            <th>Before</th>
            <th>After</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td style="text-align: center;">${ctx._escapeHtml(record.stateName)}</td>
            <td style="text-align: center;">${ctx._escapeHtml(record.districtName)}</td>
            <td style="text-align: center;">${ctx._escapeHtml(record.specificArea)}</td>
            <td>${ctx._escapeHtml(record.briefDetails)}</td>
            <td style="text-align: center;">${record.farmersBenefitted}</td>
            <td style="text-align: center;">${ctx._escapeHtml(record.horizontalSpread)}</td>
            <td style="text-align: center;">${record.adoptionPercentage}%</td>
            <td>${ctx._escapeHtml(record.qualitativeImpact)}</td>
            <td>${ctx._escapeHtml(record.quantitativeImpact)}</td>
            <td style="text-align: right;">${record.incomeBefore}</td>
            <td style="text-align: right;">${record.incomeAfter}</td>
        </tr>`).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderKvkImpactActivitySection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    
    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Impact of KVK activities/ large-scale adoption of technology</h2>
    <div style="overflow-x: auto;">
        ${renderKvkImpactActivityTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderKvkImpactActivitySection,
};
