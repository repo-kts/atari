function renderEmployeesFullSection(section, data, sectionId, isFirstSection) {
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
                <th>KVK</th>
                <th>Sanctioned post</th>
                <th>Name of the Incumbent</th>
                <th>Date of Birth</th>
                <th>Discipline</th>
                <th>Pay Scale with Present Basic</th>
                <th>Date of joining</th>
                <th>Category (SC/ST/ OBC/ General)</th>
            </tr>
        </thead>
        <tbody>`

    records.forEach((row, index) => {
        const kvkName = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const post = this._pickValue(row, ['Sanctioned post', 'sanctionedPost.postName']) || '-'
        const name = this._pickValue(row, ['Name of the Incumbent', 'staffName']) || '-'
        const dob = this._formatFieldValue(
            this._pickValue(row, ['Date of Birth', 'dateOfBirth']),
            { type: 'date' }
        )
        const discipline = this._pickValue(row, ['Discipline', 'discipline.disciplineName']) || '-'
        const pay = this._pickValue(row, ['Pay Scale with Present Basic', 'payLevel.levelName']) || '-'
        const doj = this._formatFieldValue(
            this._pickValue(row, ['Date of joining', 'dateOfJoining']),
            { type: 'date' }
        )
        const category = this._pickValue(
            row,
            ['Category (SC/ST/ OBC/ General)', 'staffCategory.categoryName']
        ) || '-'

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}.</td>
                <td>${this._escapeHtml(String(kvkName))}</td>
                <td>${this._escapeHtml(String(post))}</td>
                <td>${this._escapeHtml(String(name))}</td>
                <td>${this._escapeHtml(String(dob))}</td>
                <td>${this._escapeHtml(String(discipline))}</td>
                <td>${this._escapeHtml(String(pay))}</td>
                <td>${this._escapeHtml(String(doj))}</td>
                <td>${this._escapeHtml(String(category))}</td>
            </tr>`
    })

    html += `
        </tbody>
    </table>
</div>`

    return html
}

module.exports = {
    renderEmployeesFullSection,
}

