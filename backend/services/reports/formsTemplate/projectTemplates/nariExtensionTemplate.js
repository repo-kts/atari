function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

const STYLE = `
<style>
  .nea-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 6.6pt;
      line-height: 1.2;
      page-break-inside: avoid;
  }
  .nea-table th, .nea-table td {
      border: 0.2px solid #000;
      padding: 2px 3px;
      vertical-align: middle;
      word-break: break-word;
  }
  .nea-table thead th {
      background: #fff;
      font-weight: bold;
      text-align: center;
  }
  .nea-table tbody td { text-align: center; }
  .nea-table tbody td.l { text-align: left; }
</style>`;

function renderNariExtensionSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map((row, idx) => {
        const generalM = num(row.generalM ?? row.genMale);
        const generalF = num(row.generalF ?? row.genFemale);
        const obcM = num(row.obcM ?? row.obcMale);
        const obcF = num(row.obcF ?? row.obcFemale);
        const scM = num(row.scM ?? row.scMale);
        const scF = num(row.scF ?? row.scFemale);
        const stM = num(row.stM ?? row.stMale);
        const stF = num(row.stF ?? row.stFemale);
        const gM = num(row.grandM) || (generalM + obcM + scM + stM);
        const gF = num(row.grandF) || (generalF + obcF + scF + stF);
        const gT = gM + gF;

        return `<tr>
            <td>${idx + 1}</td>
            <td class="l">${esc(row.nameOfNutriSmartVillage || row.villageName || '-')}</td>
            <td class="l">${esc(row.titleOrTypeOfActivity || row.activityOrganized || row.activityName || '-')}</td>
            <td>${num(row.noOfActivities)}</td>
            <td>${generalM}</td><td>${generalF}</td><td>${generalM + generalF}</td>
            <td>${obcM}</td><td>${obcF}</td><td>${obcM + obcF}</td>
            <td>${scM}</td><td>${scF}</td><td>${scM + scF}</td>
            <td>${stM}</td><td>${stF}</td><td>${stM + stF}</td>
            <td>${gM}</td><td>${gF}</td><td>${gT}</td>
        </tr>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    ${STYLE}
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="nea-table">
        <thead>
            <tr>
                <th rowspan="3">S.no.</th>
                <th rowspan="3">Name of Nutri Smart Village</th>
                <th rowspan="3">Title/Type of Activity</th>
                <th rowspan="3">No. of activities</th>
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
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
                <th></th><th></th><th></th>
            </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
    </table>
</div>`;
}

module.exports = { renderNariExtensionSection };
