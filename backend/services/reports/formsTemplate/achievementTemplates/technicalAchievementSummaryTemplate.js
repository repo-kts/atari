/**
 * Technical Achievement Summary (§2.1).
 * Target vs Achievement across the main activity blocks + caste×gender
 * beneficiary demographics where captured. Bound to reportTemplateService.
 *
 * Rendered as wide merged-header grids (matching the on-screen report): each
 * block is one table with a section title, a left group of activity metrics and
 * a right group of farmer/participant demographics broken down by
 * General/OBC/SC/ST × M/F plus a Total. The same HTML drives PDF (Puppeteer),
 * Word and Excel — the latter two parse this HTML and reproduce the merges.
 */
function n(v) { return v === null || v === undefined || v === '' ? 0 : v; }

// The 11 demographic data cells (General M/F, OBC M/F, SC M/F, ST M/F,
// Total M/F/T) from a sumCaste-shaped object.
function participantCells(demo) {
    const d = demo || {};
    const c = (x) => `<td>${n(x)}</td>`;
    return (
        c(d.gm) + c(d.gf) +
        c(d.om) + c(d.of) +
        c(d.sm) + c(d.sf) +
        c(d.stm) + c(d.stf) +
        c(d.totM) + c(d.totF) +
        `<td style="font-weight:bold;">${n(d.totT)}</td>`
    );
}

// Category header row (spans the 11 demographic columns).
const CATEGORY_HEADER_ROW =
    '<tr><th colspan="2">General</th><th colspan="2">OBC</th>' +
    '<th colspan="2">SC</th><th colspan="2">ST</th><th colspan="3">Total</th></tr>';

// M/F (and Total T) header row under each category.
const GENDER_HEADER_ROW =
    '<tr><th>M</th><th>F</th><th>M</th><th>F</th><th>M</th><th>F</th>' +
    '<th>M</th><th>F</th><th>M</th><th>F</th><th>T</th></tr>';

/**
 * Render one activity block as a grid table.
 *   title        section heading (e.g. 'OFT')
 *   subtitle     optional line under the title (e.g. 'No. of Technologies Tested')
 *   leftLabel    label spanning the activity-metric columns (e.g. 'No. of OFTs')
 *   leftCols     [[label, value], …] activity metrics
 *   rightLabel   label spanning the demographic columns (e.g. 'No. of Farmers')
 *   farmerTarget if not null, adds a 'Farmer Target' column before Achievement
 *   demo         sumCaste-shaped demographics object
 */
function gridBlock(esc, { title, subtitle, leftLabel, leftCols, rightLabel, farmerTarget, demo }) {
    const leftN = leftCols.length;
    const farmerTargetCol = farmerTarget !== null && farmerTarget !== undefined;
    const rightN = farmerTargetCol ? 12 : 11; // +1 for the Farmer Target column
    const totalCols = leftN + rightN;

    const leftHeadCells = leftCols
        .map(([label]) => `<th rowspan="3">${esc(label)}</th>`)
        .join('');
    const farmerTargetHead = farmerTargetCol ? '<th rowspan="3">Farmer Target</th>' : '';
    const leftDataCells = leftCols.map(([, value]) => `<td>${n(value)}</td>`).join('');
    const farmerTargetData = farmerTargetCol ? `<td>${n(farmerTarget)}</td>` : '';

    return `
        <table class="data-table" style="margin-top:10px;font-size:9pt;text-align:center;">
            <thead>
                <tr><th colspan="${totalCols}" style="font-size:11pt;">${esc(title)}</th></tr>
                ${subtitle ? `<tr><th colspan="${totalCols}">${esc(subtitle)}</th></tr>` : ''}
                <tr>
                    <th colspan="${leftN}">${esc(leftLabel)}</th>
                    <th colspan="${rightN}">${esc(rightLabel)}</th>
                </tr>
                <tr>
                    ${leftHeadCells}
                    ${farmerTargetHead}
                    <th colspan="11">Achievement</th>
                </tr>
                ${CATEGORY_HEADER_ROW}
                ${GENDER_HEADER_ROW}
            </thead>
            <tbody>
                <tr>
                    ${leftDataCells}
                    ${farmerTargetData}
                    ${participantCells(demo)}
                </tr>
            </tbody>
        </table>`;
}

// Other Extension Activities — broken down by activity type (no target/
// participant data exists for it), with a Total row. Same table drives PDF,
// Word and Excel via the shared HTML parser.
function otherExtensionBlock(esc, { title, rows, total }) {
    const hasRows = Array.isArray(rows) && rows.length > 0;
    const bodyRows = hasRows
        ? rows.map((r) => `<tr><td style="text-align:left;">${esc(r.activityType)}</td><td>${n(r.count)}</td></tr>`).join('')
        : '<tr><td colspan="2">No other extension activity records in this period.</td></tr>';
    const totalRow = hasRows
        ? `<tr><td style="text-align:left;font-weight:bold;">Total</td><td style="font-weight:bold;">${n(total)}</td></tr>`
        : '';
    return `
        <table class="data-table" style="margin-top:10px;font-size:9pt;text-align:center;">
            <thead>
                <tr><th colspan="2" style="font-size:11pt;">${esc(title)}</th></tr>
                <tr><th style="text-align:left;">Activity Type</th><th>Number of Activities</th></tr>
            </thead>
            <tbody>
                ${bodyRows}
                ${totalRow}
            </tbody>
        </table>`;
}

function renderTechnicalAchievementSummarySection(section, data, sectionId, isFirstSection) {
    const esc = (v) => this._escapeHtml(v != null ? String(v) : '');
    const d = data || {};
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const hasAny = d.oft || d.fld || d.training || d.extension || d.otherExtension
        || (d.production && d.production.length);
    if (!hasAny) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>`;

    if (d.oft) {
        html += gridBlock(esc, {
            title: 'OFT',
            subtitle: 'No. of Technologies Tested',
            leftLabel: 'No. of OFTs',
            leftCols: [
                ['Target', d.oft.target],
                ['Achievement', d.oft.achievement],
                ['No. of Location', d.oft.locations],
                ['No. of Trials', d.oft.trials],
            ],
            rightLabel: 'No. of Farmers',
            farmerTarget: d.oft.farmerTarget,
            demo: d.oft.farmers,
        });
    }

    if (d.fld) {
        html += gridBlock(esc, {
            title: 'FLD',
            subtitle: 'No. of Technologies Demonstrated',
            leftLabel: 'Number of FLDs',
            leftCols: [
                ['Target', d.fld.target],
                ['Achievement', d.fld.achievement],
                ['Area', d.fld.area],
            ],
            rightLabel: 'Number of Farmers',
            farmerTarget: d.fld.farmerTarget,
            demo: d.fld.farmers,
        });
    }

    if (d.training) {
        html += gridBlock(esc, {
            title: 'Training',
            subtitle: 'Number of Courses',
            leftLabel: 'Number of Courses',
            leftCols: [
                ['Target', d.training.target],
                ['Achievement', d.training.courses],
            ],
            rightLabel: 'Number of Participants',
            farmerTarget: d.training.farmerTarget,
            demo: d.training.participants,
        });
    }

    if (d.extension) {
        html += gridBlock(esc, {
            title: 'Extension Activities',
            subtitle: 'Number of Activities',
            leftLabel: 'Number of Activities',
            leftCols: [
                ['Target', d.extension.target],
                ['Achievement', d.extension.activities],
            ],
            rightLabel: 'Number of Participants',
            farmerTarget: d.extension.farmerTarget,
            demo: d.extension.participants,
        });
    }

    if (d.otherExtension) {
        html += otherExtensionBlock(esc, {
            title: 'Other Extension Activities',
            rows: d.otherExtension.rows,
            total: d.otherExtension.activities,
        });
    }

    for (const p of (d.production || [])) {
        html += gridBlock(esc, {
            title: p.category,
            subtitle: null,
            leftLabel: esc(p.category),
            leftCols: [
                ['Target', p.target],
                ['Quantity', p.quantity],
                ['Value (Rs.)', p.value],
            ],
            rightLabel: 'Number of Participants',
            farmerTarget: null,
            demo: p.beneficiaries,
        });
    }

    html += `
</div>`;
    return html;
}

module.exports = { renderTechnicalAchievementSummarySection };
