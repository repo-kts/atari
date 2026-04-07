const { NF_DEMONSTRATION_PARAMETER_DEFS } = require('../../../../repositories/reports/naturalFarmingReport/nfDemonstrationConstants.js');
const { normalizeFarmersPracticingExportRow } = require('../../../../repositories/reports/naturalFarmingReport/farmersPracticingReportRepository.js');

/** Centered caption above the main table (matches government form wording). */
const FARMERS_TABLE_TITLE = 'Information of Farmer Already Practicing Natural Farming';

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, c => m[c]);
}

function fmtNum(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return esc(String(v));
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return String(Number(n.toFixed(4)));
}

function toRows(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.records)) return data.records;
    return data ? [data] : [];
}

function indexToLetterLabel(i) {
    if (i >= 0 && i < 26) return `${String.fromCharCode(65 + i)})`;
    return `(${i + 1})`;
}

function tableCss() {
    return `
  .nf-fp-wrap { width:100%; font-size:6.5pt; line-height:1.2; }
  .nf-fp-table-title { text-align:center; font-size:8.5pt; font-weight:bold; margin:0 0 6px 0; padding:2px 0; }
  .nf-fp-sub { margin:0 0 6px 0; width:100%; }
  .nf-fp-sub-flex { display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; font-size:7pt; font-weight:600; text-align:left; }
  .nf-fp-sub-item { display:flex; align-items:flex-start; justify-content:flex-start; gap:6px; width:100%; line-height:1.25; }
  .nf-fp-sub-lbl { flex-shrink:0; }
  .nf-fp-main { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:14px; page-break-inside:avoid; }
  .nf-fp-main th, .nf-fp-main td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-break:break-word; }
  .nf-fp-main thead th { font-weight:bold; }
  .nf-fp-main .l { text-align:left; }
  .nf-fp-block { margin-bottom:18px; page-break-inside:avoid; }
  .nf-fp-fb td { text-align:left; font-size:6.5pt; vertical-align:top; }
`;
}

/** Optional A/B/C line when multiple farmer records (not part of the government table caption). */
function renderFarmersIndexLine(idx, total) {
    if (total <= 1) return '';
    const lbl = indexToLetterLabel(idx);
    return `
  <div class="nf-fp-sub nf-fp-sub-flex" role="group" aria-label="Record ${idx + 1} of ${total}">
    <div class="nf-fp-sub-item"><span class="nf-fp-sub-lbl">${esc(lbl)}</span><span>Farmer record ${idx + 1} of ${total}</span></div>
  </div>`;
}

/** Centered title above the comparison table (same as sample form). */
function renderFarmersTableCaption() {
    return `<div class="nf-fp-table-title">${esc(FARMERS_TABLE_TITLE)}</div>`;
}

function renderParameterTable(rec) {
    const rowspan = NF_DEMONSTRATION_PARAMETER_DEFS.length;
    const act = esc(rec.activityName || '—');
    const crop = esc(rec.crop || '—');
    const varie = esc(rec.variety || '—');
    const season = esc(rec.seasonName || '—');
    const tech = esc(rec.naturalFarmingTechnology || '—');
    const area = rec.areaInHa != null ? fmtNum(rec.areaInHa) : '—';
    const practice = esc(rec.farmerPracticeDetails || '—');

    const firstRow = NF_DEMONSTRATION_PARAMETER_DEFS[0];
    const restRows = NF_DEMONSTRATION_PARAMETER_DEFS.slice(1);

    const firstBody = `
    <tr>
      <td rowspan="${rowspan}" class="l">${act}</td>
      <td rowspan="${rowspan}" class="l">${crop}</td>
      <td rowspan="${rowspan}" class="l">${varie}</td>
      <td rowspan="${rowspan}">${season}</td>
      <td rowspan="${rowspan}" class="l">${tech}</td>
      <td rowspan="${rowspan}">${area}</td>
      <td rowspan="${rowspan}" class="l">${practice}</td>
      <td class="l">${esc(firstRow.label)}</td>
      <td>${fmtNum(rec[firstRow.withoutKey])}</td>
      <td>${fmtNum(rec[firstRow.withKey])}</td>
    </tr>`;

    const restBody = restRows.map((def) => `
    <tr>
      <td class="l">${esc(def.label)}</td>
      <td>${fmtNum(rec[def.withoutKey])}</td>
      <td>${fmtNum(rec[def.withKey])}</td>
    </tr>`).join('');

    const fb = esc(rec.farmerFeedback || '—');

    return `
  <table class="nf-fp-main">
    <thead>
      <tr>
        <th>Name of Activity</th>
        <th>Crop</th>
        <th>Variety</th>
        <th>Season (Kharif / Rabi / Summer)</th>
        <th>Name of Natural Farming components/Technology demonstrated</th>
        <th>Area (ha) in Natural farming practice</th>
        <th>Detail of farmer practice</th>
        <th>Name of parameter</th>
        <th>Without NF practice</th>
        <th>With NF practice</th>
      </tr>
    </thead>
    <tbody>
      ${firstBody}
      ${restBody}
      <tr class="nf-fp-fb">
        <td class="l"><strong>Farmer Feedback</strong></td>
        <td colspan="9" class="l">${fb}</td>
      </tr>
    </tbody>
  </table>`;
}

function renderOneRecord(rec, idx, total) {
    return `
  <div class="nf-fp-block">
    ${renderFarmersIndexLine(idx, total)}
    ${renderFarmersTableCaption()}
    ${renderParameterTable(rec)}
  </div>`;
}

/**
 * Natural Farming — Farmers already practicing (multi-record: A, B, C… per farmer)
 */
function renderNfFarmersPracticingInformationSection(section, data, sectionId, isFirstSection) {
    const raw = toRows(data);
    const records = raw.map(normalizeFarmersPracticingExportRow).filter(Boolean);

    if (records.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
    }

    const blocks = records.map((rec, i) => renderOneRecord(rec, i, records.length)).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nf-fp-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    ${blocks}
  </div>
</div>`;
}

module.exports = {
    renderNfFarmersPracticingInformationSection,
};
