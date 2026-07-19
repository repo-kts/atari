const { renderNariActivitySummary } = require('./nariSummaryTable.js');

function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatNum(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
}

function getGardenValues(row) {
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

    return {
        village: row.nameOfNutriSmartVillage || row.villageName || '-',
        activity: row.activityName || '-',
        gardenType: row.typeOfNutritionalGarden || row.gardenType || '-',
        number: toNumber(row.number),
        areaSqm: formatNum(row.areaSqm),
        generalM,
        generalF,
        generalT: generalM + generalF,
        obcM,
        obcF,
        obcT: obcM + obcF,
        scM,
        scF,
        scT: scM + scF,
        stM,
        stF,
        stT: stM + stF,
        totalM,
        totalF,
        totalT: totalM + totalF,
    };
}

function buildNariNutritionGardenGroups(data) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const stateMap = new Map();

    rows.forEach((row) => {
        const stateName = row.stateName || 'State not specified';
        const districtName = row.districtName || 'District not specified';
        const kvkName = row.kvkName || 'KVK not specified';
        if (!stateMap.has(stateName)) stateMap.set(stateName, new Map());
        const districtMap = stateMap.get(stateName);
        if (!districtMap.has(districtName)) districtMap.set(districtName, new Map());
        const kvkMap = districtMap.get(districtName);
        if (!kvkMap.has(kvkName)) kvkMap.set(kvkName, []);
        kvkMap.get(kvkName).push(row);
    });

    return Array.from(stateMap, ([stateName, districtMap]) => ({
        stateName,
        districts: Array.from(districtMap, ([districtName, kvkMap]) => ({
            districtName,
            kvks: Array.from(kvkMap, ([kvkName, rows]) => ({ kvkName, rows })),
        })),
    }));
}

function renderGardenRows(rows, escapeHtml) {
    return rows.map((row, index) => {
        const v = getGardenValues(row);
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(v.village)}</td>
                <td>${escapeHtml(v.activity)}</td>
                <td>${escapeHtml(v.gardenType)}</td>
                <td>${v.number}</td>
                <td>${v.areaSqm}</td>
                <td>${v.generalM}</td><td>${v.generalF}</td><td>${v.generalT}</td>
                <td>${v.obcM}</td><td>${v.obcF}</td><td>${v.obcT}</td>
                <td>${v.scM}</td><td>${v.scF}</td><td>${v.scT}</td>
                <td>${v.stM}</td><td>${v.stF}</td><td>${v.stT}</td>
                <td>${v.totalM}</td><td>${v.totalF}</td><td>${v.totalT}</td>
            </tr>`;
    }).join('');
}

function renderProductionRows(rows, escapeHtml) {
    let productionSr = 1;
    const productionRows = [];
    rows.forEach((row) => {
        const resultList = Array.isArray(row.results) ? row.results : [];
        resultList.forEach((r) => {
            productionRows.push(`
            <tr>
                <td>${productionSr++}</td>
                <td>${escapeHtml(r.cropName || '-')}</td>
                <td>${escapeHtml(r.variety || '-')}</td>
                <td>${formatNum(r.areaSqm)}</td>
                <td>${formatNum(r.productionKg)}</td>
                <td>${formatNum(r.consumptionKg)}</td>
                <td>${formatNum(r.sellKg)}</td>
                <td>${formatNum(r.income)}</td>
            </tr>`);
        });
    });
    return productionRows.length > 0
        ? productionRows.join('')
        : '<tr><td colspan="8" style="text-align:center;">No record found</td></tr>';
}

function renderGardenTable(rows, escapeHtml) {
    return `
    <table class="data-table nari-garden-table">
        <colgroup>
            <col style="width:3%"/><col style="width:15%"/><col style="width:9%"/><col style="width:11%"/><col style="width:5%"/><col style="width:5%"/>
            <col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/><col style="width:3.46%"/>
        </colgroup>
        <thead>
            <tr>
                <th rowspan="3">S.no</th>
                <th rowspan="3">Name of Nutri-Smart Village</th>
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
        <tbody>${renderGardenRows(rows, escapeHtml)}</tbody>
    </table>`;
}

function renderProductionTable(rows, escapeHtml) {
    return `
    <table class="data-table nari-garden-table nari-production-table">
        <thead>
            <tr>
                <th>Sr.No</th>
                <th>Name of Crops</th>
                <th>Varieties</th>
                <th>Area Grown(sqm)</th>
                <th>Production(kg)</th>
                <th>Consumption(kg)</th>
                <th>Sell of Produce(kg)</th>
                <th>Income from Sell of Produce (Rs)</th>
            </tr>
        </thead>
        <tbody>${renderProductionRows(rows, escapeHtml)}</tbody>
    </table>`;
}

function renderNariNutritionGardenSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    if (reportContext.isAggregatedView && data && data.statePayload) {
        return renderNariActivitySummary(this, section, sectionId, isFirstSection, data.statePayload);
    }
    const records = (data && Array.isArray(data.records)) ? data.records : data;
    const groups = buildNariNutritionGardenGroups(records);
    if (groups.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const escapeHtml = this._escapeHtml.bind(this);
    const body = groups.map(state => `
        <h2 class="nari-group-state">State: ${escapeHtml(state.stateName)}</h2>
        ${state.districts.map(district => `
            <h3 class="nari-group-district">District: ${escapeHtml(district.districtName)}</h3>
            ${district.kvks.map(kvk => `
                <h4 class="nari-group-kvk">KVK: ${escapeHtml(kvk.kvkName)}</h4>
                <h3 class="about-kvk-subheading">Details of Established Nutrition Garden in Nutri-Smart Village</h3>
                ${renderGardenTable(kvk.rows, escapeHtml)}
                <h3 class="about-kvk-subheading">Production and Consumption of Nutrition Garden Crops of Each Beneficiary</h3>
                ${renderProductionTable(kvk.rows, escapeHtml)}
            `).join('')}
        `).join('')}
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${escapeHtml(section.title)}</h1>
    <style>
        .nari-garden-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .nari-garden-table th, .nari-garden-table td { padding: 2px 3px !important; font-size: 6.2pt !important; line-height: 1.12; word-break: break-word; }
        .nari-garden-table thead th { text-align: center; vertical-align: middle; }
        .nari-production-table th, .nari-production-table td { font-size: 7.2pt !important; }
        .nari-group-state { font-size: 10pt; margin: 10px 0 4px; padding: 4px 6px; background: #d9ead3; }
        .nari-group-district { font-size: 9pt; margin: 8px 0 4px; padding: 3px 6px; background: #eaf4e4; }
        .nari-group-kvk { font-size: 8.5pt; margin: 7px 0 4px; padding: 3px 6px; background: #dce6f1; }
    </style>
    ${body}
</div>`;
}

module.exports = {
    renderNariNutritionGardenSection,
    buildNariNutritionGardenGroups,
    getGardenValues,
    formatNum,
};
