/**
 * Staff Transferred (§ Employee Information).
 * Shows WHO transferred, FROM where, TO where, WHEN, and how many times.
 * Source: getKvkStaffTransferred → rows with staffName, originalKvk (from),
 * kvk (to/current), lastTransferDate, transferCount.
 * Bound to reportTemplateService (`this`).
 */
function renderStaffTransferredSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : [])
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'

    const rows = records.map((row, index) => {
        const name = this._pickValue(row, ['Name', 'staffName']) || '-'
        const from = this._pickValue(row, ['Transferred From', 'originalKvk.kvkName']) || '-'
        const to = this._pickValue(row, ['Transferred To', 'kvk.kvkName']) || '-'
        const dateVal = this._pickValue(row, ['Transfer Date', 'lastTransferDate'])
        const date = dateVal ? this._formatFieldValue(dateVal, { type: 'date' }) : '-'
        const count = this._pickValue(row, ['No. of Transfers', 'transferCount'])
        const countDisp = count === null || count === undefined || count === '' ? '-' : count
        return `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(String(name))}</td>
                <td>${this._escapeHtml(String(from))}</td>
                <td>${this._escapeHtml(String(to))}</td>
                <td>${this._escapeHtml(String(date))}</td>
                <td style="text-align:center;">${this._escapeHtml(String(countDisp))}</td>
            </tr>`
    }).join('')

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">Sl. No.</th>
                <th>Name</th>
                <th>Transferred From</th>
                <th>Transferred To</th>
                <th>Transfer Date</th>
                <th>No. of Transfers</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
</div>`
}

module.exports = {
    renderStaffTransferredSection,
}
