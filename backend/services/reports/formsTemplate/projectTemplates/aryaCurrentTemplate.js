function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function renderAryaCurrentSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map(row => `
        <tr>
            <td class="l">${esc(row.enterpriseName || '-')}</td>
            <td>${num(row.trainingsConducted)}</td>
            <td>${num(row.unitsMale)}</td>
            <td>${num(row.unitsFemale)}</td>
            <td>${num(row.youthMale)}</td>
            <td>${num(row.youthFemale)}</td>
            <td>${num(row.viableUnits)}</td>
            <td>${num(row.closedUnits)}</td>
            <td>${num(row.avgSizeOfUnit)}</td>
            <td>${num(row.totalProductionPerYear)}</td>
            <td>${num(row.perUnitCostOfProduction)}</td>
            <td>${num(row.saleValueOfProduce)}</td>
            <td>${num(row.economicGainsPerUnit)}</td>
            <td>${num(row.employmentGeneratedMandays)}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <style>
      .arya-current-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 6.6pt; line-height: 1.2; }
      .arya-current-table th, .arya-current-table td { border: 0.2px solid #000; padding: 2px 3px; vertical-align: middle; word-break: break-word; text-align: center; }
      .arya-current-table thead th { background: #fff; font-weight: bold; }
      .arya-current-table td.l { text-align: left; }
    </style>
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="arya-current-table">
        <thead>
            <tr>
                <th rowspan="2">Name of Enterprise</th>
                <th rowspan="2">No. of Training conducted</th>
                <th colspan="2">No. of entrepreneurial units established (Progressive)</th>
                <th colspan="2">No. of rural youth trained</th>
                <th rowspan="2">Viable units (functional units)</th>
                <th rowspan="2">Closed units (non functional)</th>
                <th rowspan="2">Average size of each entrepreneurial unit</th>
                <th rowspan="2">Total Production/unit/year</th>
                <th rowspan="2">Per unit cost of Production</th>
                <th rowspan="2">Sale value of produce</th>
                <th rowspan="2">Economic Gains / unit</th>
                <th rowspan="2">Employment generated (mandays)</th>
            </tr>
            <tr>
                <th>Male</th><th>Female</th>
                <th>Male</th><th>Female</th>
            </tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>
</div>`;
}

module.exports = { renderAryaCurrentSection };
