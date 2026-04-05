function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function fmtDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
}

function renderAryaPrevYearSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map((row, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${esc(row.stateName || '-')}</td>
            <td>${esc(row.kvkName || '-')}</td>
            <td>${esc(row.enterpriseName || '-')}</td>
            <td>${num(row.unitsMale)}</td>
            <td>${num(row.unitsFemale)}</td>
            <td>${num(row.nonFunctionalUnitsClosed)}</td>
            <td>${esc(fmtDate(row.dateOfClosing))}</td>
            <td>${num(row.nonFunctionalUnitsRestarted)}</td>
            <td>${esc(fmtDate(row.dateOfRestart))}</td>
            <td>${num(row.numberOfUnits)}</td>
            <td>${num(row.unitCapacity)}</td>
            <td>${num(row.fixedCost)}</td>
            <td>${num(row.variableCost)}</td>
            <td>${num(row.totalProductionPerUnitYear)}</td>
            <td>${num(row.grossCostPerUnitYear)}</td>
            <td>${num(row.grossReturnPerUnitYear)}</td>
            <td>${num(row.netBenefitPerUnitYear)}</td>
            <td>${num(row.employmentFamilyMandays)}</td>
            <td>${num(row.employmentOtherMandays)}</td>
            <td>${num(row.employmentTotalMandays)}</td>
            <td>${num(row.personsVisitedUnit)}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <style>
      .arya-prev-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 6.3pt; line-height: 1.15; }
      .arya-prev-table th, .arya-prev-table td { border: 0.2px solid #000; padding: 2px 3px; word-break: break-word; text-align: center; vertical-align: middle; }
      .arya-prev-table thead th { background: #fff; font-weight: bold; }
    </style>
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="arya-prev-table">
      <thead>
        <tr>
          <th rowspan="2">Sl. No</th>
          <th rowspan="2">State</th>
          <th rowspan="2">KVK</th>
          <th rowspan="2">Name of Enterprise</th>
          <th colspan="2">No. of entrepreneurial units established (up to previous year progressive)</th>
          <th rowspan="2">No. of non-functional entrepreneurial unit closed</th>
          <th rowspan="2">Date of Closing</th>
          <th rowspan="2">No. of non-functional entrepreneurial unit restarted (i.e. previously closed)</th>
          <th rowspan="2">Date of Restart</th>
          <th colspan="2">Entrepreneurial Unit Size (capacity per year)</th>
          <th colspan="6">Entrepreneurial Establishment Cost / unit</th>
          <th colspan="3">Employment generated/ year (mandays)</th>
          <th rowspan="2">No. of persons visited entrepreneur unit</th>
        </tr>
        <tr>
          <th>Male</th><th>Female</th>
          <th>No. of Unit</th><th>Unit capacity</th>
          <th>Fixed cost</th><th>Variable cost</th><th>Total production/unit/year</th><th>Gross cost of production/unit/year</th><th>Gross return per unit/year</th><th>Net benefit / unit/year</th>
          <th>Family</th><th>Other than Family</th><th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
</div>`;
}

module.exports = { renderAryaPrevYearSection };
