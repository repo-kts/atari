/**
 * FLD report (section 2.4 "Front Line Demonstration").
 *
 * Renders three labeled sub-blocks from the resolved payload:
 *   A. FLD Summary             — sector-wise totals (demos / area / farmers).
 *   B. State Wise Details      — states (rows) x sector column-groups
 *                                (No. of demo / Area(ha) / No. of farmers) + Total.
 *   C. Details of FLD          — per category: crops x states with yield and
 *                                economics (demonstration vs check).
 *
 * Wide tables auto-shrink (font scales with column count) so they never crop.
 *
 * Bound to reportTemplateService (`this`).
 */

const {
    resolveFldStateCategoryPayload,
} = require('../../../../repositories/reports/fldStateCategoryReport/fldStateCategoryReportRepository.js');
const {
    getFldResultReportColumns,
    groupColumns,
} = require('../../../../utils/fldResultReportColumns.js');

function fmtInt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? String(Math.round(n)) : '0';
}
function fmtNum(v, d = 2) {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(d) : '—';
}

/** Font size (pt) that keeps a wide table inside the page as columns grow. */
function fitFont(colCount) {
    if (colCount <= 8) return 7.5;
    if (colCount <= 12) return 6.5;
    if (colCount <= 16) return 5.5;
    if (colCount <= 22) return 4.6;
    return 4;
}

// ── A. FLD Summary (sector totals) ───────────────────────────────────
function renderSummary(ctx, sectionA) {
    const esc = (v) => ctx._escapeHtml(v);
    const cells = (sectionA && sectionA.totalRow && sectionA.totalRow.cells) || [];
    const grand = (sectionA && sectionA.totalRow && sectionA.totalRow.total) || { demos: 0, area: 0, farmers: 0 };

    let body = '';
    for (const c of cells) {
        body += `<tr><td>${esc(c.sectorName)}</td><td style="text-align:center;">${fmtInt(c.demos)}</td><td style="text-align:center;">${fmtNum(c.area, 2)}</td><td style="text-align:center;">${fmtInt(c.farmers)}</td></tr>`;
    }
    if (!body) body = `<tr><td colspan="4" style="text-align:center;">No data</td></tr>`;

    return `<table class="data-table">
        <thead><tr>
            <th>Sector</th>
            <th style="text-align:center;">No. of Demonstrations</th>
            <th style="text-align:center;">Area (ha)</th>
            <th style="text-align:center;">No. of Farmers</th>
        </tr></thead>
        <tbody>
            ${body}
            <tr style="font-weight:bold;"><td>Total</td><td style="text-align:center;">${fmtInt(grand.demos)}</td><td style="text-align:center;">${fmtNum(grand.area, 2)}</td><td style="text-align:center;">${fmtInt(grand.farmers)}</td></tr>
        </tbody>
    </table>`;
}

// ── B. State wise details (sectors as column groups) ─────────────────
// Per-sector sub-columns for the state-wise table. Each entry maps a cell field
// ({ farmers, demos, area }) to a display label — some sectors relabel a field
// (Livestock "Unit", Other Enterprises / Women Empowerment "No. of Implements")
// and some show only two columns. Sectors not listed fall back to the default
// farmers / demo / area trio.
const DEFAULT_SECTOR_COLUMNS = [
    { key: 'farmers', label: 'No. of farmers' },
    { key: 'demos', label: 'No. of demo' },
    { key: 'area', label: 'Area (ha)' },
];
const SECTOR_COLUMNS = {
    'Crop Production': DEFAULT_SECTOR_COLUMNS,
    'Horticultural Crops': DEFAULT_SECTOR_COLUMNS,
    'Livestock & Fisheries': [
        { key: 'farmers', label: 'No. of farmers' },
        { key: 'demos', label: 'No. of demo' },
        { key: 'area', label: 'Unit' },
    ],
    'Other Enterprises': [
        { key: 'farmers', label: 'No. of farmers' },
        { key: 'demos', label: 'No. of Implements' },
    ],
    'Women Empowerment': [
        { key: 'farmers', label: 'No. of farmers' },
        { key: 'demos', label: 'No. of Implements' },
    ],
    'Farm Implements and Machinery': DEFAULT_SECTOR_COLUMNS,
    'Crop Hybrid Varieties': DEFAULT_SECTOR_COLUMNS,
};
const TOTAL_COLUMNS = DEFAULT_SECTOR_COLUMNS;

function sectorColumns(sectorName) {
    return SECTOR_COLUMNS[sectorName] || DEFAULT_SECTOR_COLUMNS;
}

function renderStateWise(ctx, sectionA, yearLabel) {
    const esc = (v) => ctx._escapeHtml(v);
    const sectors = (sectionA && sectionA.sectors) || [];
    if (sectors.length === 0) return '<p class="no-data">No data.</p>';

    // Total sub-column count drives the fit-font (States + every sector's cols + Total group).
    const subColCount = sectors.reduce((n, s) => n + sectorColumns(s).length, 0)
        + TOTAL_COLUMNS.length;
    const fs = fitFont(1 + subColCount);

    // Header row 1: group names (colspan = that sector's column count).
    let head = `<tr><th rowspan="2" style="vertical-align:middle;">States</th>`;
    for (const s of sectors) {
        head += `<th colspan="${sectorColumns(s).length}" style="text-align:center;">${esc(s)}</th>`;
    }
    head += `<th colspan="${TOTAL_COLUMNS.length}" style="text-align:center;">Total</th></tr><tr>`;
    // Header row 2: per-sector sub-column labels, then the Total group's labels.
    for (const s of sectors) {
        for (const col of sectorColumns(s)) {
            head += `<th style="text-align:center;">${esc(col.label)}</th>`;
        }
    }
    for (const col of TOTAL_COLUMNS) {
        head += `<th style="text-align:center;">${esc(col.label)}</th>`;
    }
    head += `</tr>`;

    const fmtField = (c, key) => (key === 'area' ? fmtNum(c.area, 2) : fmtInt(c[key]));
    const cellsFor = (c, cols) => cols
        .map((col) => `<td style="text-align:center;">${fmtField(c, col.key)}</td>`)
        .join('');

    const rowHtml = (row, bold) => {
        let h = `<tr${bold ? ' style="font-weight:bold;"' : ''}><td>${esc(row.stateName)}</td>`;
        row.cells.forEach((c, i) => {
            h += cellsFor(c, sectorColumns(sectors[i]));
        });
        h += cellsFor(row.total, TOTAL_COLUMNS);
        return h + '</tr>';
    };

    let body = '';
    for (const row of sectionA.stateRows) body += rowHtml(row, false);
    if (sectionA.totalRow) body += rowHtml(sectionA.totalRow, true);

    return `<table class="data-table report-fit" style="font-size:${fs}pt;">
        <thead>${head}</thead>
        <tbody>${body}</tbody>
    </table>`;
}

// ── C. Details (per category: crops x states, yield + economics) ─────
function renderDetailTable(ctx, cropGroups, category) {
    const esc = (v) => ctx._escapeHtml(v);
    const firstSource = category || cropGroups?.[0]?.totalRow || cropGroups?.[0]?.rows?.[0] || {};
    const columns = getFldResultReportColumns(firstSource);
    const columnGroups = groupColumns(columns);
    const totalColCount = 5 + columns.length;
    const fs = fitFont(totalColCount);

    const fr = (r) => r.fldResult || {};
    const resultValue = (f, key) => {
        if (key === 'yieldDemo') return f.demoYield;
        if (key === 'yieldCheck') return f.checkYield;
        return f[key];
    };
    const detailCells = (r) => {
        const f = fr(r);
        return columns.map((col) => {
            const value = resultValue(f, col.key);
            return `<td style="text-align:center;">${value != null ? fmtNum(value, col.decimals) : '—'}</td>`;
        }).join('');
    };

    let body = '';
    for (const cg of cropGroups) {
        const rows = cg.rows || [];
        const span = rows.length + (cg.totalRow ? 1 : 0);
        rows.forEach((r, i) => {
            body += `<tr>`;
            if (i === 0) body += `<td rowspan="${span}" style="font-weight:bold;vertical-align:middle;">${esc(cg.cropName)}</td>`;
            body += `<td>${esc(r.state)}</td><td style="text-align:center;">${fmtInt(r.demos)}</td><td style="text-align:center;">${fmtNum(r.areaHa, 2)}</td><td style="text-align:center;">${fmtInt(r.farmers)}</td>${detailCells(r)}</tr>`;
        });
        if (cg.totalRow) {
            body += `<tr style="font-weight:bold;">`;
            if (rows.length === 0) body += `<td style="font-weight:bold;">${esc(cg.cropName)}</td>`;
            body += `<td>Total</td><td style="text-align:center;">${fmtInt(cg.totalRow.demos)}</td><td style="text-align:center;">${fmtNum(cg.totalRow.areaHa, 2)}</td><td style="text-align:center;">${fmtInt(cg.totalRow.farmers)}</td>${detailCells(cg.totalRow)}</tr>`;
        }
    }
    if (!body) body = `<tr><td colspan="${totalColCount}" style="text-align:center;">No data</td></tr>`;

    return `<table class="data-table report-fit" style="font-size:${fs}pt;">
        <thead>
            <tr>
                <th rowspan="2">Crop</th>
                <th rowspan="2">States</th>
                <th rowspan="2" style="text-align:center;">No of Demonstration</th>
                <th rowspan="2" style="text-align:center;">Area (ha)</th>
                <th rowspan="2" style="text-align:center;">No of Farmers</th>
                ${columnGroups.map((group) => `<th colspan="${group.columns.length}" style="text-align:center;">${esc(group.label)}</th>`).join('')}
            </tr>
            <tr>
                ${columns.map((col) => `<th style="text-align:center;">${esc(col.label)}</th>`).join('')}
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>`;
}

function renderDetails(ctx, sectionB, yearLabel) {
    const esc = (v) => ctx._escapeHtml(v);
    if (!sectionB || sectionB.length === 0) return '<p class="no-data">No data.</p>';
    let out = '';
    for (const cat of sectionB) {
        out += `<h3 class="about-kvk-subheading" style="margin-top:12px;">Details of Front-Line Demonstration on ${esc(cat.categoryName)}</h3>`;
        out += renderDetailTable(ctx, cat.cropGroups || [], cat);
    }
    out += `<p style="font-size:7pt;color:#555;margin-top:6px;">* Economics worked out on total cost of production per unit area, not on critical inputs alone.&nbsp;&nbsp;** BCR = Gross Return / Gross Cost.</p>`;
    return out;
}

// ── Section entry ────────────────────────────────────────────────────
function renderFldStateCategoryReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveFldStateCategoryPayload(data);
    const sectionA = payload.sectionA || { sectors: [], stateRows: [], totalRow: null };
    const sectionB = payload.sectionB || [];
    const yearLabel = payload.yearLabel || '';

    const hasData = (sectionA.sectors && sectionA.sectors.length) || sectionB.length;
    if (!hasData) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const yr = yearLabel ? ` for ${this._escapeHtml(yearLabel)}` : '';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:8px;">${section.id} ${this._escapeHtml(section.title)}</h1>

    <h2 class="section-subtitle">${section.id}.A FLD Summary</h2>
    ${renderSummary(this, sectionA)}

    <h2 class="section-subtitle" style="margin-top:14px;">${section.id}.B State wise details of Front-Line Demonstration${yr}</h2>
    ${renderStateWise(this, sectionA, yearLabel)}

    <h2 class="section-subtitle" style="margin-top:14px;">${section.id}.C Details of Front-Line Demonstration${yr}</h2>
    ${renderDetails(this, sectionB, yearLabel)}
</div>`;
}

module.exports = { renderFldStateCategoryReportSection };
