const { NF_DEMONSTRATION_PARAMETER_DEFS } = require('../../../../repositories/reports/naturalFarmingReport/nfDemonstrationConstants.js');
const { normalizeDemonstrationExportRow } = require('../../../../repositories/reports/naturalFarmingReport/demonstrationInfoReportRepository.js');

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

/** A, B, … Z, then (27), (28), … for large lists */
function indexToLetterLabel(i) {
  if (i >= 0 && i < 26) return `${String.fromCharCode(65 + i)})`;
  return `(${i + 1})`;
}

function tableCss() {
  return `
  .nf-demo-wrap { width:100%; font-size:6.5pt; line-height:1.2; }
  .nf-demo-sub { margin:6px 0 8px 0; width:100%; }
  .nf-demo-sub-flex { display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; font-size:7.5pt; font-weight:600; text-align:left; }
  .nf-demo-sub-item { display:flex; align-items:flex-start; justify-content:flex-start; gap:6px; width:100%; line-height:1.25; }
  .nf-demo-sub-lbl { flex-shrink:0; }
  .nf-demo-meta { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:8px; }
  .nf-demo-meta th, .nf-demo-meta td { border:0.35pt solid #000; padding:3px 4px; vertical-align:top; }
  .nf-demo-meta th { width:32%; font-weight:bold; text-align:left; background:#f5f5f5; }
  .nf-demo-meta td { text-align:left; word-break:break-word; }
  .nf-demo-main { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:14px; page-break-inside:avoid; }
  .nf-demo-main th, .nf-demo-main td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-break:break-word; }
  .nf-demo-main .l { text-align:left; }
  .nf-demo-block { margin-bottom:16px; page-break-inside:avoid; }
  .nf-demo-fb td { text-align:left; font-size:6.5pt; }
`;
}

function renderDemonstrationHeading(idx, total) {
  const line = 'KVK/ Farmer wise information of demonstration conducted.';
  if (total <= 1) {
    return `
  <div class="nf-demo-sub nf-demo-sub-flex" role="group" aria-label="Demonstration context">
    <div class="nf-demo-sub-item"><span>${esc(line)}</span></div>
  </div>`;
  }
  const lbl = indexToLetterLabel(idx);
  return `
  <div class="nf-demo-sub nf-demo-sub-flex" role="group" aria-label="Demonstration ${idx + 1} of ${total}">
    <div class="nf-demo-sub-item"><span class="nf-demo-sub-lbl">${esc(lbl)}</span><span>${esc(line)}</span></div>
  </div>`;
}

function renderMetaTable(rec) {
  const lat = rec.latitude != null ? fmtNum(rec.latitude) : '—';
  const lng = rec.longitude != null ? fmtNum(rec.longitude) : '—';
  return `
  <table class="nf-demo-meta">
    <tbody>
      <tr><th>Name of State</th><td colspan="2">${esc(rec.stateName || '—')}</td></tr>
      <tr><th>Name of KVK/Farmer where demonstration conducted</th><td colspan="2">${esc(rec.kvkFarmerLabel || '—')}</td></tr>
      <tr><th>Address of Farmer with contact detail</th><td colspan="2">${esc(rec.addressWithContact || '—')}</td></tr>
      <tr><th>Agro Climatic Zone of Village/KVK</th><td colspan="2">${esc(rec.agroClimaticZone || '—')}</td></tr>
      <tr><th>Cropping pattern of KVK plot/ Farmer plot</th><td colspan="2">${esc(rec.croppingPattern || '—')}</td></tr>
      <tr>
        <th>Farming Situation of the Selected Farmer/KVK</th>
        <th style="width:34%;">Latitude (N)</th>
        <th style="width:34%;">Longitude (E)</th>
      </tr>
      <tr>
      <td>${esc((rec.farmingSituation || rec.agroClimaticZone || '').trim() || '—')}</td>
        <td>${lat}</td>
        <td>${lng}</td>
      </tr>
    </tbody>
  </table>`;
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
  <table class="nf-demo-main">
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
        <th>Performance Without NF Practice</th>
        <th>Performance With NF Practice</th>
      </tr>
    </thead>
    <tbody>
      ${firstBody}
      ${restBody}
      <tr class="nf-demo-fb">
        <td colspan="7" class="l"><strong>Farmer Feedback</strong></td>
        <td colspan="3" class="l">${fb}</td>
      </tr>
    </tbody>
  </table>`;
}

function renderOneDemonstration(rec, idx, total) {
  return `
  <div class="nf-demo-block">
    ${renderDemonstrationHeading(idx, total)}
    ${renderMetaTable(rec)}
    ${renderParameterTable(rec)}
  </div>`;
}

/**
 * Natural Farming — Demonstration Information (multi-record: one block per demonstration)
 */
function renderNfDemonstrationInformationSection(section, data, sectionId, isFirstSection) {
  const raw = toRows(data);
  const records = raw.map(normalizeDemonstrationExportRow).filter(Boolean);

  if (records.length === 0) {
    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No data available for this section.</p>
</div>`;
  }

  const blocks = records.map((rec, i) => renderOneDemonstration(rec, i, records.length)).join('');

  return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="nf-demo-wrap">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    ${blocks}
  </div>
</div>`;
}

module.exports = {
  renderNfDemonstrationInformationSection,
};
