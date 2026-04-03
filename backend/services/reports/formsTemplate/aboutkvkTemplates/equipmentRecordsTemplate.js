function renderEquipmentRecordsSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const records = Array.isArray(data) ? data : [data];
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const normalizeDisplay = (value, { isYear = false } = {}) => {
        if (value === null || value === undefined || value === '') return '-';

        if (value instanceof Date) {
            return isYear ? String(value.getUTCFullYear()) : value.toISOString();
        }

        if (typeof value === 'object') {
            const nested = this._pickValue(value, ['yearName', 'year', 'value', 'label', 'name']);
            if (nested !== null && nested !== undefined && nested !== '') return normalizeDisplay(nested, { isYear });
            return '-';
        }

        if (isYear) {
            if (typeof value === 'string') {
                const yearOnly = value.match(/^\d{4}$/);
                if (yearOnly) return yearOnly[0];
                const dateLike = new Date(value);
                if (!Number.isNaN(dateLike.getTime())) return String(dateLike.getUTCFullYear());
            }
            if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        }

        return String(value);
    };

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th class="s-no">Sl. No.</th>
                <th>Year</th>
                <th>KVK</th>
                <th>Equipment Name</th>
                <th>Year of purchase</th>
                <th>Cost (Rs.)</th>
                <th>Source of fund</th>
                <th>Present status</th>
            </tr>
        </thead>
        <tbody>`;

    records.forEach((row, index) => {
        const year = normalizeDisplay(this._pickValue(row, ['Year', 'reportingYear']), { isYear: true });
        const kvk = normalizeDisplay(this._pickValue(row, ['KVK', 'kvk.kvkName', 'kvkName']));
        const equipmentName = normalizeDisplay(this._pickValue(row, ['Equipment Name', 'equipmentName']));
        const yearOfPurchase = normalizeDisplay(this._pickValue(row, ['Year of purchase', 'yearOfPurchase']));
        const cost = normalizeDisplay(this._pickValue(row, ['Cost (Rs.)', 'totalCost']));
        const sourceOfFund = normalizeDisplay(this._pickValue(row, ['Source of fund', 'sourceOfFunding']));
        const presentStatus = normalizeDisplay(this._pickValue(row, ['Present status', 'presentStatus']));

        html += `
            <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${index + 1}</td>
                <td>${this._escapeHtml(year)}</td>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(equipmentName)}</td>
                <td>${this._escapeHtml(yearOfPurchase)}</td>
                <td>${this._escapeHtml(cost)}</td>
                <td>${this._escapeHtml(sourceOfFund)}</td>
                <td>${this._escapeHtml(presentStatus)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = {
    renderEquipmentRecordsSection,
};
