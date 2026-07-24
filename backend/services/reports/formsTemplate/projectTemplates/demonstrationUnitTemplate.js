/**
 * Demonstration Unit Template
 * Handles rendering the Performance of Demonstration Units section (Section 10.8)
 * BLA-50 layout: master-backed name, establishment details, area and status.
 */

function renderDemonstrationUnitTable(ctx, records, showKvkColumn) {
    // In the aggregated (Superadmin) view, prepend a merged "Name of KVK"
    // column: sort A-Z by KVK name and collapse consecutive rows of the same
    // KVK into a single rowspan cell so each KVK appears once for its group.
    // Within each KVK group, order the demo units alphabetically by name.
    const orderedRecords = showKvkColumn
        ? [...records].sort((a, b) =>
            (a.kvkName || '').localeCompare(b.kvkName || '', undefined, { sensitivity: 'base' })
            || (a.demoUnitName || '').localeCompare(b.demoUnitName || '', undefined, { sensitivity: 'base' }))
        : [...records].sort((a, b) =>
            (a.demoUnitName || '').localeCompare(b.demoUnitName || '', undefined, { sensitivity: 'base' }));

    const headers = `
        <tr>
            <th style="width: 40px;">Sr.No.</th>
            ${showKvkColumn ? '<th>Name of KVK</th>' : ''}
            <th>Name of Demo Unit</th>
            <th>Year of Estt.</th>
            <th>Area (Sq. mt)</th>
            <th>Status</th>
        </tr>`;

    const rows = orderedRecords.map((record, index) => {
        let kvkCell = '';
        if (showKvkColumn) {
            const isGroupStart = index === 0
                || orderedRecords[index - 1].kvkName !== record.kvkName;
            if (isGroupStart) {
                let span = 1;
                while (index + span < orderedRecords.length
                    && orderedRecords[index + span].kvkName === record.kvkName) {
                    span++;
                }
                kvkCell = `<td rowspan="${span}">${ctx._escapeHtml(record.kvkName)}</td>`;
            }
        }

        return `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            ${kvkCell}
            <td>${ctx._escapeHtml(record.demoUnitName)}</td>
            <td style="text-align: center;">${record.yearOfEstablishment}</td>
            <td style="text-align: center;">${record.area}</td>
            <td>${ctx._escapeHtml(record.status)}</td>
        </tr>`;
    }).join('');

    return `
    <table class="data-table report-fit" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 7pt;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderDemonstrationUnitSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const showKvkColumn = !!reportContext.isAggregatedView;

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="font-size: 16px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px; font-size: 14px;">Performance of Demonstration Units(Other than Instructional Farm)</h2>
    <div style="overflow-x: auto;">
        ${renderDemonstrationUnitTable(this, records, showKvkColumn)}
    </div>
</div>`;
}

module.exports = {
    renderDemonstrationUnitSection,
};
