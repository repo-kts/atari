/**
 * OFT Detail Cards Template (Section 2.2)
 *
 * Matches the original ATARI website layout exactly:
 *   - "2.2. OFT" heading
 *   - Superadmin: large centered bold KVK name headings
 *   - Card header: "2.2.N. OFT (Discipline)"
 *   - Bullet lines: • Thematic area: … / • Problem definition/Name of OFT: …
 *   - 16 fields in 3-column table: narrow # | bold label | value (NO header row)
 *   - Technology field 3: bold option names (Farmer Practice:, TO1:, TO2:)
 *   - Result table: "Tehcnology Options | Proposed | Actual | …" (original spelling)
 *   - Result: text paragraph after table
 *
 * Bound to reportTemplateService (`this`).
 */

function _formatMonthYear(dateValue) {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format technologies with bold option names matching original:
 * **Farmer Practice:**details
 * **TO1:**details
 * **TO2:**details
 */
function _formatTechnologiesHtml(technologies, escapeHtml) {
    if (!Array.isArray(technologies) || technologies.length === 0) return '-';
    return technologies.map(tech => {
        const label = tech.optionKey === 'FP'
            ? 'Farmer Practice'
            : (tech.optionName || tech.optionKey || '-');
        const details = tech.details || '';
        return `<strong>${escapeHtml(label)}:</strong>${escapeHtml(details)}`;
    }).join('<br/>');
}

function _groupByKvk(records) {
    const map = new Map();
    for (const r of records) {
        const name = (r.kvk && r.kvk.kvkName) || 'Unknown KVK';
        if (!map.has(name)) map.set(name, []);
        map.get(name).push(r);
    }
    return map;
}

function _isMultiKvk(records) {
    const names = new Set();
    for (const r of records) {
        const name = (r.kvk && r.kvk.kvkName) || '';
        if (name) names.add(name);
        if (names.size > 1) return true;
    }
    return false;
}

// ─── Main renderer ──────────────────────────────────────────────────────────

function renderOftDetailCardsSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const records = Array.isArray(data) ? data : [data];
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size:12px;font-weight:bold;border-bottom:none;margin-bottom:16px;">2.2. OFT</h1>`;

    const multiKvk = _isMultiKvk(records);
    let cardIndex = 0;

    if (multiKvk) {
        const grouped = _groupByKvk(records);
        for (const [kvkName, kvkRecords] of grouped) {
            // Large centered bold KVK heading — matches original
            html += `
    <div style="text-align:center;margin:36px 0 24px 0;">
        <p style="font-size:18px;font-weight:bold;color:#000;margin:0;">${this._escapeHtml(kvkName)}</p>
    </div>`;
            for (const record of kvkRecords) {
                cardIndex++;
                html += _renderCard.call(this, record, cardIndex);
            }
        }
    } else {
        for (const record of records) {
            cardIndex++;
            html += _renderCard.call(this, record, cardIndex);
        }
    }

    html += `
</div>`;

    return html;
}

// ─── Single card ────────────────────────────────────────────────────────────

function _renderCard(record, cardNumber) {
    const esc = (v) => this._escapeHtml(v != null && v !== '' ? String(v) : '-');
    const resultReport = record.resultReport || {};

    const disciplineName = (record.discipline && record.discipline.disciplineName) || '-';
    const thematicAreaName = (record.oftThematicArea && record.oftThematicArea.thematicAreaName) || '-';
    const title = record.title || '-';

    // Card header — bold section number, bullet sub-lines
    let html = `
    <div style="margin-bottom:32px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:bold;">
            2.2.${cardNumber}. OFT (${esc(disciplineName)})
        </p>
        <p style="margin:0 0 4px 16px;font-size:10px;">
            &bull; <strong>Thematic area:</strong> ${esc(thematicAreaName)}
        </p>
        <p style="margin:0 0 14px 16px;font-size:10px;">
            &bull; <strong>Problem definition/Name of OFT:</strong> ${esc(title)}
        </p>`;

    // Technology field — HTML with bold labels
    const techHtml = _formatTechnologiesHtml(record.technologies, this._escapeHtml.bind(this));

    // 16-field table: 3 columns — narrow #, bold label, value. NO header row.
    const fields = [
        ['Title of On farm Trial', esc(record.title)],
        ['Problem diagnosed', esc(record.problemDiagnosed)],
        ['Details of technologies selected for assessment/refinement (Mention either Assessed)', techHtml],
        ['Source of Technology (ICAR/ AICRP/SAU/other, please specify)', esc(record.sourceOfTechnology)],
        ['Production system', esc(record.productionSystem)],
        ['Thematic area', esc(thematicAreaName)],
        ['Performance indicators of the technology', esc(record.performanceIndicators)],
        ['Final recommendation for micro level situation', esc(resultReport.finalRecommendation)],
        ['Constraints identified and feedback for research', esc(resultReport.constraintsFeedback)],
        ['Process of farmers participation and their reaction', esc(resultReport.farmersParticipationProcess)],
        ['Quantity', esc(record.quantity)],
        ['Unit', esc(record.unit)],
        ['No. of Trial/Replication', esc(record.numberOfTrialReplication)],
        ['OFT Start on', this._escapeHtml(_formatMonthYear(record.oftStartDate))],
        ['OFT End on', this._escapeHtml(_formatMonthYear(record.oftEndDate))],
        ['Critical Input', esc(record.criticalInput)],
        ['Cost of OFT', esc(record.costOfOft)],
    ];

    html += `
        <table class="data-table" style="width:100%;margin-bottom:16px;">
            <tbody>`;

    fields.forEach(([label, valueHtml], idx) => {
        // Field 3 (technologies) already has HTML formatting, others are escaped
        const isHtmlField = idx === 2;
        const displayValue = (!valueHtml || valueHtml === '-') ? '-' : valueHtml;

        html += `
                <tr>
                    <td style="width:24px;text-align:right;vertical-align:top;padding:5px 4px 5px 6px;font-size:8pt;">${idx + 1}.</td>
                    <td style="width:42%;vertical-align:top;padding:5px 6px;font-size:8pt;"><strong>${this._escapeHtml(label)}</strong></td>
                    <td style="vertical-align:top;padding:5px 6px;font-size:8pt;">${isHtmlField ? displayValue : displayValue}</td>
                </tr>`;
    });

    html += `
            </tbody>
        </table>`;

    // Results section
    html += _renderResultsSection.call(this, resultReport);

    html += `
    </div>`;

    return html;
}

// ─── Results section ────────────────────────────────────────────────────────

function _renderResultsSection(resultReport) {
    if (!resultReport) return '';

    const tables = resultReport.tables;
    const hasContent = (Array.isArray(tables) && tables.length > 0) || resultReport.resultText;

    if (!hasContent) return '';

    let html = `
        <div style="margin-top:16px;">
            <p style="margin:0 0 12px 0;font-size:11px;font-weight:bold;">
                B. Results with Table and good quality photographs in jpg.
            </p>`;

    if (Array.isArray(tables) && tables.length > 0) {
        const sorted = [...tables].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        sorted.forEach((table, tIdx) => {
            html += _renderResultTable.call(this, table, tIdx + 1);
        });
    }

    // Result text — italic "Result:" prefix matching original
    if (resultReport.resultText) {
        html += `
            <p style="margin:12px 0 0 0;font-size:9pt;">
                <em><strong>Result:</strong></em> ${this._escapeHtml(resultReport.resultText)}
            </p>`;
    }

    html += `
        </div>`;

    return html;
}

function _renderResultTable(table, tableNumber) {
    const columns = Array.isArray(table.columns) ? [...table.columns] : [];
    const rows = Array.isArray(table.rows) ? [...table.rows] : [];

    if (columns.length === 0 && rows.length === 0) return '';

    columns.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Separate Proposed/Actual columns — they go right after Technology Options
    const proposedCol = columns.find(c =>
        /^proposed$/i.test((c.columnLabel || '').trim()) ||
        /^proposed$/i.test((c.columnKey || '').trim())
    );
    const actualCol = columns.find(c =>
        /^actual$/i.test((c.columnLabel || '').trim()) ||
        /^actual$/i.test((c.columnKey || '').trim())
    );
    const dataColumns = columns.filter(c => c !== proposedCol && c !== actualCol);

    const tableTitle = table.tableTitle || '';

    // Table title — bold, larger font, matching original
    let html = `
            <p style="margin:16px 0 8px 0;font-size:10pt;font-weight:bold;">
                Table ${tableNumber} : ${this._escapeHtml(tableTitle)}
            </p>
            <table class="data-table" style="width:100%;margin-bottom:12px;font-size:8pt;">
                <thead>
                    <tr>
                        <th>Tehcnology Options</th>`;

    // Proposed and Actual columns right after Technology Options
    if (proposedCol) {
        html += `<th>${this._escapeHtml(proposedCol.columnLabel || 'Proposed')}</th>`;
    }
    if (actualCol) {
        html += `<th>${this._escapeHtml(actualCol.columnLabel || 'Actual')}</th>`;
    }
    for (const col of dataColumns) {
        html += `<th>${this._escapeHtml(col.columnLabel || col.columnKey || '-')}</th>`;
    }

    html += `
                    </tr>
                </thead>
                <tbody>`;

    const orderedColumns = [];
    if (proposedCol) orderedColumns.push(proposedCol);
    if (actualCol) orderedColumns.push(actualCol);
    orderedColumns.push(...dataColumns);

    rows.forEach((row, rIdx) => {
        const rowLabel = row.rowLabel || row.optionKey || '-';

        const cellMap = new Map();
        if (Array.isArray(row.cells)) {
            for (const cell of row.cells) {
                if (cell.oftResultTableColumnId !== undefined) {
                    cellMap.set(cell.oftResultTableColumnId, cell.value);
                }
            }
        }

        html += `
                    <tr>
                        <td>${this._escapeHtml(rowLabel)}</td>`;

        for (const col of orderedColumns) {
            const cellValue = cellMap.get(col.oftResultTableColumnId);
            const display = (cellValue != null && cellValue !== '') ? String(cellValue) : '-';
            html += `<td>${this._escapeHtml(display)}</td>`;
        }

        html += `</tr>`;
    });

    html += `
                </tbody>
            </table>`;

    return html;
}

module.exports = {
    renderOftDetailCardsSection,
};
