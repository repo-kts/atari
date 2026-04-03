/**
 * OFT Detail Cards Template (Section 2.2)
 *
 * Renders individual OFT trial cards matching the original ATARI website layout:
 *   - Card header: "2.2.N. OFT (Discipline)" with bullet-style thematic area
 *     and problem definition lines
 *   - 16 fields in a 2-column table (# + label | value), no header row
 *   - Result tables with "Tehcnology Options | Proposed | Actual | …" columns
 *   - Superadmin: cards grouped under large centered KVK name headings
 *
 * Bound to reportTemplateService (`this`).
 */

function _formatMonthYear(dateValue) {
    if (!dateValue) return '-'
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return '-'
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    return `${months[d.getMonth()]} ${d.getFullYear()}`
}

function _formatTechnologies(technologies) {
    if (!Array.isArray(technologies) || technologies.length === 0) return '-'
    return technologies.map(tech => {
        const label = tech.optionKey === 'FP'
            ? 'Farmer Practice'
            : (tech.optionName || tech.optionKey || '-')
        return `${label}:${tech.details || '-'}`
    }).join('\n')
}

function _groupByKvk(records) {
    const map = new Map()
    for (const r of records) {
        const name = (r.kvk && r.kvk.kvkName) || 'Unknown KVK'
        if (!map.has(name)) map.set(name, [])
        map.get(name).push(r)
    }
    return map
}

function _isMultiKvk(records) {
    const names = new Set()
    for (const r of records) {
        const name = (r.kvk && r.kvk.kvkName) || ''
        if (name) names.add(name)
        if (names.size > 1) return true
    }
    return false
}

// ─── Main renderer ──────────────────────────────────────────────────────────

function renderOftDetailCardsSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const records = Array.isArray(data) ? data : [data]
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued'

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} OFT</h1>`

    const multiKvk = _isMultiKvk(records)
    let cardIndex = 0

    if (multiKvk) {
        const grouped = _groupByKvk(records)
        for (const [kvkName, kvkRecords] of grouped) {
            html += `
    <div style="text-align:center;margin:32px 0 20px 0;">
        <h2 style="font-size:16px;font-weight:bold;color:#000;margin:0;">${this._escapeHtml(kvkName)}</h2>
    </div>`
            for (const record of kvkRecords) {
                cardIndex++
                html += _renderCard.call(this, record, cardIndex)
            }
        }
    } else {
        for (const record of records) {
            cardIndex++
            html += _renderCard.call(this, record, cardIndex)
        }
    }

    html += `
</div>`

    return html
}

// ─── Single card ────────────────────────────────────────────────────────────

function _renderCard(record, cardNumber) {
    const esc = (v) => this._escapeHtml(v != null && v !== '' ? String(v) : '-')
    const resultReport = record.resultReport || {}

    const disciplineName = (record.discipline && record.discipline.disciplineName) || '-'
    const thematicAreaName = (record.oftThematicArea && record.oftThematicArea.thematicAreaName) || '-'
    const title = record.title || '-'

    // Card header — matches original: bold numbered title, bullet-style sub-lines
    let html = `
    <div style="margin-bottom:28px;">
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:bold;">
            ${section_id(cardNumber)} OFT (${esc(disciplineName)})
        </p>
        <p style="margin:0 0 2px 0;font-size:10px;">
            &bull; <strong>Thematic area:</strong> ${esc(thematicAreaName)}
        </p>
        <p style="margin:0 0 12px 0;font-size:10px;">
            &bull; <strong>Problem definition/Name of OFT:</strong> ${esc(title)}
        </p>`

    // 16-field table — 2 columns, no header row, number inline with label
    const techDetails = _formatTechnologies(record.technologies)

    const fields = [
        ['Title of On farm Trial', record.title],
        ['Problem diagnosed', record.problemDiagnosed],
        ['Details of technologies selected for assessment/refinement (Mention either Assessed)', techDetails],
        ['Source of Technology (ICAR/ AICRP/SAU/other, please specify)', record.sourceOfTechnology],
        ['Production system', record.productionSystem],
        ['Thematic area', thematicAreaName],
        ['Performance indicators of the technology', record.performanceIndicators],
        ['Final recommendation for micro level situation', resultReport.finalRecommendation],
        ['Constraints identified and feedback for research', resultReport.constraintsFeedback],
        ['Process of farmers participation and their reaction', resultReport.farmersParticipationProcess],
        ['Area (ha)/ No of units', record.areaHaNumber],
        ['No. of Trial/Replication', record.numberOfTrialReplication],
        ['OFT Start on', _formatMonthYear(record.oftStartDate)],
        ['OFT End on', _formatMonthYear(record.oftEndDate)],
        ['Critical Input', record.criticalInput],
        ['Cost of OFT', record.costOfOft],
    ]

    html += `
        <table class="data-table" style="width:100%;margin-bottom:16px;">
            <tbody>`

    fields.forEach(([label, value], idx) => {
        const displayValue = (value != null && value !== '') ? String(value) : '-'
        const escapedValue = this._escapeHtml(displayValue).replace(/\n/g, '<br/>')

        html += `
                <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
                    <td style="width:45%;vertical-align:top;padding:5px 6px;">
                        <strong>${idx + 1}.</strong>&nbsp;&nbsp;${this._escapeHtml(label)}
                    </td>
                    <td style="vertical-align:top;padding:5px 6px;">${escapedValue}</td>
                </tr>`
    })

    html += `
            </tbody>
        </table>`

    // Results section
    html += _renderResultsSection.call(this, resultReport)

    html += `
    </div>`

    return html
}

function section_id(n) {
    return `2.2.${n}.`
}

// ─── Results section ────────────────────────────────────────────────────────

function _renderResultsSection(resultReport) {
    if (!resultReport) return ''

    const tables = resultReport.tables
    const hasContent = (Array.isArray(tables) && tables.length > 0) || resultReport.resultText

    if (!hasContent) return ''

    let html = `
        <div style="margin-top:12px;">
            <p style="margin:0 0 8px 0;font-size:11px;font-weight:bold;">
                B. Results with Table and good quality photographs in jpg.
            </p>`

    if (Array.isArray(tables) && tables.length > 0) {
        const sorted = [...tables].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        sorted.forEach((table, tIdx) => {
            html += _renderResultTable.call(this, table, tIdx + 1)
        })
    }

    if (resultReport.resultText) {
        html += `
            <p style="margin:8px 0 0 0;font-size:10px;">
                <strong>Result:</strong> ${this._escapeHtml(resultReport.resultText)}
            </p>`
    }

    html += `
        </div>`

    return html
}

function _renderResultTable(table, tableNumber) {
    const columns = Array.isArray(table.columns) ? [...table.columns] : []
    const rows = Array.isArray(table.rows) ? [...table.rows] : []

    if (columns.length === 0 && rows.length === 0) return ''

    columns.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

    // Separate "Proposed" and "Actual" columns from the rest
    const proposedCol = columns.find(c =>
        (c.columnLabel || '').toLowerCase() === 'proposed' ||
        (c.columnKey || '').toLowerCase() === 'proposed'
    )
    const actualCol = columns.find(c =>
        (c.columnLabel || '').toLowerCase() === 'actual' ||
        (c.columnKey || '').toLowerCase() === 'actual'
    )
    const dataColumns = columns.filter(c => c !== proposedCol && c !== actualCol)

    const tableTitle = table.tableTitle || ''

    let html = `
            <p style="margin:12px 0 4px 0;font-size:10px;font-weight:bold;">
                Table ${tableNumber} : ${this._escapeHtml(tableTitle)}
            </p>
            <table class="data-table" style="width:100%;margin-bottom:12px;font-size:8pt;">
                <thead>
                    <tr>
                        <th>Tehcnology Options</th>`

    // "Proposed" and "Actual" columns come right after Technology Options
    if (proposedCol) {
        html += `<th>${this._escapeHtml(proposedCol.columnLabel || 'Proposed')}</th>`
    }
    if (actualCol) {
        html += `<th>${this._escapeHtml(actualCol.columnLabel || 'Actual')}</th>`
    }

    for (const col of dataColumns) {
        html += `<th>${this._escapeHtml(col.columnLabel || col.columnKey || '-')}</th>`
    }

    html += `
                    </tr>
                </thead>
                <tbody>`

    // Build ordered column list for cell rendering
    const orderedColumns = []
    if (proposedCol) orderedColumns.push(proposedCol)
    if (actualCol) orderedColumns.push(actualCol)
    orderedColumns.push(...dataColumns)

    rows.forEach((row, rIdx) => {
        const rowLabel = row.rowLabel || row.optionKey || '-'

        const cellMap = new Map()
        if (Array.isArray(row.cells)) {
            for (const cell of row.cells) {
                if (cell.oftResultTableColumnId !== undefined) {
                    cellMap.set(cell.oftResultTableColumnId, cell.value)
                }
            }
        }

        html += `
                    <tr class="${rIdx % 2 === 0 ? 'even' : 'odd'}">
                        <td>${this._escapeHtml(rowLabel)}</td>`

        for (const col of orderedColumns) {
            const cellValue = cellMap.get(col.oftResultTableColumnId)
            const display = (cellValue != null && cellValue !== '') ? String(cellValue) : '-'
            html += `<td>${this._escapeHtml(display)}</td>`
        }

        html += `</tr>`
    })

    html += `
                </tbody>
            </table>`

    return html
}

module.exports = {
    renderOftDetailCardsSection,
}
