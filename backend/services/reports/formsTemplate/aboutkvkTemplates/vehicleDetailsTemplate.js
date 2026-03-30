function renderVehicleDetailsSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const records = Array.isArray(data) ? data : [data]
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">Sl. No.</th>
                <th>Year</th>
                <th>KVK</th>
                <th>Vehicle</th>
                <th>Registration No.</th>
                <th>Year of purchase</th>
                <th>Cost (Rs.)</th>
                <th>Total Run(km/hrs)</th>
                <th>Present status</th>
                <th>Repairing Cost</th>
                <th>Funding Source</th>
            </tr>
        </thead>
        <tbody>`

    const normalizeDisplay = (value) => {
        if (value === null || value === undefined || value === '') return '-'
        if (value instanceof Date) return value.getUTCFullYear()
        const maybeDate = new Date(value)
        if (!Number.isNaN(maybeDate.getTime())) return maybeDate.getUTCFullYear()
        if (typeof value === 'object') {
            const nested = this._pickValue(value, ['yearName', 'year', 'value', 'label', 'name', 'id'])
            if (nested !== null && nested !== undefined && nested !== '') return nested
            return '-'
        }
        return value
    }

    records.forEach((row, index) => {
        const year = normalizeDisplay(this._pickValue(row, ['Year', 'reportingYear']))
        const kvk = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const vehicle = this._pickValue(row, ['Vehicle', 'vehicleName']) || '-'
        const registrationNo = this._pickValue(row, ['Registration No.', 'registrationNo']) || '-'
        const yearOfPurchase = this._pickValue(row, ['Year of purchase', 'yearOfPurchase']) || '-'
        const cost = this._pickValue(row, ['Cost (Rs.)', 'totalCost']) || '-'
        const totalRun = this._pickValue(row, ['Total Run(km/hrs)', 'totalRun']) || '-'
        const presentStatus = this._pickValue(row, ['Present status', 'presentStatus']) || '-'
        const repairingCost = this._pickValue(row, ['Repairing Cost', 'repairingCost']) || '-'
        const fundingSource = this._pickValue(row, ['Funding Source', 'sourceOfFunding']) || '-'

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(String(year))}</td>
                <td>${this._escapeHtml(String(kvk))}</td>
                <td>${this._escapeHtml(String(vehicle))}</td>
                <td>${this._escapeHtml(String(registrationNo))}</td>
                <td>${this._escapeHtml(String(yearOfPurchase))}</td>
                <td>${this._escapeHtml(String(cost))}</td>
                <td>${this._escapeHtml(String(totalRun))}</td>
                <td>${this._escapeHtml(String(presentStatus))}</td>
                <td>${this._escapeHtml(String(repairingCost))}</td>
                <td>${this._escapeHtml(String(fundingSource))}</td>
            </tr>`
    })

    html += `
        </tbody>
    </table>
</div>`

    return html
}

module.exports = {
    renderVehicleDetailsSection,
}

