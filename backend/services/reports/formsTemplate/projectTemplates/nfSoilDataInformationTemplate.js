const { resolveSoilTemplatePayload, groupUnassignedSoilRowsByParameterName } = require('../../../../repositories/reports/naturalFarmingReport/soilDataReportRepository.js');

const PAGE_TITLE = 'Soil Data information';

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmt(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return esc(String(v));
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return String(Number(n.toFixed(4)));
}

function tableCss() {
    return `
  .nf-soil-wrap { width:100%; font-size:6.5pt; line-height:1.15; }
  .nf-soil-page-title { text-align:center; font-size:9pt; font-weight:bold; margin:0 0 10px 0; }
  .nf-soil-sub { font-size:7.5pt; font-weight:bold; margin:10px 0 4px 0; text-align:left; }
  .nf-soil-kvk-hd { font-size:8pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; margin:12px 0 2px 0; page-break-after:avoid; break-after:avoid; }
  .nf-soil-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:14px; page-break-inside:avoid; }
  .nf-soil-tbl th, .nf-soil-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-break:break-word; }
  .nf-soil-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .nf-soil-tbl .l { text-align:left; }
`;
}

function renderOneSoilTable(subtitle, rows) {
    const body = (rows && rows.length > 0)
        ? rows.map((r) => `
      <tr>
        <td>${esc(r.seasonName || '—')}</td>
        <td>${esc(r.crop || '—')}</td>
        <td>${fmt(r.phBefore)}</td>
        <td>${fmt(r.ecBefore)}</td>
        <td>${fmt(r.ocBefore)}</td>
        <td>${fmt(r.nBefore)}</td>
        <td>${fmt(r.pBefore)}</td>
        <td>${fmt(r.kBefore)}</td>
        <td>${fmt(r.soilMicrobesBefore)}</td>
        <td>${fmt(r.phAfter)}</td>
        <td>${fmt(r.ecAfter)}</td>
        <td>${fmt(r.ocAfter)}</td>
        <td>${fmt(r.nAfter)}</td>
        <td>${fmt(r.pAfter)}</td>
        <td>${fmt(r.kAfter)}</td>
        <td>${fmt(r.soilMicrobesAfter)}</td>
      </tr>`).join('')
        : `<tr><td colspan="16">${esc('No data')}</td></tr>`;

    return `
  <h3 class="nf-soil-sub">${esc(subtitle)}</h3>
  <table class="nf-soil-tbl">
    <thead>
      <tr>
        <th rowspan="2">Season</th>
        <th rowspan="2">Crop</th>
        <th colspan="7">Before crop sowing</th>
        <th colspan="7">After harvesting</th>
      </tr>
      <tr>
        <th>pH</th>
        <th>EC (dS/m)</th>
        <th>OC (%)</th>
        <th>N (Kg/ha)</th>
        <th>P (Kg/ha)</th>
        <th>K (Kg/ha)</th>
        <th>Soil Microbes (cfu)</th>
        <th>pH</th>
        <th>EC (dS/m)</th>
        <th>OC (%)</th>
        <th>N (Kg/ha)</th>
        <th>P (Kg/ha)</th>
        <th>K (Kg/ha)</th>
        <th>Soil Microbes (cfu)</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

function resolvePayload(data) {
    return resolveSoilTemplatePayload(data);
}

function isKvkGroupedPayload(d) {
    return Boolean(d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.kvkGroups));
}

/** Render the parameter tables (+ unassigned) for one set of soil rows. */
function renderTablesBlock(tables, unassigned) {
    const blocks = (tables || []).map((t) => renderOneSoilTable(t.subtitle, t.rows)).join('');
    const unassignedBlock = (unassigned && unassigned.length > 0)
        ? groupUnassignedSoilRowsByParameterName(unassigned)
            .map(({ subtitle, rows }) => renderOneSoilTable(subtitle, rows))
            .join('')
        : '';
    return blocks + unassignedBlock;
}

function renderNfSoilDataInformationSection(section, data, sectionId, isFirstSection) {
    // exportController's generateCustomTemplateHTML wraps a non-array payload
    // into [payload]; unwrap so the KVK-grouped object is detected.
    let kvkData = data;
    if (Array.isArray(kvkData) && kvkData.length === 1 && isKvkGroupedPayload(kvkData[0])) {
        kvkData = kvkData[0];
    }
    // Module-wise export → KVK-grouped payload: one block (and Excel tab) per KVK.
    if (isKvkGroupedPayload(kvkData)) {
        const groups = kvkData.kvkGroups || [];
        const hasAny = groups.some((g) => (g.tables && g.tables.length) || (g.unassignedRows && g.unassignedRows.length));
        if (!hasAny) {
            return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
        }
        const groupsHtml = groups.map((g) => {
            const head = g.kvkName ? `<h2 class="nf-soil-kvk-hd">KVK: ${esc(g.kvkName)}</h2>` : '';
            return `${head}${renderTablesBlock(g.tables, g.unassignedRows)}`;
        }).join('');
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nf-soil-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="nf-soil-page-title">${esc(PAGE_TITLE)}</div>
    ${groupsHtml}
  </div>
</div>`;
    }

    const payload = resolvePayload(data);
    const tables = payload.tables || [];
    const unassigned = payload.unassignedRows;

    const hasAny = tables.length > 0 || (unassigned && unassigned.length > 0);

    if (!hasAny) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    const blocks = tables.map((t) => renderOneSoilTable(t.subtitle, t.rows)).join('');

    const unassignedBlock = (unassigned && unassigned.length > 0)
        ? groupUnassignedSoilRowsByParameterName(unassigned)
            .map(({ subtitle, rows }) => renderOneSoilTable(subtitle, rows))
            .join('')
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nf-soil-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="nf-soil-page-title">${esc(PAGE_TITLE)}</div>
    ${blocks}
    ${unassignedBlock}
  </div>
</div>`;
}

module.exports = {
    renderNfSoilDataInformationSection,
};
