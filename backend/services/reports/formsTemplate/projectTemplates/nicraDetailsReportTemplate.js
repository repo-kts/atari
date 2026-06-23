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
    const f = {};
    for (const k of FARMER_KEYS) f[k] = toNum(r[k]);
    return {
        kvkName,
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

function colGroup() {
    return `
  <colgroup>
    <col style="width:2.5%" />
    <col style="width:6%" /><col style="width:8%" />
    <col style="width:6%" /><col style="width:5%" /><col style="width:5%" />
    <col style="width:11%" /><col style="width:4%" /><col style="width:4%" />
    <col style="width:2.6%" /><col style="width:2.6%" /><col style="width:2.6%" /><col style="width:2.6%" />
    <col style="width:2.6%" /><col style="width:2.6%" /><col style="width:2.6%" /><col style="width:2.6%" /><col style="width:3%" />
    <col style="width:6%" /><col style="width:6%" /><col style="width:6%" /><col style="width:4%" />
  </colgroup>`;
}

function headRows() {
    return `
      <thead>
        <tr>
          <th rowspan="2">S.No</th>
          <th rowspan="2" class="l">Category</th>
          <th rowspan="2" class="l">Sub-category</th>
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

function bodyRow(ctx, r, sno) {
    return `
      <tr>
        <td class="c">${sno}</td>
        <td class="l">${esc(ctx, r.category)}</td>
        <td class="l">${esc(ctx, r.subCategory)}</td>
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

function renderGroup(ctx, kvkName, rows) {
    const body = rows.map((r, i) => bodyRow(ctx, r, i + 1)).join('');
    const sub = sumGroup(rows);
    const subRow = `
      <tr class="sub">
        <td class="l" colspan="9">Sub-total — ${esc(ctx, kvkName)} (${rows.length} record${rows.length === 1 ? '' : 's'})</td>
        ${totalsCells(sub)}
      </tr>`;
    return `
    <h2 class="nic-kvk-hd">KVK: ${esc(ctx, kvkName)}</h2>
    <table class="nic-tbl">${colGroup()}${headRows()}
      <tbody>${body}${subRow}</tbody>
    </table>`;
}

function renderNicraDetailsReportSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const records = rows.map((r) => normalizeRecord(r));

    if (records.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No NICRA details data for export.</p>
</div>`;
    }

    const byKvk = new Map();
    for (const r of records) {
        if (!byKvk.has(r.kvkName)) byKvk.set(r.kvkName, []);
        byKvk.get(r.kvkName).push(r);
    }
    const kvkNames = [...byKvk.keys()].sort(sortStr);
    const isMultiKvk = kvkNames.length > 1;

    const groupsHtml = kvkNames.map((kvk) => renderGroup(this, kvk, byKvk.get(kvk))).join('');

    const grandHtml = isMultiKvk
        ? `
    <table class="nic-tbl">${colGroup()}
      <tbody>
        <tr class="grand">
          <td class="l" colspan="9">Grand Total (all KVKs) — ${records.length} records</td>
          ${totalsCells(sumGroup(records))}
        </tr>
      </tbody>
    </table>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nic-wrap">
    <div class="nic-sec">NICRA — Details of demonstrations / interventions</div>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderNicraDetailsReportSection,
};
