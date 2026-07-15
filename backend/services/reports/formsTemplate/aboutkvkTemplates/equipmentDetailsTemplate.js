/**
 * §1.5.A Equipment DETAILS — static attributes only (mirrors the Vehicle
 * Details table). Present status is reporting-year data shown in the separate
 * Equipment Status table (#235).
 * Source: getKvkEquipments → { kvkName, equipmentName, yearOfPurchase,
 * totalCost }.
 * Bound to reportTemplateService (`this`).
 */
function renderEquipmentDetailsSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = Array.isArray(data) ? data : (data ? [data] : [])
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'
    const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v)

    const moduleLabel = reportContext.isStandalone
        ? (section.exportTitle || section.title)
        : `${section.id} ${this._escapeHtml(section.title)}`
    const kvkNames = Array.from(new Set(
        records
            .map(r => this._pickValue(r, ['KVK', 'kvk.kvkName']))
            .filter(v => v && v !== '-')
            .map(v => String(v))
    ))
    const kvkLabel = kvkNames.length === 1
        ? kvkNames[0]
        : (kvkNames.length === 0 ? '-' : `${kvkNames.length} KVKs`)
    const header = reportContext.isStandalone
        ? `<div class="module-report-header">
        <h1 class="module-report-title">${this._escapeHtml(moduleLabel)}</h1>
        <div class="module-report-sub"><strong>KVK:</strong> ${this._escapeHtml(kvkLabel)}</div>
    </div>`
        : `<h1 class="section-title">${moduleLabel}</h1>`

    const rows = records.map((row, index) => {
        const kvk = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const name = this._pickValue(row, ['Equipment Name', 'equipmentName', 'equipmentMaster.name']) || '-'
        const year = dash(this._pickValue(row, ['Year of Purchase', 'yearOfPurchase']))
        const cost = dash(this._pickValue(row, ['Cost (Rs.)', 'totalCost']))
        return `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(String(kvk))}</td>
                <td>${this._escapeHtml(String(name))}</td>
                <td>${this._escapeHtml(String(year))}</td>
                <td>${this._escapeHtml(String(cost))}</td>
            </tr>`
    }).join('')

    return `
<div id="${sectionId}" class="${pageClass}">
    ${header}
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S. No.</th>
                <th>KVK</th>
                <th>Equipment Name</th>
                <th>Year of Purchase</th>
                <th>Cost (Rs.)</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
</div>`
}

module.exports = {
    renderEquipmentDetailsSection,
}
