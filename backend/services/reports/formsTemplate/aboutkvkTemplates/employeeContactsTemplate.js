function renderEmployeeContactsSection(section, data, sectionId, isFirstSection) {
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
                <th class="s-no">S.No.</th>
                <th>KVK</th>
                <th>Name</th>
                <th>Residence</th>
                <th>Mobile</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>`

    records.forEach((row, index) => {
        const kvkName = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const name = this._pickValue(row, ['Name', 'staffName']) || '-'
        const residence = this._pickValue(row, ['Residence', 'residence']) || '-'
        const mobile = this._pickValue(row, ['Mobile', 'mobile']) || '-'
        const email = this._pickValue(row, ['Email', 'email']) || '-'

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}.</td>
                <td>${this._escapeHtml(String(kvkName))}</td>
                <td>${this._escapeHtml(String(name))}</td>
                <td>${this._escapeHtml(String(residence))}</td>
                <td>${this._escapeHtml(String(mobile))}</td>
                <td>${this._escapeHtml(String(email))}</td>
            </tr>`
    })

    html += `
        </tbody>
    </table>
</div>`

    return html
}

module.exports = {
    renderEmployeeContactsSection,
}

