/**
 * CSISA PDF Template  (Section 2.22)
 *
 * Layout: "Details of Cereal Systems Initiative for South Asia (CSISA)"
 *
 * Columns (one row per CsisaCropDetail, parent fields repeated):
 *   Sr.No. | Season | Village Covered | Block Covered | District Covered |
 *   Respondent | Trial Name | Area Covered(ha) | Name of Crop | Tech. Options |
 *   Variety Name | Duration(Days) | Sowing Date | Harvesting Date | Maturity Days |
 *   Grain Yield(q/ha) | Cost of Cult.(Rs/ha) | Gross Return(Rs/ha) |
 *   Net Return(Rs/ha) | BCR
 */

/* ── helpers ──────────────────────────────────────────────────────────────── */

function esc(v) {
    if (v === null || v === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(v).replace(/[&<>"']/g, c => m[c]);
}

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function fmt(v, dec = 2) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '0';
    return dec === 0
        ? String(Math.round(n))
        : parseFloat(n.toFixed(dec)).toString();
}

/* ── inline styles ────────────────────────────────────────────────────────── */

const STYLE = `
<style>
  .csisa-section { margin-bottom: 12px; }
  .csisa-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 6pt;
      line-height: 1.2;
      page-break-inside: avoid;
  }
  .csisa-table th, .csisa-table td {
      border: 0.2px solid #000;
      padding: 2px 3px;
      vertical-align: middle;
      word-break: break-word;
  }
  .csisa-table thead th {
      background: #fff;
      font-weight: bold;
      text-align: center;
  }
  .csisa-table tbody td   { text-align: center; }
  .csisa-table tbody td.l { text-align: left; }
  .csisa-table .sno  { width: 18px; }
  .csisa-table .sm   { width: 30px; }
  .csisa-table .med  { width: 42px; }
  .csisa-table .wide { width: 60px; }
  .csisa-table .num  { width: 28px; }
  .csisa-no-data {
      text-align: center;
      font-style: italic;
      color: #555;
      padding: 8px;
      font-size: 7.5pt;
  }
</style>`;

/* ── section renderer (bound to ReportTemplateService via .bind(this)) ─────── */

function renderCsisaSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const bodyRows = rows.map((row, idx) => `<tr>
        <td>${idx + 1}</td>
        <td class="l">${esc(row.seasonName || '-')}</td>
        <td>${num(row.villagesCovered)}</td>
        <td>${num(row.blocksCovered)}</td>
        <td>${num(row.districtsCovered)}</td>
        <td>${num(row.respondents)}</td>
        <td class="l">${esc(row.trialName || '-')}</td>
        <td>${fmt(row.areaCoveredHa)}</td>
        <td class="l">${esc(row.cropName || '-')}</td>
        <td class="l">${esc(row.technologyOption || '-')}</td>
        <td class="l">${esc(row.varietyName || '-')}</td>
        <td>${num(row.durationDays)}</td>
        <td>${esc(row.sowingDate    || '-')}</td>
        <td>${esc(row.harvestingDate || '-')}</td>
        <td>${num(row.daysOfMaturity)}</td>
        <td>${fmt(row.grainYieldQPerHa)}</td>
        <td>${fmt(row.costOfCultivation, 0)}</td>
        <td>${fmt(row.grossReturn, 0)}</td>
        <td>${fmt(row.netReturn, 0)}</td>
        <td>${fmt(row.bcr)}</td>
    </tr>`).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    ${STYLE}
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="csisa-section">
        <p style="font-size:8pt;font-weight:bold;margin-bottom:4px;">
            Details of Cereal Systems Initiative for South Asia (CSISA)
        </p>
        <table class="csisa-table">
            <thead>
                <tr>
                    <th class="sno">Sr.No.</th>
                    <th class="sm">Season</th>
                    <th class="sm">Village Covered</th>
                    <th class="sm">Block Covered</th>
                    <th class="sm">District Covered</th>
                    <th class="sm">Respondent</th>
                    <th class="wide">Trail Name</th>
                    <th class="num">Area Covered(ha)</th>
                    <th class="med">Name of Crop</th>
                    <th class="med">Tech. Options</th>
                    <th class="med">Variety Name</th>
                    <th class="sm">Duration(Days)</th>
                    <th class="med">Sowing Date</th>
                    <th class="med">Harvesting Date</th>
                    <th class="sm">Maturity Days</th>
                    <th class="num">Grain Yield(q/ha)</th>
                    <th class="num">Cost of Cult.(Rs/ha)</th>
                    <th class="num">Gross Return(Rs/ha)</th>
                    <th class="num">Net Return(Rs/ha)</th>
                    <th class="sm">BCR</th>
                </tr>
            </thead>
            <tbody>
                ${bodyRows}
            </tbody>
        </table>
    </div>
</div>`;
}

module.exports = { renderCsisaSection };
