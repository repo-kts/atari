function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

const STYLES = `
<style>
  .nva-subtitle { font-size: 8pt; font-weight: bold; margin-bottom: 4px; }
  .nva-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 6.5pt;
      line-height: 1.2;
      page-break-inside: avoid;
  }
  .nva-table th, .nva-table td {
      border: 0.2px solid #000;
      padding: 2px 3px;
      vertical-align: middle;
      word-break: break-word;
  }
  .nva-table thead th { text-align: center; font-weight: bold; background: #fff; }
  .nva-table tbody td { text-align: center; }
  .nva-table tbody td.left { text-align: left; }
  .nva-empty { text-align: center; font-style: italic; color: #555; padding: 8px; font-size: 7.5pt; }
</style>`;

function buildTable1(rows, escFn) {
    const bodyRows = rows.map((row, idx) => {
        const generalM = num(row.generalM ?? row.genMale);
        const generalF = num(row.generalF ?? row.genFemale);
        const obcM = num(row.obcM ?? row.obcMale);
        const obcF = num(row.obcF ?? row.obcFemale);
        const scM = num(row.scM ?? row.scMale);
        const scF = num(row.scF ?? row.scFemale);
        const stM = num(row.stM ?? row.stMale);
        const stF = num(row.stF ?? row.stFemale);
        const gM = generalM + obcM + scM + stM;
        const gF = generalF + obcF + scF + stF;
        const gT = gM + gF;

        return `<tr>
            <td>${idx + 1}</td>
            <td class="left">${escFn(row.nameOfNutriSmartVillage || row.villageName || '-')}</td>
            <td class="left">${escFn(row.nameOfCrop || row.cropName || '-')}</td>
            <td class="left">${escFn(row.nameOfValueAddedProduct || row.productName || '-')}</td>
            <td>${escFn(row.activityName || '-')}</td>
            <td>${generalM}</td><td>${generalF}</td><td>${generalM + generalF}</td>
            <td>${obcM}</td><td>${obcF}</td><td>${obcM + obcF}</td>
            <td>${scM}</td><td>${scF}</td><td>${scM + scF}</td>
            <td>${stM}</td><td>${stF}</td><td>${stM + stF}</td>
            <td>${gM}</td><td>${gF}</td><td>${gT}</td>
        </tr>`;
    }).join('');

    const emptyRow = rows.length === 0
        ? `<tr><td colspan="20" class="nva-empty">No records found.</td></tr>`
        : '';

    return `
<p class="nva-subtitle">Details of Value Addition in Nutri-Smart Village</p>
<table class="nva-table">
  <thead>
    <tr>
      <th rowspan="2">S.no.</th>
      <th rowspan="2">Name of Nutri-Smart Village</th>
      <th rowspan="2">Name of Crop</th>
      <th rowspan="2">Name of Value-added Product</th>
      <th rowspan="2">Activity Type</th>
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
      <th></th><th></th><th></th><th></th><th></th>
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

function buildTable2(rows, escFn) {
    const bodyRows = rows.map((row, idx) => `<tr>
        <td>${idx + 1}</td>
        <td class="left">${escFn(row.nameOfValueAddedProduct || row.productName || '-')}</td>
        <td>${escFn(row.amountProducedKg || '-')}</td>
        <td>${escFn(row.marketPricePerKg || '-')}</td>
        <td>${escFn(row.netIncomeRs || '-')}</td>
        <td>${escFn(row.shelfLifeOfProduce || '-')}</td>
        <td>${escFn(row.fssaiCertification || '-')}</td>
        <td>${escFn(row.fssaiCertificationNo || '-')}</td>
    </tr>`).join('');

    const emptyRow = rows.length === 0
        ? `<tr><td colspan="8" class="nva-empty">No records found.</td></tr>`
        : '';

    return `
<p class="nva-subtitle" style="margin-top:10px;">Details of Value-added Products each Beneficiary</p>
<table class="nva-table">
  <thead>
    <tr>
      <th>Sr.No.</th>
      <th>Name of Product</th>
      <th>Amount Produced(Kg)</th>
      <th>Market Price(Rs/kg)</th>
      <th>Net Income(Rs)</th>
      <th>Self-life of Produce</th>
      <th>FSSAI Certification</th>
      <th>FSSAI Certification No.</th>
    </tr>
  </thead>
  <tbody>
    ${bodyRows}
    ${emptyRow}
  </tbody>
</table>`;
}

function renderNariValueAdditionSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const escFn = (v) => this._escapeHtml(v);

    return `
<div id="${sectionId}" class="${pageClass}">
    ${STYLES}
    <h1 class="section-title">${section.id} ${escFn(section.title)}</h1>
    ${buildTable1(rows, escFn)}
    ${buildTable2(rows, escFn)}
</div>`;
}

module.exports = {
    renderNariValueAdditionSection,
};
