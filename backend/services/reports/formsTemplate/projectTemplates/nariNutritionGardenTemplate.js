function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatNum(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
}

function renderNariNutritionGardenSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const gardenRows = rows.map((row, index) => {
        const generalM = toNumber(row.generalM || row.genMale);
        const generalF = toNumber(row.generalF || row.genFemale);
        const obcM = toNumber(row.obcM || row.obcMale);
        const obcF = toNumber(row.obcF || row.obcFemale);
        const scM = toNumber(row.scM || row.scMale);
        const scF = toNumber(row.scF || row.scFemale);
        const stM = toNumber(row.stM || row.stMale);
        const stF = toNumber(row.stF || row.stFemale);
        const totalM = generalM + obcM + scM + stM;
        const totalF = generalF + obcF + scF + stF;
        const totalT = totalM + totalF;

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${this._escapeHtml(row.nameOfNutriSmartVillage || row.villageName || '-')}</td>
                <td>${this._escapeHtml(row.stateName || '-')}</td>
                <td>${this._escapeHtml(row.districtName || '-')}</td>
                <td>${this._escapeHtml(row.activityName || '-')}</td>
                <td>${this._escapeHtml(row.typeOfNutritionalGarden || row.gardenType || '-')}</td>
                <td>${toNumber(row.number)}</td>
                <td>${formatNum(row.areaSqm)}</td>
                <td>${generalM}</td><td>${generalF}</td><td>${generalM + generalF}</td>
                <td>${obcM}</td><td>${obcF}</td><td>${obcM + obcF}</td>
                <td>${scM}</td><td>${scF}</td><td>${scM + scF}</td>
                <td>${stM}</td><td>${stF}</td><td>${stM + stF}</td>
                <td>${totalM}</td><td>${totalF}</td><td>${totalT}</td>
            </tr>
        `;
    }).join('');

    const productionRows = [];
    const productionBody = productionRows.length > 0
        ? productionRows.join('')
        : `<tr><td colspan="8" style="text-align:center;">No record found</td></tr>`;

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .nari-garden-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .nari-garden-table th, .nari-garden-table td { padding: 2px 3px !important; font-size: 6.7pt !important; line-height: 1.15; word-break: break-word; }
        .nari-garden-table thead th { text-align: center; vertical-align: middle; }
    </style>
    <h3 class="about-kvk-subheading">Details of Established Nutrition Garden in Nutri-Smart Village</h3>
    <table class="data-table nari-garden-table">
        <thead>
            <tr>
                <th rowspan="3">S.no</th>
                <th rowspan="3">Name of Nutri-Smart Village</th>
                <th rowspan="3">Name of State</th>
                <th rowspan="3">Name of District</th>
                <th rowspan="3">Activity Type</th>
                <th rowspan="3">Type of Nutritional Garden</th>
                <th rowspan="3">Number</th>
                <th rowspan="3">Area(sqm)</th>
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
        <tbody>${gardenRows}</tbody>
    </table>

    <h3 class="about-kvk-subheading">Production and Consumption of Nutrition Garden Crops of Each Beneficiary</h3>
    <table class="data-table nari-garden-table">
        <thead>
            <tr>
                <th>Sr.No</th>
                <th>Name of Crops</th>
                <th>Varieties</th>
                <th>Area Grown(sqm)</th>
                <th>Production(kg)</th>
                <th>Consumption(kg)</th>
                <th>Sell of Produce(kg)</th>
                <th>Income from Sell of Produce(kg)</th>
            </tr>
        </thead>
        <tbody>${productionBody}</tbody>
    </table>
</div>
`;
}

module.exports = {
    renderNariNutritionGardenSection,
};
