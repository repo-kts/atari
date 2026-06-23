// Scale the table font down as the column count grows so wide tables fit the
// A4 page width instead of cropping. Mirrors fitFont() in the FLD templates.
function fitFont(colCount) {
    if (colCount <= 8) return 7.5
    if (colCount <= 12) return 6.5
    if (colCount <= 16) return 5.5
    if (colCount <= 22) return 4.6
    return 4
}

function renderEmployeesFullSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const records = Array.isArray(data) ? data : [data]
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'

    // 12 data columns → scale font to fit page.
    const fs = fitFont(12)

    // Module name. Module-wise export (standalone) uses the friendly name with no
    // section number ("Employee Details"); the comprehensive report keeps the
    // numbered title ("1.4 All KVK staff Details") for TOC consistency.
    const moduleLabel = reportContext.isStandalone
        ? (section.exportTitle || section.title)
        : `${section.id} ${this._escapeHtml(section.title)}`

    // KVK this report belongs to. KVK download → single KVK; admin grouped
    // download → many, so summarise the count.
    const kvkNames = Array.from(new Set(
        records
            .map(r => this._pickValue(r, ['KVK', 'kvk.kvkName']))
            .filter(v => v && v !== '-')
            .map(v => String(v))
    ))
    const kvkLabel = kvkNames.length === 1
        ? kvkNames[0]
        : (kvkNames.length === 0 ? '-' : `${kvkNames.length} KVKs`)

    // Standalone gets a single clean header block (one underline); comprehensive
    // report keeps its existing numbered section title.
    const header = reportContext.isStandalone
        ? `<div class="module-report-header">
        <h1 class="module-report-title">${this._escapeHtml(moduleLabel)}</h1>
        <div class="module-report-sub"><strong>KVK:</strong> ${this._escapeHtml(kvkLabel)}</div>
    </div>`
        : `<h1 class="section-title">${moduleLabel}</h1>`

    let html = `
<div id="${sectionId}" class="${pageClass}">
    ${header}
    <table class="data-table report-fit" style="font-size:${fs}pt;">
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
                <th>Job Type</th>
                <th>Mobile</th>
                <th class="emp-email">Email</th>
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
        const jobType = this._pickValue(
            row,
            ['Job Type', 'jobType', 'jobTypeMaster.name', 'jobTypeOther']
        ) || '-'
        const mobile = this._pickValue(row, ['Mobile', 'mobile']) || '-'
        const email = this._pickValue(row, ['Email', 'email']) || '-'

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
                <td>${this._escapeHtml(String(jobType))}</td>
                <td>${this._escapeHtml(String(mobile))}</td>
                <td class="emp-email">${this._escapeHtml(String(email))}</td>
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
