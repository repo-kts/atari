function renderSimpleTableSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    // Determine headers from first record
    const dataArray = Array.isArray(data) ? data : [data]
    const headers = Object.keys(dataArray[0] || {})
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S.No.</th>`

    headers.forEach(header => {
        html += `<th>${this._escapeHtml(header)}</th>`
    })

    html += `
            </tr>
        </thead>
        <tbody>`

    dataArray.forEach((row, index) => {
        html += `<tr class="${index % 2 === 0 ? 'even' : 'odd'}">`
        html += `<td class="s-no">${index + 1}.</td>`
        headers.forEach(header => {
            const value = row[header]
            html += `<td>${value !== null && value !== undefined ? this._escapeHtml(String(value)) : '-'}</td>`
        })
        html += `</tr>`
    })

    html += `
        </tbody>
    </table>
</div>`

    return html
}

module.exports = {
    renderSimpleTableSection,
}

