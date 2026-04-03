/**
 * OFT Detail Cards Template (Section 2.2)
 *
 * Renders individual OFT trial cards with 16 labeled fields and dynamic
 * result tables. Supports both single-KVK and multi-KVK (superadmin) views.
 *
 * Bound to reportTemplateService instance — uses this._escapeHtml(),
 * this._generateEmptySection(), this._toDisplayValue().
 */

/**
 * Format a date value as "Mon YYYY" (e.g., "Feb 2024").
 * Returns '-' when the input is falsy or unparseable.
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

/**
 * Build the "Details of technologies selected" display string from the
 * technologies array.  FP → "Farmer Practice", everything else keeps its
 * optionName (TO1, TO2, …).
 */
function _formatTechnologies(technologies) {
    if (!Array.isArray(technologies) || technologies.length === 0) return '-'

    const lines = technologies.map(tech => {
        const label = tech.optionKey === 'FP' ? 'Farmer Practice' : (tech.optionName || tech.optionKey || '-')
        const details = tech.details || '-'
        return `${label}: ${details}`
    })

    return lines.join('\n')
}

/**
 * Group an array of records by kvk.kvkName, preserving insertion order.
 */
function _groupByKvk(records) {
    const map = new Map()
    for (const record of records) {
        const kvkName = (record.kvk && record.kvk.kvkName) || 'Unknown KVK'
        if (!map.has(kvkName)) {
            map.set(kvkName, [])
        }
        map.get(kvkName).push(record)
    }
    return map
}

/**
 * Determine whether the dataset spans multiple KVKs (superadmin scope).
 */
function _isMultiKvk(records) {
    const names = new Set()
    for (const r of records) {
        const name = (r.kvk && r.kvk.kvkName) || ''
        if (name) names.add(name)
        if (names.size > 1) return true
    }
    return false
}

// ─── Main renderer ───────────────────────────────────────────────────────────

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
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>`

    const multiKvk = _isMultiKvk(records)
    let cardIndex = 0

    if (multiKvk) {
        const grouped = _groupByKvk(records)
        for (const [kvkName, kvkRecords] of grouped) {
            html += `
    <h2 style="margin-top:24px;margin-bottom:12px;font-size:14px;font-weight:bold;color:#1a1a1a;">
        KVK ${this._escapeHtml(kvkName)}
    </h2>`
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

// ─── Single card renderer ────────────────────────────────────────────────────

function _renderCard(record, cardNumber) {
    const esc = (v) => this._escapeHtml(this._toDisplayValue(v))
    const resultReport = record.resultReport || {}

    const disciplineName = (record.discipline && record.discipline.disciplineName) || '-'
    const thematicAreaName = (record.oftThematicArea && record.oftThematicArea.thematicAreaName) || '-'
    const title = record.title || '-'

    // Card header
    let html = `
    <div style="page-break-inside:avoid;margin-bottom:28px;border:1px solid #ccc;border-radius:4px;padding:16px;">
        <h3 style="margin:0 0 4px 0;font-size:13px;font-weight:bold;color:#333;">
            2.2.${cardNumber}. OFT (${esc(disciplineName)})
        </h3>
        <p style="margin:0 0 2px 0;font-size:12px;color:#555;">
            Thematic area: ${esc(thematicAreaName)}
        </p>
        <p style="margin:0 0 12px 0;font-size:12px;color:#555;">
            Problem definition/Name of OFT: ${esc(title)}
        </p>`

    // 16-field key-value table
    const techDetails = _formatTechnologies(record.technologies)

    const fields = [
        ['Title of On farm Trial', record.title],
        ['Problem diagnosed', record.problemDiagnosed],
        [
            'Details of technologies selected for assessment/refinement (Mention either Assessed)',
            techDetails,
        ],
        ['Source of Technology (ICAR/ AICRP/SAU/other, please specify)', record.sourceOfTechnology],
        ['Production system', record.productionSystem],
        ['Thematic area', thematicAreaName],
        ['Performance indicators of the technology', record.performanceIndicators],
        ['Final recommendation for micro level situation', resultReport.finalRecommendation || '-'],
        ['Constraints identified and feedback for research', resultReport.constraintsFeedback || '-'],
        ['Process of farmers participation and their reaction', resultReport.farmersParticipationProcess || '-'],
        ['Area (ha)/ No of units', record.areaHaNumber],
        ['No. of Trial/Replication', record.numberOfTrialReplication],
        ['OFT Start on', _formatMonthYear(record.oftStartDate)],
        ['OFT End on', _formatMonthYear(record.oftEndDate)],
        ['Critical Input', record.criticalInput],
        ['Cost of OFT', record.costOfOft],
    ]

    html += `
        <table class="data-table" style="width:100%;margin-bottom:16px;">
            <thead>
                <tr>
                    <th style="width:30px;text-align:center;">Sl.</th>
                    <th style="width:40%;">Particulars</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>`

    fields.forEach(([label, value], idx) => {
        const rowClass = idx % 2 === 0 ? 'even' : 'odd'
        const displayValue = (value !== null && value !== undefined && value !== '')
            ? String(value)
            : '-'
        // Preserve newlines in the technology details field
        const escapedValue = this._escapeHtml(displayValue).replace(/\n/g, '<br/>')

        html += `
                <tr class="${rowClass}">
                    <td style="text-align:center;">${idx + 1}.</td>
                    <td>${this._escapeHtml(label)}</td>
                    <td>${escapedValue}</td>
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

// ─── Results section (tables + result text) ──────────────────────────────────

function _renderResultsSection(resultReport) {
    if (!resultReport) return ''

    let html = `
        <div style="margin-top:12px;">
            <h4 style="margin:0 0 8px 0;font-size:12px;font-weight:bold;">
                B. Results with Table and good quality photographs in jpg.
            </h4>`

    const tables = resultReport.tables
    if (Array.isArray(tables) && tables.length > 0) {
        // Sort tables by sortOrder if available
        const sorted = [...tables].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

        sorted.forEach((table, tIdx) => {
            html += _renderResultTable.call(this, table, tIdx + 1)
        })
    }

    // Result text
    if (resultReport.resultText) {
        html += `
            <p style="margin:8px 0 0 0;font-size:11px;">
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

    // Sort columns and rows by sortOrder
    columns.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

    const tableTitle = table.tableTitle || ''

    let html = `
            <p style="margin:12px 0 4px 0;font-size:11px;font-weight:bold;">
                Table ${tableNumber} : ${this._escapeHtml(tableTitle)}
            </p>
            <table class="data-table" style="width:100%;margin-bottom:12px;">
                <thead>
                    <tr>
                        <th>Technology Options</th>`

    for (const col of columns) {
        html += `
                        <th>${this._escapeHtml(col.columnLabel || col.columnKey || '-')}</th>`
    }

    html += `
                    </tr>
                </thead>
                <tbody>`

    rows.forEach((row, rIdx) => {
        const rowClass = rIdx % 2 === 0 ? 'even' : 'odd'
        const rowLabel = row.rowLabel || row.optionKey || '-'

        html += `
                    <tr class="${rowClass}">
                        <td>${this._escapeHtml(rowLabel)}</td>`

        // Build a map from column ID to cell value for fast lookup
        const cellMap = new Map()
        if (Array.isArray(row.cells)) {
            for (const cell of row.cells) {
                if (cell.oftResultTableColumnId !== undefined) {
                    cellMap.set(cell.oftResultTableColumnId, cell.value)
                }
            }
        }

        for (const col of columns) {
            const cellValue = cellMap.get(col.oftResultTableColumnId)
            const display = (cellValue !== null && cellValue !== undefined && cellValue !== '')
                ? String(cellValue)
                : '-'
            html += `
                        <td>${this._escapeHtml(display)}</td>`
        }

        html += `
                    </tr>`
    })

    html += `
                </tbody>
            </table>`

    return html
}

module.exports = {
    renderOftDetailCardsSection,
}
