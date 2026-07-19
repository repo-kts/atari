function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function tableCss() {
    return `
      .arya-current-wrap { width:100%; font-size:6.6pt; line-height:1.2; }
      .arya-current-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
      .arya-current-table { width:100%; table-layout:fixed; border-collapse:collapse; margin-bottom:6px; page-break-inside:avoid; }
      .arya-current-table th, .arya-current-table td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; word-break:break-word; overflow-wrap:anywhere; text-align:center; }
      .arya-current-table thead th { background:#e8e8e8; font-weight:bold; }
      .arya-current-table td.l { text-align:left; }
`;
}

function colGroup() {
    return `
      <colgroup>
        <col style="width:3%" />
        <col style="width:14%" />
        <col style="width:7%" />
        <col style="width:5%" /><col style="width:5%" />
        <col style="width:5%" /><col style="width:5%" />
        <col style="width:6%" /><col style="width:6%" />
        <col style="width:7%" /><col style="width:8%" />
        <col style="width:7%" /><col style="width:7%" />
        <col style="width:6%" /><col style="width:7%" />
      </colgroup>`;
}

function headRows() {
    return `
        <thead>
            <tr>
                <th rowspan="2">S.No</th>
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
        </thead>`;
}

function bodyRow(row, sno) {
    return `
        <tr>
            <td>${sno}</td>
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
        </tr>`;
}

function renderGroup(headerLabel, rows) {
    const body = rows.map((r, i) => bodyRow(r, i + 1)).join('');
    return `
    <h2 class="arya-current-kvk-hd">${esc(headerLabel)}</h2>
    <table class="arya-current-table">${colGroup()}${headRows()}
        <tbody>${body}</tbody>
    </table>`;
}

// Superadmin: one block per state; rows = enterprises summed across the state's
// KVKs (master-driven). No KVK breakdown.
function renderStateView(ctx, section, sectionId, isFirstSection, statePayload) {
    const states = statePayload.states || [];
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const blocks = states.map((s) => renderGroup(`State: ${s.stateName}`, s.enterprises)).join('');
    return `
<div id="${sectionId}" class="${pageClass}">
    <style>${tableCss()}</style>
    <div class="arya-current-wrap">
      <h1 class="section-title">${ctx._escapeHtml(section.id)} ${ctx._escapeHtml(section.title)}</h1>
      ${blocks}
    </div>
</div>`;
}

function renderAryaCurrentSection(section, data, sectionId, isFirstSection, reportContext = {}) {
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
        if (!byKvk.has(kvk)) byKvk.set(kvk, []);
        byKvk.get(kvk).push(r);
    }
    const kvkNames = [...byKvk.keys()].sort(sortStr);
    const groupsHtml = kvkNames.map((kvk) => renderGroup(`KVK: ${kvk}`, byKvk.get(kvk))).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <style>${tableCss()}</style>
    <div class="arya-current-wrap">
      <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
      ${groupsHtml}
    </div>
</div>`;
}

module.exports = { renderAryaCurrentSection };
