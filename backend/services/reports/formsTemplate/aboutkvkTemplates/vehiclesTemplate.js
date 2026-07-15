function renderVehiclesSection(section, data, sectionId, isFirstSection) {
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const records = Array.isArray(data) ? data : [data]
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'

    // §1.4.A Vehicle DETAILS — static attributes only. Total Run / Present
    // status are reporting-year values shown in the separate Vehicle Status
    // table (#235).
    const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v)

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S. No.</th>
                <th>KVK</th>
                <th>Name of vehicle</th>
                <th>Registration No.</th>
                <th>Year of purchase</th>
                <th>Cost (Rs.)</th>
            </tr>
        </thead>
        <tbody>`

    records.forEach((row, index) => {
        // Use ?? so a legitimate 0 (e.g. gifted/free vehicle) renders as "0"
        // instead of "-": _pickValue returns null when absent, 0 otherwise.
        const dash = (v) => (v === null || v === undefined || v === '' ? '-' : v)
        const kvk = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const type = this._pickValue(row, ['Type of vehicle', 'vehicleName']) || '-'
        const reg = this._pickValue(row, ['Registration No.', 'registrationNo']) || '-'
        const year = dash(this._pickValue(row, ['Year of purchase', 'yearOfPurchase']))
        const cost = dash(this._pickValue(row, ['Cost (Rs.)', 'totalCost']))

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(String(kvk))}</td>
                <td>${this._escapeHtml(String(type))}</td>
                <td>${this._escapeHtml(String(reg))}</td>
                <td>${this._escapeHtml(String(year))}</td>
                <td>${this._escapeHtml(String(cost))}</td>
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

