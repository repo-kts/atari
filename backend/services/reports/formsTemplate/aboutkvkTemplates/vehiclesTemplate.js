function renderVehiclesSection(section, data, sectionId, isFirstSection) {
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
                <th class="s-no">S. No.</th>
                <th>KVK</th>
                <th>Type of vehicle</th>
                <th>Year of purchase</th>
                <th>Cost (Rs.)</th>
                <th>Total Run(km/hrs)</th>
                <th>Present status</th>
            </tr>
        </thead>
        <tbody>`

    records.forEach((row, index) => {
        const kvk = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const type = this._pickValue(row, ['Type of vehicle', 'vehicleName']) || '-'
        const year = this._pickValue(row, ['Year of purchase', 'yearOfPurchase']) || '-'
        const cost = this._pickValue(row, ['Cost (Rs.)', 'totalCost']) || '-'
        const run = this._pickValue(row, ['Total Run(km/hrs)', 'totalRun']) || '-'
        const status = this._pickValue(row, ['Present status', 'presentStatus']) || '-'

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(String(kvk))}</td>
                <td>${this._escapeHtml(String(type))}</td>
                <td>${this._escapeHtml(String(year))}</td>
                <td>${this._escapeHtml(String(cost))}</td>
                <td>${this._escapeHtml(String(run))}</td>
                <td>${this._escapeHtml(String(status))}</td>
            </tr>`
    })

    html += `
        </tbody>
    </table>
</div>`

    return html
}

module.exports = {
    renderVehiclesSection,
}

