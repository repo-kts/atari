/**
 * Staff Quarters Utilization Template
 * Handles rendering the Staff Quarters (Section 10.13) section
 * Title: "Utilization of Staff Quarters Whether Staff Quarters has been Completed"
 * Layout: Date of Completion | No. of Staff Quarters | Occupancy Details | Months
 *
 * occupancyData JSON structure (flat map stored by form):
 * {
 *   "occupancy_january_quarter_1": "Yes",
 *   "occupancy_january_quarter_2": "No",
 *   ...
 *   "occupancy_december_quarter_6": "Yes"
 * }
 * Months column renders as: "January - Yes,No,Yes,Yes,Yes,No" (6 quarter values per row)
 */

const MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const QUARTER_ORDER = [
    'quarter_1', 'quarter_2', 'quarter_3', 'quarter_4', 'quarter_5', 'quarter_6'
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
 * Format occupancyData flat-map into HTML list:
 * January - Yes,No,Yes,Yes,Yes,No
 */
function formatOccupancyData(occupancyData) {
    if (!occupancyData || typeof occupancyData !== 'object' || Array.isArray(occupancyData)) {
        return '-';
    }

    const lines = MONTH_ORDER.map(month => {
        const monthKey = month.toLowerCase();
        const values = QUARTER_ORDER.map(q => {
            const key = `occupancy_${monthKey}_${q}`;
            return occupancyData[key] !== undefined ? occupancyData[key] : '';
        });
        const joined = values.join(',');
        return `<strong>${month}</strong> - ${joined}`;
    });

    return lines.join('<br>');
}

function renderStaffQuartersTable(ctx, records) {
    const headers = `
        <tr>
            <th>Date of Completion</th>
            <th>No.of Staff Quarters</th>
            <th>Occupancy Details</th>
            <th>Months</th>
        </tr>`;

    const rows = records.map((record) => {
        const monthsHtml = record.occupancyData
            ? formatOccupancyData(record.occupancyData)
            : '-';

        // Use the safe date formatter (handles raw ISO from DB)
        const dateStr = formatDate(record.dateOfCompletion);

        return `
        <tr>
            <td style="white-space: nowrap;">${ctx._escapeHtml(dateStr)}</td>
            <td style="text-align: center;">${record.numberOfQuarters}</td>
            <td>${ctx._escapeHtml(record.occupancyDetails)}</td>
            <td style="font-size: 8pt; line-height: 1.8;">${monthsHtml}</td>
        </tr>`;
    }).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderStaffQuartersUtilizationSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Utilization of Staff Quarters Whether Staff Quarters has been Completed</h2>
    <div style="overflow-x: auto;">
        ${renderStaffQuartersTable(this, records)}
    </div>
</div>`;
}

module.exports = {
    renderStaffQuartersUtilizationSection,
};
