/**
 * NARI Training Programmes PDF Template  (Section 2.18)
 *
 * Layout: "Training Programmes in Nutri-Smart Village"
 *
 * Columns:
 *   S.no. | Name of Nutri Smart Village | Activity Type | Area of Training |
 *   Title of Training | On Campus/Off Campus | Venue | No of Days | No of Courses |
 *   No. of Beneficiaries → General (M/F/T) | OBC (M/F/T) | SC (M/F/T) | ST (M/F/T) |
 *   Grand Total (M/F/T)
 *
 * Header structure: 3 rows
 *   Row 1: main columns (rowspan=3 each) + "No. of Beneficiaries" (colspan=15)
 *   Row 2: General(colspan=3) | OBC(colspan=3) | SC(colspan=3) | ST(colspan=3) | Grand Total(colspan=3)
 *   Row 3: M | F | T  ×5
 */

/* ── helpers ──────────────────────────────────────────────────────────────── */

function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

/* ── inline styles ────────────────────────────────────────────────────────── */

const STYLE = `
<style>
  .ntp-section  { margin-bottom: 12px; }
  .ntp-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 6.5pt;
      line-height: 1.2;
      page-break-inside: avoid;
  }
  .ntp-table th, .ntp-table td {
      border: 0.2px solid #000;
      padding: 2px 3px;
      vertical-align: middle;
      word-break: break-word;
  }
  .ntp-table thead th {
      background: #fff;
      font-weight: bold;
      text-align: center;
  }
  .ntp-table tbody td   { text-align: center; }
  .ntp-table tbody td.l { text-align: left; }
  .ntp-table .sno   { width: 20px; }
  .ntp-table .wide  { width: 60px; }
  .ntp-table .med   { width: 45px; }
  .ntp-table .sm    { width: 28px; }
  .ntp-table .num   { width: 20px; }
  .ntp-no-data {
      text-align: center;
      font-style: italic;
      color: #555;
      padding: 8px;
      font-size: 7.5pt;
  }
</style>`;

/* ── section renderer (bound to ReportTemplateService via .bind(this)) ─────── */

function renderNariTrainingSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const bodyRows = rows.map((row, idx) => {
        const generalM = num(row.generalM ?? row.genMale);
        const generalF = num(row.generalF ?? row.genFemale);
        const generalT = num(row.generalT) || (generalM + generalF);
        const obcM  = num(row.obcM  ?? row.obcMale);
        const obcF  = num(row.obcF  ?? row.obcFemale);
        const obcT  = num(row.obcT) || (obcM + obcF);
        const scM   = num(row.scM   ?? row.scMale);
        const scF   = num(row.scF   ?? row.scFemale);
        const scT   = num(row.scT)  || (scM + scF);
        const stM   = num(row.stM   ?? row.stMale);
        const stF   = num(row.stF   ?? row.stFemale);
        const stT   = num(row.stT)  || (stM + stF);
        const gM    = num(row.grandM) || (generalM + obcM + scM + stM);
        const gF    = num(row.grandF) || (generalF + obcF + scF + stF);
        const gT    = gM + gF;

        const campusLabel = row.campusTypeLabel
            || (row.campusType === 'ON_CAMPUS'  ? 'On Campus'
              : row.campusType === 'OFF_CAMPUS' ? 'Off Campus'
              : esc(row.campusType || '-'));

        return `<tr>
            <td>${idx + 1}</td>
            <td class="l">${esc(row.nameOfNutriSmartVillage || row.villageName || '-')}</td>
            <td class="l">${esc(row.activityName  || '-')}</td>
            <td class="l">${esc(row.areaOfTraining || '-')}</td>
            <td class="l">${esc(row.titleOfTraining || '-')}</td>
            <td>${campusLabel}</td>
            <td class="l">${esc(row.venue || '-')}</td>
            <td>${num(row.noOfDays)}</td>
            <td>${num(row.noOfCourses)}</td>
            <td>${generalM}</td><td>${generalF}</td><td>${generalT}</td>
            <td>${obcM}</td><td>${obcF}</td><td>${obcT}</td>
            <td>${scM}</td><td>${scF}</td><td>${scT}</td>
            <td>${stM}</td><td>${stF}</td><td>${stT}</td>
            <td>${gM}</td><td>${gF}</td><td>${gT}</td>
        </tr>`;
    }).join('');

    const emptyRow = rows.length === 0
        ? `<tr><td colspan="24" class="ntp-no-data">No records found.</td></tr>`
        : '';

    return `
<div id="${sectionId}" class="${pageClass}">
    ${STYLE}
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="ntp-section">
        <p style="font-size:8pt;font-weight:bold;margin-bottom:4px;">Training Programmes in Nutri-Smart Village</p>
        <table class="ntp-table">
            <thead>
                <tr>
                    <th rowspan="3" class="sno">S.no.</th>
                    <th rowspan="3" class="wide">Name of Nutri Smart Village</th>
                    <th rowspan="3" class="med">Activity Type</th>
                    <th rowspan="3" class="med">Area of Training</th>
                    <th rowspan="3" class="wide">Title of Training</th>
                    <th rowspan="3" class="med">On Campus/Off Campus</th>
                    <th rowspan="3" class="med">Venue</th>
                    <th rowspan="3" class="sm">No of Days</th>
                    <th rowspan="3" class="sm">No of Courses</th>
                    <th colspan="15">No. of Beneficiaries</th>
                </tr>
                <tr>
                    <th colspan="3">General</th>
                    <th colspan="3">OBC</th>
                    <th colspan="3">SC</th>
                    <th colspan="3">ST</th>
                    <th colspan="3">Grand Total</th>
                </tr>
                <tr>
                    <th class="num">M</th><th class="num">F</th><th class="num">T</th>
                    <th class="num">M</th><th class="num">F</th><th class="num">T</th>
                    <th class="num">M</th><th class="num">F</th><th class="num">T</th>
                    <th class="num">M</th><th class="num">F</th><th class="num">T</th>
                    <th class="num">M</th><th class="num">F</th><th class="num">T</th>
                </tr>
            </thead>
            <tbody>
                ${bodyRows}
                ${emptyRow}
            </tbody>
        </table>
    </div>
</div>`;
}

module.exports = { renderNariTrainingSection };
