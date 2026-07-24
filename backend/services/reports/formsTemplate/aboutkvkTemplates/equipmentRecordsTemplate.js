function renderEquipmentRecordsSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const records = Array.isArray(data) ? data : [data];
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const moduleLabel = reportContext.isStandalone
        ? (section.exportTitle || section.title)
        : `${section.id} ${this._escapeHtml(section.title)}`;

    const kvkNames = Array.from(new Set(
        records.map(r => r.kvkName).filter(Boolean).map(String)
    ));
    const kvkLabel = kvkNames.length === 1
        ? kvkNames[0]
        : (kvkNames.length === 0 ? '-' : `${kvkNames.length} KVKs`);

    const header = reportContext.isStandalone
        ? `<div class="module-report-header">
        <h1 class="module-report-title">${this._escapeHtml(moduleLabel)}</h1>
        <div class="module-report-sub"><strong>KVK:</strong> ${this._escapeHtml(kvkLabel)}</div>
    </div>`
        : `<h1 class="section-title">${moduleLabel}</h1>`;

    // Rows arrive pre-cleaned from getKvkEquipmentRecords (skipTransform): stable
    // keys, numbers as numbers, year as an integer. Just display them.
    const cell = (v) =>
        this._escapeHtml(v === null || v === undefined || v === '' ? '-' : String(v));

    let html = `
<div id="${sectionId}" class="${pageClass}">
    ${header}
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">Sl. No.</th>
                <th>Year</th>
                <th>KVK</th>
                <th>Equipment Type</th>
                <th>Equipment Name</th>
                <th>Year of purchase</th>
                <th>Cost (Rs.)</th>
                <th>Source of fund</th>
                <th>Funding Agency</th>
                <th>Present status</th>
            </tr>
        </thead>
        <tbody>`;

    records.forEach((row, index) => {
        const value = (keys) => this._pickValue(row, keys);
        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${cell(value(['Year', 'reportingYear']))}</td>
                <td>${cell(value(['KVK', 'kvkName', 'kvk.kvkName']))}</td>
                <td>${cell(value(['Equipment Type', 'equipmentTypeName', 'equipment.equipmentType.name']))}</td>
                <td>${cell(value(['Equipment Name', 'equipmentName', 'equipment.equipmentName']))}</td>
                <td>${cell(value(['Year of purchase', 'yearOfPurchase', 'equipment.yearOfPurchase']))}</td>
                <td>${cell(value(['Cost (Rs.)', 'totalCost', 'equipment.totalCost']))}</td>
                <td>${cell(value(['Source of fund', 'sourceOfFunding', 'assetFundingSource.name']))}</td>
                <td>${cell(value(['Funding Agency', 'fundingAgencyName']))}</td>
                <td>${cell(value(['Present status', 'presentStatus', 'equipmentStatus.statusLabel']))}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = {
    renderEquipmentRecordsSection,
};
