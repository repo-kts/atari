/**
 * Land Details template (§1.3.B "Land Details").
 * Source: KvkLandDetail { item, areaHa }. One row per land item.
 * Bound to reportTemplateService (`this`).
 */
function renderLandDetailsSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = Array.isArray(data) ? data : (data ? [data] : [])
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'

    // Show a KVK column for aggregated/superadmin reports.
    const showKvk = Boolean(reportContext.isAggregatedReport)
        || new Set(records.map((r) => this._pickValue(r, ['KVK', 'kvk.kvkName']))).size > 1

    let total = 0
    const rows = records.map((row, index) => {
        const kvk = this._pickValue(row, ['KVK', 'kvk.kvkName']) || '-'
        const item = this._pickValue(row, ['Item', 'item']) || '-'
        const areaRaw = this._pickValue(row, ['Area (ha)', 'areaHa'])
        const area = areaRaw === null || areaRaw === undefined || areaRaw === '' ? '-' : areaRaw
        if (typeof areaRaw === 'number') total += areaRaw
        return `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                ${showKvk ? `<td>${this._escapeHtml(String(kvk))}</td>` : ''}
                <td>${this._escapeHtml(String(item))}</td>
                <td style="text-align:right;">${this._escapeHtml(String(area))}</td>
            </tr>`
    }).join('')

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S. No.</th>
                ${showKvk ? '<th>KVK</th>' : ''}
                <th>Item</th>
                <th>Area (ha)</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
            <tr>
                <td class="s-no"></td>
                ${showKvk ? '<td></td>' : ''}
                <td style="font-weight:bold;">Total</td>
                <td style="text-align:right;font-weight:bold;">${total ? total : '-'}</td>
            </tr>
        </tfoot>
    </table>
</div>`
}

module.exports = {
    renderLandDetailsSection,
}
