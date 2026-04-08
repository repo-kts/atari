/**
 * NARI Bio-fortified Crops PDF Template  (Section 2.16)
 *
 * Renders two sub-tables matching the reference layout:
 *   Table 1 – "Details of Bio-fortified Crops used in Nutri-Smart Village"
 *             Columns: S.no | Village | Season | Activity Type | Category of Crop |
 *                      Name of Crop | Variety | Area(ha) |
 *                      No. of Beneficiaries (General M/F/T, OBC M/F/T, SC M/F/T, ST M/F/T) |
 *                      Grand Total M/F/T
 *   Table 2 – "Details of Consumption Pattern of Bio-fortified Crops each Beneficiary"
 *             Columns: Sr.No | Name of Bio-fortified Crops | Varieties | Area Grown(sqm) |
 *                      Production/yield | Consumption(gm/day/person) |
 *                      Form of Consumption | No. of Days of Consumption in a Year
 *
 * Data comes from the `nariBioFortifiedCrop` Prisma model via the report repository.
 * Fields that are not yet in the DB schema are rendered as '-'.
 */

/* ── helpers ──────────────────────────────────────────────────────────────── */

function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function fmt(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

/* ── shared inline styles ─────────────────────────────────────────────────── */

const TABLE_STYLES = `
<style>
  .nbf-section { margin-bottom: 12px; }
  .nbf-subtitle {
      font-size: 8pt;
      font-weight: bold;
      margin-bottom: 4px;
  }
  .nbf-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 6.5pt;
      line-height: 1.2;
      page-break-inside: avoid;
  }
  .nbf-table th, .nbf-table td {
      border: 0.2px solid #000;
      padding: 2px 3px;
      vertical-align: middle;
      word-break: break-word;
  }
  .nbf-table thead th {
      background: #fff;
      font-weight: bold;
      text-align: center;
  }
  .nbf-table tbody td {
      text-align: center;
  }
  .nbf-table tbody td.left {
      text-align: left;
  }
  .nbf-table .sno-col  { width: 22px; }
  .nbf-table .wide-col { width: 60px; }
  .nbf-table .med-col  { width: 45px; }
  .nbf-table .num-col  { width: 22px; }
  .nbf-no-data {
      text-align: center;
      font-style: italic;
      color: #555;
      padding: 8px;
      font-size: 7.5pt;
  }
</style>`;

/* ── Table 1 renderer ─────────────────────────────────────────────────────── */

function buildTable1(rows, escFn) {
    const bodyRows = rows.map((row, idx) => {
        const generalM = num(row.generalM ?? row.genMale);
        const generalF = num(row.generalF ?? row.genFemale);
        const generalT = num(row.generalT) || (generalM + generalF);
        const obcM  = num(row.obcM  ?? row.obcMale);
        const obcF  = num(row.obcF  ?? row.obcFemale);
        const obcT  = num(row.obcT) || (obcM + obcF);
        const scM   = num(row.scM   ?? row.scMale);
        const scF   = num(row.scF   ?? row.scFemale);
        const scT   = num(row.scT) || (scM + scF);
        const stM   = num(row.stM   ?? row.stMale);
        const stF   = num(row.stF   ?? row.stFemale);
        const stT   = num(row.stT) || (stM + stF);
        const gM    = num(row.grandM) || (generalM + obcM + scM + stM);
        const gF    = num(row.grandF) || (generalF + obcF + scF + stF);
        const gT    = gM + gF;

        return `<tr>
            <td>${idx + 1}</td>
            <td class="left">${escFn(row.nameOfNutriSmartVillage || row.villageName || '-')}</td>
            <td>${escFn(row.seasonName || '-')}</td>
            <td>${escFn(row.activityName || '-')}</td>
            <td class="left">${escFn(row.cropCategoryName || row.cropCategory || '-')}</td>
            <td class="left">${escFn(row.nameOfCrop || row.cropName || '-')}</td>
            <td class="left">${escFn(row.variety || '-')}</td>
            <td>${fmt(row.areaHa)}</td>
            <td>${generalM}</td><td>${generalF}</td><td>${generalT}</td>
            <td>${obcM}</td><td>${obcF}</td><td>${obcT}</td>
            <td>${scM}</td><td>${scF}</td><td>${scT}</td>
            <td>${stM}</td><td>${stF}</td><td>${stT}</td>
            <td>${gM}</td><td>${gF}</td><td>${gT}</td>
        </tr>`;
    }).join('');

    const emptyRow = rows.length === 0
        ? `<tr><td colspan="23" class="nbf-no-data">No records found.</td></tr>`
        : '';

    return `
<p class="nbf-subtitle">Details of Bio-fortified Crops used in Nutri-Smart Village</p>
<table class="nbf-table">
  <thead>
    <tr>
      <th rowspan="2" class="sno-col">S.no.</th>
      <th rowspan="2" class="wide-col">Name of Nutri-Smart Village</th>
      <th rowspan="2" class="med-col">Season</th>
      <th rowspan="2" class="med-col">Activity Type</th>
      <th rowspan="2" class="med-col">Category of Crop</th>
      <th rowspan="2" class="wide-col">Name of Crop</th>
      <th rowspan="2" class="med-col">Variety</th>
      <th rowspan="2" class="num-col">Area(ha)</th>
      <th colspan="12">No. of Beneficiaries</th>
      <th colspan="3">Grand Total</th>
    </tr>
    <tr>
      <th colspan="3">General</th>
      <th colspan="3">OBC</th>
      <th colspan="3">SC</th>
      <th colspan="3">ST</th>
      <th>M</th><th>F</th><th>T</th>
    </tr>
    <tr>
      <th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>
      <th>M</th><th>F</th><th>T</th>
      <th>M</th><th>F</th><th>T</th>
      <th>M</th><th>F</th><th>T</th>
      <th>M</th><th>F</th><th>T</th>
      <th></th><th></th><th></th>
    </tr>
  </thead>
  <tbody>
    ${bodyRows}
    ${emptyRow}
  </tbody>
</table>`;
}

/* ── Table 2 renderer ─────────────────────────────────────────────────────── */

function buildTable2(rows, escFn) {
    const bodyRows = rows.map((row, idx) => `<tr>
        <td>${idx + 1}</td>
        <td class="left">${escFn(row.nameOfCrop || row.cropName || '-')}</td>
        <td class="left">${escFn(row.variety || '-')}</td>
        <td>${fmt(row.areaHa)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>`).join('');

    const emptyRow = rows.length === 0
        ? `<tr><td colspan="8" class="nbf-no-data">No records found.</td></tr>`
        : '';

    return `
<p class="nbf-subtitle" style="margin-top:10px;">Details of Consumption Pattern of Bio-fortified Crops each Beneficiary</p>
<table class="nbf-table">
  <thead>
    <tr>
      <th class="sno-col">Sr.No.</th>
      <th class="wide-col">Name of Bio-fortified Crops</th>
      <th class="med-col">Varieties</th>
      <th class="med-col">Area Grown(sqm)</th>
      <th class="med-col">Production/yield</th>
      <th class="med-col">Consumption<br>(gm/day/person)</th>
      <th class="wide-col">Form of Consumption</th>
      <th class="med-col">No. of Days of Consumption in a Year</th>
    </tr>
  </thead>
  <tbody>
    ${bodyRows}
    ${emptyRow}
  </tbody>
</table>`;
}

/* ── main section renderer (bound to ReportTemplateService via .bind(this)) ── */

function renderNariBioFortifiedSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const escFn = (v) => this._escapeHtml(v);

    return `
<div id="${sectionId}" class="${pageClass}">
    ${TABLE_STYLES}
    <h1 class="section-title">${section.id} ${escFn(section.title)}</h1>
    <div class="nbf-section">
        ${buildTable1(rows, escFn)}
        ${buildTable2(rows, escFn)}
    </div>
</div>`;
}

module.exports = { renderNariBioFortifiedSection };
