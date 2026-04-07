function getCellValueForField(row, field, context) {
    // Full-report data is transformed: keys are displayName values
    if (Object.prototype.hasOwnProperty.call(row, field.displayName)) {
        const v = row[field.displayName];
        if (v === null || v === undefined || v === '') {
            return '-';
        }
        return v;
    }
    // Standalone / raw API rows: read by dbField (supports nested paths e.g. kvk.kvkName)
    const raw = context._getNestedValue(row, field.dbField);
    if (raw !== null && raw !== undefined && raw !== '') {
        return raw;
    }
    return '-';
}

function renderSimpleTableSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const dataArray = Array.isArray(data) ? data : [data];
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const useFields = Array.isArray(section.fields) && section.fields.length > 0;
    let headers;
    if (useFields) {
        headers = section.fields.map((f) => f.displayName);
    } else {
        headers = Object.keys(dataArray[0] || {});
    }

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">S.No.</th>`;

    headers.forEach((header) => {
        html += `<th>${this._escapeHtml(header)}</th>`;
    });

    html += `
            </tr>
        </thead>
        <tbody>`;

    dataArray.forEach((row, index) => {
        html += `<tr class="${index % 2 === 0 ? 'even' : 'odd'}">`;
        html += `<td class="s-no">${index + 1}.</td>`;
        if (useFields) {
            section.fields.forEach((field) => {
                const cell = getCellValueForField(row, field, this);
                const text = cell !== null && cell !== undefined && cell !== '-'
                    ? this._escapeHtml(String(cell))
                    : '-';
                html += `<td>${text}</td>`;
            });
        } else {
            headers.forEach((header) => {
                const value = row[header];
                html += `<td>${value !== null && value !== undefined ? this._escapeHtml(String(value)) : '-'}</td>`;
            });
        }
        html += '</tr>';
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = {
    renderSimpleTableSection,
};
