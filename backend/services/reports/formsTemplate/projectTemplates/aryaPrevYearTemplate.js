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

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function tableCss() {
    return `
      .arya-prev-wrap { width:100%; font-size:6.3pt; line-height:1.15; }
      .arya-prev-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
      .arya-prev-table { width:100%; table-layout:fixed; border-collapse:collapse; margin-bottom:6px; page-break-inside:avoid; }
      .arya-prev-table th, .arya-prev-table td { border:0.35pt solid #000; padding:2px 3px; word-break:break-word; overflow-wrap:anywhere; text-align:center; vertical-align:middle; }
      .arya-prev-table thead th { background:#e8e8e8; font-weight:bold; }
      .arya-prev-table td.l { text-align:left; }
`;
}

function colGroup() {
    return `
      <colgroup>
        <col style="width:3%" />
        <col style="width:11%" />
        <col style="width:4%" /><col style="width:4%" />
        <col style="width:5%" /><col style="width:5%" />
        <col style="width:5%" /><col style="width:5%" />
        <col style="width:4%" /><col style="width:5%" />
        <col style="width:5%" /><col style="width:5%" /><col style="width:5%" /><col style="width:5%" /><col style="width:5%" /><col style="width:5%" />
        <col style="width:4%" /><col style="width:4%" /><col style="width:4%" />
        <col style="width:5%" />
      </colgroup>`;
}

function headRows() {
    return `
      <thead>
        <tr>
          <th rowspan="2">Sl. No</th>
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
      </thead>`;
}

function bodyRow(row, sno) {
    return `
        <tr>
            <td>${sno}</td>
            <td class="l">${esc(row.enterpriseName || '-')}</td>
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
        </tr>`;
}

function renderGroup(kvkName, stateName, rows) {
    const body = rows.map((r, i) => bodyRow(r, i + 1)).join('');
    const label = stateName ? `KVK: ${esc(kvkName)} — ${esc(stateName)}` : `KVK: ${esc(kvkName)}`;
    return `
    <h2 class="arya-prev-kvk-hd">${label}</h2>
    <table class="arya-prev-table">${colGroup()}${headRows()}
      <tbody>${body}</tbody>
    </table>`;
}

// ── Superadmin state view: date columns dropped (can't aggregate) ───────────
function stateColGroup() {
    return `
      <colgroup>
        <col style="width:3%" />
        <col style="width:12%" />
        <col style="width:4%" /><col style="width:4%" />
        <col style="width:6%" /><col style="width:6%" />
        <col style="width:5%" /><col style="width:6%" />
        <col style="width:6%" /><col style="width:6%" /><col style="width:7%" /><col style="width:6%" /><col style="width:6%" /><col style="width:6%" />
        <col style="width:4%" /><col style="width:5%" /><col style="width:4%" />
        <col style="width:4%" />
      </colgroup>`;
}

function stateHeadRows() {
    return `
      <thead>
        <tr>
          <th rowspan="2">Sl. No</th>
          <th rowspan="2">Name of Enterprise</th>
          <th colspan="2">No. of entrepreneurial units established (up to previous year progressive)</th>
          <th rowspan="2">No. of non-functional entrepreneurial unit closed</th>
          <th rowspan="2">No. of non-functional entrepreneurial unit restarted (i.e. previously closed)</th>
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
      </thead>`;
}

function stateBodyRow(row, sno) {
    return `
        <tr>
            <td>${sno}</td>
            <td class="l">${esc(row.enterpriseName || '-')}</td>
            <td>${num(row.unitsMale)}</td>
            <td>${num(row.unitsFemale)}</td>
            <td>${num(row.nonFunctionalUnitsClosed)}</td>
            <td>${num(row.nonFunctionalUnitsRestarted)}</td>
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
        </tr>`;
}

function renderStateView(ctx, section, sectionId, isFirstSection, statePayload) {
    const states = statePayload.states || [];
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const blocks = states.map((s) => {
        const body = s.enterprises.map((r, i) => stateBodyRow(r, i + 1)).join('');
        return `
    <h2 class="arya-prev-kvk-hd">State: ${esc(s.stateName)}</h2>
    <table class="arya-prev-table">${stateColGroup()}${stateHeadRows()}
      <tbody>${body}</tbody>
    </table>`;
    }).join('');
    return `
<div id="${sectionId}" class="${pageClass}">
    <style>${tableCss()}</style>
    <div class="arya-prev-wrap">
      <h1 class="section-title">${ctx._escapeHtml(section.id)} ${ctx._escapeHtml(section.title)}</h1>
      ${blocks}
    </div>
</div>`;
}

function renderAryaPrevYearSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    if (reportContext.isAggregatedView && data && data.statePayload) {
        if (!data.statePayload.states || data.statePayload.states.length === 0) {
            return this._generateEmptySection(section, null, sectionId, isFirstSection);
        }
        return renderStateView(this, section, sectionId, isFirstSection, data.statePayload);
    }

    const rows = (data && Array.isArray(data.records))
        ? data.records
        : (Array.isArray(data) ? data : (data ? [data] : []));
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const byKvk = new Map();
    for (const r of rows) {
        const kvk = r.kvkName || 'Unknown KVK';
        if (!byKvk.has(kvk)) byKvk.set(kvk, { state: r.stateName || '', rows: [] });
        byKvk.get(kvk).rows.push(r);
    }
    const kvkNames = [...byKvk.keys()].sort(sortStr);
    const groupsHtml = kvkNames
        .map((kvk) => renderGroup(kvk, byKvk.get(kvk).state, byKvk.get(kvk).rows))
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <style>${tableCss()}</style>
    <div class="arya-prev-wrap">
      <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
      ${groupsHtml}
    </div>
</div>`;
}

module.exports = { renderAryaPrevYearSection };
