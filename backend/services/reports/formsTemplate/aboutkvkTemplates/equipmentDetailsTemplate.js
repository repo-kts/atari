/**
 * §1.5.A Equipment DETAILS — static attributes only (mirrors the Vehicle
 * Details table). Present status is reporting-year data shown in the separate
 * Equipment Status table (#235).
 * Source: getKvkEquipments → { kvkName, equipmentName, yearOfPurchase,
 * totalCost, sourceOfFunding }.
 * Bound to reportTemplateService (`this`).
 */
function renderEquipmentDetailsSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : [])
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'
    const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v)

    const rows = records.map((row, index) => {
        const kvk = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const name = this._pickValue(row, ['Equipment Name', 'equipmentName']) || '-'
        const year = dash(this._pickValue(row, ['Year of Purchase', 'yearOfPurchase']))
        const cost = dash(this._pickValue(row, ['Cost (Rs.)', 'totalCost']))
        const funding = this._pickValue(row, ['Source of Funding', 'sourceOfFunding']) || '-'
        return `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(String(kvk))}</td>
                <td>${this._escapeHtml(String(name))}</td>
                <td>${this._escapeHtml(String(year))}</td>
                <td>${this._escapeHtml(String(cost))}</td>
                <td>${this._escapeHtml(String(funding))}</td>
            </tr>`
    }).join('')

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S. No.</th>
                <th>KVK</th>
                <th>Equipment Name</th>
                <th>Year of Purchase</th>
                <th>Cost (Rs.)</th>
                <th>Source of Funding</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
</div>`
}

module.exports = {
    renderEquipmentDetailsSection,
}
