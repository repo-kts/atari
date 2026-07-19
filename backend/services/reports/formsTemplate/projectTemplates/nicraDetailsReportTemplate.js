function esc(ctx, t) {
    return ctx._escapeHtml(t === null || t === undefined ? '' : t);
}

function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function fmtNum(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function fmtInt(v) {
    return String(Math.round(toNum(v)));
}

function titleCaseMonth(m) {
    const s = String(m || '').trim();
    if (!s) return '—';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

const FARMER_KEYS = ['generalM', 'generalF', 'obcM', 'obcF', 'scM', 'scF', 'stM', 'stF'];

function normalizeRecord(r) {
    const categoryName = (r.category && r.category.categoryName)
        || r.categoryName || r.categoryOther || '—';
    const subCategoryName = (r.subCategory && r.subCategory.subCategoryName)
        || r.subCategoryName || '—';
    const seasonName = (r.season && r.season.seasonName) || r.seasonName || '—';
    const kvkName = (r.kvk && r.kvk.kvkName) || r.kvkName || 'Unknown KVK';
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName)
        || r.stateName || 'Unknown';
    const f = {};
    for (const k of FARMER_KEYS) f[k] = toNum(r[k]);
    return {
        kvkName,
        stateName,
        category: categoryName,
        subCategory: subCategoryName,
        crop: r.cropName || '—',
        season: seasonName,
        month: titleCaseMonth(r.month),
        technology: r.technologyDemonstrated || '—',
        areaOrUnit: r.areaOrUnit,
        yield: r.yield,
        ...f,
        farmers: FARMER_KEYS.reduce((s, k) => s + f[k], 0),
        grossCost: r.grossCost,
        grossReturn: r.grossReturn,
        netReturn: r.netReturn,
        bcrRatio: r.bcrRatio,
    };
}

function tableCss() {
    return `
  .nic-wrap { width:100%; font-size:5.5pt; line-height:1.12; }
  .nic-sec { font-size:8pt; font-weight:bold; margin:0 0 6px 0; }
  .nic-kvk-hd { font-size:7pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
  .nic-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:6px; page-break-inside:avoid; }
  .nic-tbl th, .nic-tbl td { border:0.35pt solid #000; padding:1px 2px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .nic-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .nic-tbl .l { text-align:left; }
  .nic-tbl .c { text-align:center; }
  .nic-tbl .sub td { font-weight:bold; background:#f1f5f9; }
  .nic-tbl .grand td { font-weight:bold; background:#f5f5f5; }
`;
}




function totalsCells(t) {
    return `
        <td class="c">${fmtInt(t.generalM)}</td><td class="c">${fmtInt(t.generalF)}</td>
        <td class="c">${fmtInt(t.obcM)}</td><td class="c">${fmtInt(t.obcF)}</td>
        <td class="c">${fmtInt(t.scM)}</td><td class="c">${fmtInt(t.scF)}</td>
        <td class="c">${fmtInt(t.stM)}</td><td class="c">${fmtInt(t.stF)}</td>
        <td class="c">${fmtInt(t.farmers)}</td>
        <td class="c">${fmtNum(t.grossCost)}</td>
        <td class="c">${fmtNum(t.grossReturn)}</td>
        <td class="c">${fmtNum(t.netReturn)}</td>
        <td></td>`;
}

function sumGroup(rows) {
    const t = { farmers: 0, grossCost: 0, grossReturn: 0, netReturn: 0 };
    for (const k of FARMER_KEYS) t[k] = 0;
    for (const r of rows) {
        for (const k of FARMER_KEYS) t[k] += toNum(r[k]);
        t.farmers += toNum(r.farmers);
        t.grossCost += toNum(r.grossCost);
        t.grossReturn += toNum(r.grossReturn);
        t.netReturn += toNum(r.netReturn);
    }
    return t;
}


// ── KVK view: Category → Sub-category nested sub-tables ─────────────────────
// Columns drop Category/Sub-category (they become headings).
function nestedColGroup() {
    return `
  <colgroup>
    <col style="width:3%" />
    <col style="width:9%" /><col style="width:6%" /><col style="width:5%" />
    <col style="width:13%" /><col style="width:5%" /><col style="width:5%" />
    <col style="width:3%" /><col style="width:3%" /><col style="width:3%" /><col style="width:3%" />
    <col style="width:3%" /><col style="width:3%" /><col style="width:3%" /><col style="width:3%" /><col style="width:3.5%" />
    <col style="width:6%" /><col style="width:6%" /><col style="width:6%" /><col style="width:4%" />
  </colgroup>`;
}

function nestedHeadRows() {
    return `
      <thead>
        <tr>
          <th rowspan="2">S.No</th>
          <th rowspan="2" class="l">Crop</th>
          <th rowspan="2">Season</th>
          <th rowspan="2">Month</th>
          <th rowspan="2" class="l">Technology demonstrated</th>
          <th rowspan="2">Area / Unit</th>
          <th rowspan="2">Yield</th>
          <th colspan="9">No. of farmers benefitted</th>
          <th rowspan="2">Gross cost</th>
          <th rowspan="2">Gross return</th>
          <th rowspan="2">Net return</th>
          <th rowspan="2">BCR</th>
        </tr>
        <tr>
          <th>Gen M</th><th>Gen F</th>
          <th>OBC M</th><th>OBC F</th>
          <th>SC M</th><th>SC F</th>
          <th>ST M</th><th>ST F</th>
          <th>Total</th>
        </tr>
      </thead>`;
}

function nestedBodyRow(ctx, r, sno) {
    return `
      <tr>
        <td class="c">${sno}</td>
        <td class="l">${esc(ctx, r.crop)}</td>
        <td class="c">${esc(ctx, r.season)}</td>
        <td class="c">${esc(ctx, r.month)}</td>
        <td class="l">${esc(ctx, r.technology)}</td>
        <td class="c">${fmtNum(r.areaOrUnit)}</td>
        <td class="c">${fmtNum(r.yield)}</td>
        <td class="c">${fmtInt(r.generalM)}</td><td class="c">${fmtInt(r.generalF)}</td>
        <td class="c">${fmtInt(r.obcM)}</td><td class="c">${fmtInt(r.obcF)}</td>
        <td class="c">${fmtInt(r.scM)}</td><td class="c">${fmtInt(r.scF)}</td>
        <td class="c">${fmtInt(r.stM)}</td><td class="c">${fmtInt(r.stF)}</td>
        <td class="c">${fmtInt(r.farmers)}</td>
        <td class="c">${fmtNum(r.grossCost)}</td>
        <td class="c">${fmtNum(r.grossReturn)}</td>
        <td class="c">${fmtNum(r.netReturn)}</td>
        <td class="c">${fmtNum(r.bcrRatio)}</td>
      </tr>`;
}

function nestedTotalRow(label, rows) {
    const t = sumGroup(rows);
    return `
      <tr class="sub">
        <td class="l" colspan="7">${label}</td>
        ${totalsCells(t)}
      </tr>`;
}

function groupBy(records, keyFn) {
    const m = new Map();
    for (const r of records) {
        const k = keyFn(r);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(r);
    }
    return m;
}

function renderKvkCategoryNested(ctx, records) {
    const byCategory = groupBy(records, (r) => r.category || '—');
    return [...byCategory.keys()].sort(sortStr).map((catName) => {
        const catRows = byCategory.get(catName);
        const bySub = groupBy(catRows, (r) => r.subCategory || '—');
        const subTables = [...bySub.keys()].sort(sortStr).map((subName) => {
            const subRows = bySub.get(subName);
            const body = subRows.map((r, i) => nestedBodyRow(ctx, r, i + 1)).join('');
            return `
    <div class="nic-sub-hd">${esc(ctx, subName)}</div>
    <table class="nic-tbl">${nestedColGroup()}${nestedHeadRows()}
      <tbody>${body}${nestedTotalRow(`Sub-total — ${esc(ctx, subName)}`, subRows)}</tbody>
    </table>`;
        }).join('');
        return `
    <div class="nic-cat-hd">${esc(ctx, catName)}</div>
    ${subTables}
    <table class="nic-tbl">${nestedColGroup()}
      <tbody>${nestedTotalRow(`Total — ${esc(ctx, catName)}`, catRows)}</tbody>
    </table>`;
    }).join('');
}

// ── Superadmin view: state-wise, Category → Sub-category ─────────────────────
// Per state: Farmers, Area/Unit, Net return (+ a Total group).
function metric3(r) {
    return { farmers: toNum(r.farmers), area: toNum(r.areaOrUnit), net: toNum(r.netReturn) };
}
function emptyM3() { return { farmers: 0, area: 0, net: 0 }; }
function accM3(t, s) { t.farmers += s.farmers; t.area += s.area; t.net += s.net; }
function m3Cells(m) {
    return `<td class="c">${fmtInt(m.farmers)}</td><td class="c">${fmtNum(m.area)}</td><td class="c">${fmtNum(m.net)}</td>`;
}

function renderDetailsStateView(ctx, section, sectionId, isFirstSection, records) {
    const stateSet = new Set();
    // category -> subCategory -> state -> metric
    const catMap = new Map();
    for (const r of records) {
        const st = r.stateName || 'Unknown';
        stateSet.add(st);
        const cat = r.category || '—';
        const sub = r.subCategory || '—';
        if (!catMap.has(cat)) catMap.set(cat, new Map());
        const subMap = catMap.get(cat);
        if (!subMap.has(sub)) subMap.set(sub, new Map());
        const stMap = subMap.get(sub);
        if (!stMap.has(st)) stMap.set(st, emptyM3());
        accM3(stMap.get(st), metric3(r));
    }
    const states = [...stateSet].sort(sortStr);
    const categories = [...catMap.keys()].sort(sortStr);

    const metricSub = () => `<th>Farmers</th><th>Area/Unit</th><th>Net return</th>`;
    const head = `
      <thead>
        <tr>
          <th rowspan="2" class="l">Category</th>
          <th rowspan="2" class="l">Sub-category</th>
          ${states.map((s) => `<th colspan="3">${esc(ctx, s)}</th>`).join('')}
          <th colspan="3">Total</th>
        </tr>
        <tr>
          ${states.map(() => metricSub()).join('')}
          ${metricSub()}
        </tr>
      </thead>`;

    const bodyGroups = categories.map((cat) => {
        const subMap = catMap.get(cat);
        const subs = [...subMap.keys()].sort(sortStr);
        const catByState = new Map(states.map((s) => [s, emptyM3()]));
        const catTotal = emptyM3();
        const subRows = subs.map((sub, idx) => {
            const stMap = subMap.get(sub);
            const rowTotal = emptyM3();
            const cells = states.map((st) => {
                const m = stMap.get(st) || emptyM3();
                accM3(catByState.get(st), m);
                accM3(rowTotal, m);
                return m3Cells(m);
            }).join('');
            accM3(catTotal, rowTotal);
            return `
      <tr>
        ${idx === 0 ? `<td class="l" rowspan="${subs.length + 1}">${esc(ctx, cat)}</td>` : ''}
        <td class="l">${esc(ctx, sub)}</td>
        ${cells}
        ${m3Cells(rowTotal)}
      </tr>`;
        }).join('');
        const catTotalRow = `
      <tr class="sub">
        <td class="l">Total</td>
        ${states.map((st) => m3Cells(catByState.get(st))).join('')}
        ${m3Cells(catTotal)}
      </tr>`;
        return subRows + catTotalRow;
    }).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nic-wrap">
    <div class="nic-sec">${ctx._escapeHtml(section.id)} ${ctx._escapeHtml(section.title)} — state-wise by category</div>
    <table class="nic-tbl">${head}<tbody>${bodyGroups}</tbody></table>
  </div>
</div>`;
}

function renderNicraDetailsReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const records = rows.map((r) => normalizeRecord(r));

    if (records.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No NICRA details data for export.</p>
</div>`;
    }

    if (reportContext.isAggregatedView) {
        return renderDetailsStateView(this, section, sectionId, isFirstSection, records);
    }

    // KVK view: group by KVK, and within each KVK nest Category → Sub-category.
    const byKvk = new Map();
    for (const r of records) {
        if (!byKvk.has(r.kvkName)) byKvk.set(r.kvkName, []);
        byKvk.get(r.kvkName).push(r);
    }
    const kvkNames = [...byKvk.keys()].sort(sortStr);
    const isMultiKvk = kvkNames.length > 1;

    const groupsHtml = kvkNames.map((kvk) => `
    ${isMultiKvk ? `<h2 class="nic-kvk-hd">KVK: ${esc(this, kvk)}</h2>` : ''}
    ${renderKvkCategoryNested(this, byKvk.get(kvk))}`).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}
    .nic-cat-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:8px 0 2px 0; page-break-after:avoid; break-after:avoid; }
    .nic-sub-hd { font-size:6.8pt; font-weight:bold; background:#eef2f7; padding:2px 5px; border:0.35pt solid #000; border-bottom:0; margin:4px 0 0 0; page-break-after:avoid; break-after:avoid; }
  </style>
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <div class="nic-wrap">
    <div class="nic-sec">NICRA — Details of demonstrations / interventions</div>
    ${groupsHtml}
  </div>
</div>`;
}

module.exports = {
    renderNicraDetailsReportSection,
};
