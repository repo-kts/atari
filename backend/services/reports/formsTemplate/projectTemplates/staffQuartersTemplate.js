/**
 * Staff Quarters Utilization Template
 * Handles rendering the Staff Quarters (Section 10.13) section
 * Title: "Utilization of Staff Quarters Whether Staff Quarters has been Completed"
 *
 * Layout (per KVK record):
 *   1. A summary row table: KVK | Date of Completion | No.of Staff Quarters | Occupancy Details
 *   2. Directly below it, a Month × Quarter grid showing the occupancy values
 *      exactly as entered in the form (Yes / No / blank), instead of a single
 *      comma-separated "Months" column.
 *
 * occupancyData JSON structure (flat map stored by form):
 * {
 *   "occupancy_january_quarter_1": "Yes",
 *   "occupancy_january_quarter_2": "No",
 *   ...
 *   "occupancy_december_quarter_6": "Yes"
 * }
 *
 * This template is shared by two callers with slightly different record shapes:
 *   - Reports (all-reports / super-admin): occupancyData is a parsed object and
 *     kvkName sits at the top level.
 *   - Module form export (DataManagementView): occupancyData is the raw JSON
 *     string straight from the DB and the name is nested under kvk.kvkName.
 * The helpers below normalise both.
 */

const MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const QUARTER_ORDER = [
    'quarter_1', 'quarter_2', 'quarter_3', 'quarter_4', 'quarter_5', 'quarter_6'
];
const QUARTER_LABELS = [
    'Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4', 'Quarter 5', 'Quarter 6'
];

/**
 * Safe date formatter — handles both ISO strings and Date objects
 */
function formatDate(val) {
    if (!val) return '-';
    try {
        const isoStr = val instanceof Date ? val.toISOString() : String(val);
        const datePart = isoStr.split('T')[0];
        if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    } catch { /* ignore */ }
    return String(val);
}

/**
 * Normalise occupancyData into a plain flat-map object.
 * Accepts a parsed object (reports) or a JSON string (module export).
 */
function parseOccupancyData(occupancyData) {
    if (!occupancyData) return null;
    if (typeof occupancyData === 'string') {
        try {
            const parsed = JSON.parse(occupancyData);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }
    if (typeof occupancyData === 'object' && !Array.isArray(occupancyData)) {
        return occupancyData;
    }
    return null;
}

/**
 * Resolve the KVK name from either record shape.
 */
function resolveKvkName(record) {
    return record.kvkName || (record.kvk && record.kvk.kvkName) || '-';
}

/**
 * Render the Month × Quarter occupancy grid for a single record.
 * Empty cells render blank (matching the form's "Select" placeholder).
 */
// Ultra-compact cell styling: minimal vertical padding + tight line-height so the
// grid stays short while still showing every value; width stays full.
const GRID_CELL = 'padding: 0px 4px; line-height: 1.1;';

function renderOccupancyGrid(ctx, occupancyData) {
    const headerCells = QUARTER_LABELS
        .map((label) => `<th style="text-align: center; ${GRID_CELL}">${label}</th>`)
        .join('');

    const bodyRows = MONTH_ORDER.map((month) => {
        const monthKey = month.toLowerCase();
        const cells = QUARTER_ORDER.map((q) => {
            const key = `occupancy_${monthKey}_${q}`;
            const value = occupancyData && occupancyData[key] !== undefined ? occupancyData[key] : '';
            return `<td style="text-align: center; ${GRID_CELL}">${ctx._escapeHtml(value || '')}</td>`;
        }).join('');
        return `<tr><td style="${GRID_CELL}"><strong>${month}</strong></td>${cells}</tr>`;
    }).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 8pt; line-height: 1.1;">
        <thead>
            <tr>
                <th style="text-align: left; ${GRID_CELL}">Month</th>
                ${headerCells}
            </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
    </table>`;
}

/**
 * Render one KVK record: a summary row followed by its occupancy grid.
 */
function renderStaffQuartersRecord(ctx, record) {
    const kvkName = resolveKvkName(record);
    const dateStr = formatDate(record.dateOfCompletion);
    const numberOfQuarters = record.numberOfQuarters !== undefined && record.numberOfQuarters !== null
        ? record.numberOfQuarters
        : 0;
    const occupancyDetails = record.occupancyDetails || '-';
    const occupancyData = parseOccupancyData(record.occupancyData);

    const summaryTable = `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 8pt; line-height: 1.1;">
        <thead>
            <tr>
                <th style="${GRID_CELL}">KVK</th>
                <th style="${GRID_CELL}">Date of Completion</th>
                <th style="${GRID_CELL}">No.of Staff Quarters</th>
                <th style="${GRID_CELL}">Occupancy Details</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="${GRID_CELL}">${ctx._escapeHtml(kvkName)}</td>
                <td style="white-space: nowrap; ${GRID_CELL}">${ctx._escapeHtml(dateStr)}</td>
                <td style="text-align: center; ${GRID_CELL}">${ctx._escapeHtml(String(numberOfQuarters))}</td>
                <td style="${GRID_CELL}">${ctx._escapeHtml(occupancyDetails)}</td>
            </tr>
        </tbody>
    </table>`;

    return `
    <div style="margin-bottom: 12px; page-break-inside: avoid;">
        ${summaryTable}
        ${renderOccupancyGrid(ctx, occupancyData)}
    </div>`;
}

function renderStaffQuartersUtilizationSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const recordsHtml = records.map((record) => renderStaffQuartersRecord(this, record)).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Utilization of Staff Quarters Whether Staff Quarters has been Completed</h2>
    <div style="overflow-x: auto;">
        ${recordsHtml}
    </div>
</div>`;
}

module.exports = {
    renderStaffQuartersUtilizationSection,
};
