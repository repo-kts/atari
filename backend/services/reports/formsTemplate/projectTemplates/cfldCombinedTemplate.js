function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function formatNumber(value, precision = 2) {
    const n = toNumber(value, 0);
    return Number.isInteger(n) ? String(n) : n.toFixed(precision);
}

function avg(values = []) {
    if (!values.length) return 0;
    const total = values.reduce((sum, value) => sum + toNumber(value, 0), 0);
    return total / values.length;
}

function normalizeRecord(record = {}) {
    const economic = record.economic || {};
    const socio = record.socio || {};
    const perception = record.perception || {};
    return {
        cfldTechId: record.cfldTechId || record.id || 0,
        kvkName: record.kvkName || record.kvk?.kvkName || '-',
        stateName: record.stateName || record.kvk?.state?.stateName || '-',
        cropTypeName: record.cropTypeName || record.typeName || '-',
        seasonName: record.seasonName || '-',
        cropName: record.cropName || '-',
        areaInHa: toNumber(record.areaInHa, 0),
        technologyDemonstrated: record.technologyDemonstrated || '-',
        existingFarmerPractice: record.existingFarmerPractice || '-',
        farmerYield: toNumber(record.farmerYield, 0),
        demoYieldMax: toNumber(record.demoYieldMax, 0),
        demoYieldMin: toNumber(record.demoYieldMin, 0),
        demoYieldAvg: toNumber(record.demoYieldAvg, 0),
        districtYield: toNumber(record.districtYield, 0),
        stateYield: toNumber(record.stateYield, 0),
        potentialYield: toNumber(record.potentialYield, 0),
        yieldGapDistrictMinimized: toNumber(record.yieldGapDistrictMinimized, 0),
        yieldGapStateMinimized: toNumber(record.yieldGapStateMinimized, 0),
        yieldGapPotentialMinimized: toNumber(record.yieldGapPotentialMinimized, 0),
        percentIncrease: toNumber(record.percentIncrease, 0),
        generalM: toNumber(record.generalM, 0),
        generalF: toNumber(record.generalF, 0),
        obcM: toNumber(record.obcM, 0),
        obcF: toNumber(record.obcF, 0),
        scM: toNumber(record.scM, 0),
        scF: toNumber(record.scF, 0),
        stM: toNumber(record.stM, 0),
        stF: toNumber(record.stF, 0),
        existingPlotGrossCost: economic.existingPlotGrossCost ?? record.existingPlotGrossCost,
        existingPlotGrossReturn: economic.existingPlotGrossReturn ?? record.existingPlotGrossReturn,
        existingPlotNetReturn: economic.existingPlotNetReturn ?? record.existingPlotNetReturn,
        existingPlotBcr: economic.existingPlotBcr ?? record.existingPlotBcr,
        demonstrationPlotGrossCost: economic.demonstrationPlotGrossCost ?? record.demonstrationPlotGrossCost,
        demonstrationPlotGrossReturn: economic.demonstrationPlotGrossReturn ?? record.demonstrationPlotGrossReturn,
        demonstrationPlotNetReturn: economic.demonstrationPlotNetReturn ?? record.demonstrationPlotNetReturn,
        demonstrationPlotBcr: economic.demonstrationPlotBcr ?? record.demonstrationPlotBcr,
        additionalIncome: economic.additionalIncome ?? record.additionalIncome,
        totalProduceObtainedKg: socio.totalProduceObtainedKg ?? record.totalProduceObtainedKg,
        produceSoldKgPerHousehold: socio.produceSoldKgPerHousehold ?? record.produceSoldKgPerHousehold,
        sellingRateRsPerKg: socio.sellingRateRsPerKg ?? record.sellingRateRsPerKg,
        produceUsedForOwnSowingKg: socio.produceUsedForOwnSowingKg ?? record.produceUsedForOwnSowingKg,
        produceDistributedToOtherFarmersKg: socio.produceDistributedToOtherFarmersKg ?? record.produceDistributedToOtherFarmersKg,
        incomeUtilizationPurpose: socio.incomeUtilizationPurpose ?? record.incomeUtilizationPurpose,
        employmentGeneratedMandaysPerHousehold: socio.employmentGeneratedMandaysPerHousehold ?? record.employmentGeneratedMandaysPerHousehold,
        suitabilityToFarmingSystem: perception.suitabilityToFarmingSystem ?? record.suitabilityToFarmingSystem,
        likingPreference: perception.likingPreference ?? record.likingPreference,
        affordability: perception.affordability ?? record.affordability,
        anyNegativeEffect: perception.anyNegativeEffect ?? record.anyNegativeEffect,
        technologyAcceptableToAllGroupVillage: perception.technologyAcceptableToAllGroupVillage ?? record.technologyAcceptableToAllGroupVillage,
        suggestionsForChangeOrImprovementIfAny: perception.suggestionsForChangeOrImprovementIfAny ?? record.suggestionsForChangeOrImprovementIfAny,
        farmerFeedback: perception.farmerFeedback ?? record.farmerFeedback,
        trainingPhotoPath: record.trainingPhotoPath || null,
        qualityActionPhotoPath: record.qualityActionPhotoPath || null,
        targetAreaHa: toNumber(record.targetAreaHa, 0),
        targetDemonstrations: toNumber(record.targetDemonstrations || record.targetNoDemonstration, 0),
    };
}

function renderCfldTable(headersHtml, rowsHtml) {
    return `
    <table class="data-table" style="margin-top:8px;margin-bottom:16px;">
        <thead>${headersHtml}</thead>
        <tbody>${rowsHtml}</tbody>
    </table>`;
}

function renderTechnicalTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="3">S.No.</th>
            <th rowspan="3">Crop Season</th>
            <th rowspan="3">Name of crop demonstrated</th>
            <th rowspan="3">Area (ha)</th>
            <th colspan="10">Number of farmers</th>
            <th rowspan="3">Detail of technology demonstrated</th>
            <th rowspan="3">Detail of existing farmer practice</th>
            <th rowspan="3">Yield (q/ha) in farmer field</th>
            <th colspan="3">Yield obtained in demonstration (q/ha)</th>
            <th rowspan="3">Yield gap (Kg/ha) w.r.to</th>
            <th colspan="3">Yield gap minimized (%)</th>
            <th rowspan="3">% Increase</th>
        </tr>
        <tr>
            <th colspan="2">General</th>
            <th colspan="2">OBC</th>
            <th colspan="2">SC</th>
            <th colspan="2">ST</th>
            <th colspan="2">Total</th>
            <th rowspan="2">Max</th>
            <th rowspan="2">Min.</th>
            <th rowspan="2">Av.</th>
            <th rowspan="2">D</th>
            <th rowspan="2">S</th>
            <th rowspan="2">P</th>
        </tr>
        <tr>
            <th>M</th><th>F</th>
            <th>M</th><th>F</th>
            <th>M</th><th>F</th>
            <th>M</th><th>F</th>
            <th>M</th><th>F</th>
        </tr>`;

    const rows = records.map((record, index) => {
        const totalM = record.generalM + record.obcM + record.scM + record.stM;
        const totalF = record.generalF + record.obcF + record.scF + record.stF;
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${ctx._escapeHtml(record.seasonName)}</td>
                <td>${ctx._escapeHtml(record.cropName)}</td>
                <td>${formatNumber(record.areaInHa)}</td>
                <td>${record.generalM}</td><td>${record.generalF}</td>
                <td>${record.obcM}</td><td>${record.obcF}</td>
                <td>${record.scM}</td><td>${record.scF}</td>
                <td>${record.stM}</td><td>${record.stF}</td>
                <td>${totalM}</td><td>${totalF}</td>
                <td>${ctx._escapeHtml(record.technologyDemonstrated)}</td>
                <td>${ctx._escapeHtml(record.existingFarmerPractice)}</td>
                <td>${formatNumber(record.farmerYield)}</td>
                <td>${formatNumber(record.demoYieldMax)}</td>
                <td>${formatNumber(record.demoYieldMin)}</td>
                <td>${formatNumber(record.demoYieldAvg)}</td>
                <td>${formatNumber(record.districtYield)}</td>
                <td>${formatNumber(record.yieldGapDistrictMinimized)}</td>
                <td>${formatNumber(record.yieldGapStateMinimized)}</td>
                <td>${formatNumber(record.yieldGapPotentialMinimized)}</td>
                <td>${formatNumber(record.percentIncrease)}</td>
            </tr>`;
    }).join('');

    return renderCfldTable(headers, rows);
}

function renderEconomicTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2">S.No.</th>
            <th rowspan="2">Detail of technology demonstrated</th>
            <th colspan="4">Farmer's existing practice</th>
            <th colspan="4">Demonstration technology</th>
            <th rowspan="2">Additional Income (Rs/ha)</th>
        </tr>
        <tr>
            <th>Gross Cost (Rs/ha)</th>
            <th>Gross return (Rs/ha)</th>
            <th>Net Return (Rs/ha)</th>
            <th>B:C ratio</th>
            <th>Gross Cost (Rs/ha)</th>
            <th>Gross return (Rs/ha)</th>
            <th>Net Return (Rs/ha)</th>
            <th>B:C ratio</th>
        </tr>`;
    const rows = records.map((record, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${ctx._escapeHtml(record.technologyDemonstrated)}</td>
            <td>${formatNumber(record.existingPlotGrossCost)}</td>
            <td>${formatNumber(record.existingPlotGrossReturn)}</td>
            <td>${formatNumber(record.existingPlotNetReturn)}</td>
            <td>${formatNumber(record.existingPlotBcr)}</td>
            <td>${formatNumber(record.demonstrationPlotGrossCost)}</td>
            <td>${formatNumber(record.demonstrationPlotGrossReturn)}</td>
            <td>${formatNumber(record.demonstrationPlotNetReturn)}</td>
            <td>${formatNumber(record.demonstrationPlotBcr)}</td>
            <td>${formatNumber(record.additionalIncome)}</td>
        </tr>
    `).join('');
    return renderCfldTable(headers, rows);
}

function renderSocioTable(ctx, records) {
    const headers = `
        <tr>
            <th>S.No.</th>
            <th>Name of crop demonstrated</th>
            <th>Total produce obtained (kg)</th>
            <th>Produce sold (Kg/household)</th>
            <th>Selling Rate (Rs/Kg)</th>
            <th>Produce used for own their own farm (Kg)</th>
            <th>Produce distributed to other farmers (Kg)</th>
            <th>Purpose for which income gained was utilized</th>
            <th>Employment Generated (Mandays/house hold)</th>
        </tr>`;
    const rows = records.map((record, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${ctx._escapeHtml(record.cropName)}</td>
            <td>${formatNumber(record.totalProduceObtainedKg)}</td>
            <td>${formatNumber(record.produceSoldKgPerHousehold)}</td>
            <td>${formatNumber(record.sellingRateRsPerKg)}</td>
            <td>${formatNumber(record.produceUsedForOwnSowingKg)}</td>
            <td>${formatNumber(record.produceDistributedToOtherFarmersKg)}</td>
            <td>${ctx._escapeHtml(record.incomeUtilizationPurpose || '-')}</td>
            <td>${formatNumber(record.employmentGeneratedMandaysPerHousehold)}</td>
        </tr>
    `).join('');
    return renderCfldTable(headers, rows);
}

function renderPerceptionTable(ctx, records) {
    const headers = `
        <tr>
            <th rowspan="2">S.No.</th>
            <th rowspan="2">Detail of technologies demonstrated</th>
            <th colspan="7">Farmers' Perception parameters</th>
        </tr>
        <tr>
            <th>Suitability of technology to their farming system</th>
            <th>Liking (Preference)</th>
            <th>Affordability (%)</th>
            <th>Any negative effect</th>
            <th>Is Technology acceptable to all in the group/village</th>
            <th>Suggestions, for change/improvement, if any</th>
            <th>Farmer feedback</th>
        </tr>`;
    const rows = records.map((record, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${ctx._escapeHtml(record.technologyDemonstrated)}</td>
            <td>${ctx._escapeHtml(record.suitabilityToFarmingSystem || '-')}</td>
            <td>${ctx._escapeHtml(record.likingPreference || '-')}</td>
            <td>${ctx._escapeHtml(record.affordability || '-')}</td>
            <td>${ctx._escapeHtml(record.anyNegativeEffect || '-')}</td>
            <td>${ctx._escapeHtml(record.technologyAcceptableToAllGroupVillage || '-')}</td>
            <td>${ctx._escapeHtml(record.suggestionsForChangeOrImprovementIfAny || '-')}</td>
            <td>${ctx._escapeHtml(record.farmerFeedback || '-')}</td>
        </tr>
    `).join('');
    return renderCfldTable(headers, rows);
}

function renderKvkLayout(ctx, records) {
    const sorted = [...records].sort((a, b) => {
        const s = seasonOrder(a.seasonName) - seasonOrder(b.seasonName);
        if (s !== 0) return s;
        return String(a.cropName || '').localeCompare(String(b.cropName || ''));
    });

    return `
        <h2 class="about-kvk-heading">PERFORMANCE OF THE DEMONSTRATION UNDER CFLD ON PULSE AND OILSEED CROPS (CFLD)</h2>
        <p style="margin-bottom:12px;"><strong>(During Kharif, Rabi and Summer)</strong></p>
        <h3 class="about-kvk-subheading">1. Technical Parameters:</h3>
        ${renderTechnicalTable(ctx, sorted)}
        <h3 class="about-kvk-subheading">2. Economic parameters:</h3>
        ${renderEconomicTable(ctx, sorted)}
        <h3 class="about-kvk-subheading">3. Socio-economic impact parameters:</h3>
        ${renderSocioTable(ctx, sorted)}
        <h3 class="about-kvk-subheading">4. Pulses/Oilseed Farmers' perception of the intervention demonstrated</h3>
        ${renderPerceptionTable(ctx, sorted)}
    `;
}

function seasonOrder(name) {
    const key = String(name || '').toLowerCase();
    if (key.includes('kharif')) return 1;
    if (key.includes('rabi')) return 2;
    if (key.includes('summer')) return 3;
    return 9;
}

function groupBy(items, getKey) {
    const map = new Map();
    items.forEach(item => {
        const key = getKey(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    });
    return map;
}

function aggregateRows(records) {
    const area = records.reduce((sum, r) => sum + toNumber(r.areaInHa, 0), 0);
    const targetArea = records.reduce((sum, r) => sum + toNumber(r.targetAreaHa, 0), 0);
    const targetDemo = records.reduce((sum, r) => sum + toNumber(r.targetDemonstrations, 0), 0);
    const achDemo = records.length;
    const localYield = avg(records.map(r => r.farmerYield));
    const demoYield = avg(records.map(r => r.demoYieldAvg));
    const increase = avg(records.map(r => r.percentIncrease));
    const diff = avg(records.map(r => toNumber(r.demoYieldAvg, 0) - toNumber(r.farmerYield, 0)));
    return {
        targetArea,
        targetDemo,
        achArea: area,
        achDemo,
        localYield,
        demoYield,
        increase,
        diff,
    };
}

function renderStateWiseTable(ctx, records) {
    const byState = groupBy(records, r => r.stateName || 'Unknown');
    const rows = Array.from(byState.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([state, group], index) => {
            const agg = aggregateRows(group);
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${ctx._escapeHtml(state)}</td>
                    <td>${formatNumber(agg.targetArea)}</td>
                    <td>${formatNumber(agg.targetDemo)}</td>
                    <td>${formatNumber(agg.achArea)}</td>
                    <td>${formatNumber(agg.achDemo)}</td>
                    <td>${formatNumber(agg.localYield)}</td>
                    <td>${formatNumber(agg.demoYield)}</td>
                    <td>${formatNumber(agg.increase)}</td>
                    <td>${formatNumber(agg.diff)}</td>
                </tr>`;
        }).join('');

    const total = aggregateRows(records);
    const headers = `
        <tr>
            <th>S.No.</th>
            <th>State</th>
            <th colspan="2">Target of CFLD Approved</th>
            <th colspan="2">Achievement of CFLD</th>
            <th colspan="2">Yield(q/ha)</th>
            <th>Yield Increased(%)</th>
            <th>Average difference of yield between Demo and Local (q/ha)</th>
        </tr>
        <tr>
            <th></th><th></th>
            <th>Area (ha)</th>
            <th>No. of Demonstration</th>
            <th>Area (ha)</th>
            <th>No. of Demonstration</th>
            <th>Local</th>
            <th>Demo</th>
            <th></th>
            <th></th>
        </tr>`;
    const totalRow = `
        <tr style="font-weight:700;">
            <td colspan="2">Grand Total</td>
            <td>${formatNumber(total.targetArea)}</td>
            <td>${formatNumber(total.targetDemo)}</td>
            <td>${formatNumber(total.achArea)}</td>
            <td>${formatNumber(total.achDemo)}</td>
            <td>${formatNumber(total.localYield)}</td>
            <td>${formatNumber(total.demoYield)}</td>
            <td>${formatNumber(total.increase)}</td>
            <td>${formatNumber(total.diff)}</td>
        </tr>`;
    return renderCfldTable(headers, `${rows}${totalRow}`);
}

function renderSeasonWiseTable(ctx, records) {
    const byCrop = groupBy(records, r => r.cropName || 'Unknown Crop');
    let counter = 0;
    let rows = '';
    byCrop.forEach((cropRecords, cropName) => {
        const byState = groupBy(cropRecords, r => r.stateName || 'Unknown');
        Array.from(byState.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([state, stateRecords], idx) => {
                counter += 1;
                const agg = aggregateRows(stateRecords);
                rows += `
                    <tr>
                        <td>${idx === 0 ? counter : ''}</td>
                        <td>${idx === 0 ? ctx._escapeHtml(cropName) : ''}</td>
                        <td>${ctx._escapeHtml(state)}</td>
                        <td>${formatNumber(agg.targetArea)}</td>
                        <td>${formatNumber(agg.targetDemo)}</td>
                        <td>${formatNumber(agg.achArea)}</td>
                        <td>${formatNumber(agg.achDemo)}</td>
                        <td>${formatNumber(agg.localYield)}</td>
                        <td>${formatNumber(agg.demoYield)}</td>
                        <td>${formatNumber(agg.increase)}</td>
                        <td>${formatNumber(agg.diff)}</td>
                    </tr>`;
            });

        const cropTotal = aggregateRows(cropRecords);
        rows += `
            <tr style="font-weight:700;">
                <td></td>
                <td colspan="2">Total</td>
                <td>${formatNumber(cropTotal.targetArea)}</td>
                <td>${formatNumber(cropTotal.targetDemo)}</td>
                <td>${formatNumber(cropTotal.achArea)}</td>
                <td>${formatNumber(cropTotal.achDemo)}</td>
                <td>${formatNumber(cropTotal.localYield)}</td>
                <td>${formatNumber(cropTotal.demoYield)}</td>
                <td>${formatNumber(cropTotal.increase)}</td>
                <td>${formatNumber(cropTotal.diff)}</td>
            </tr>`;
    });

    const total = aggregateRows(records);
    rows += `
        <tr style="font-weight:700;">
            <td colspan="3">Grand Total</td>
            <td>${formatNumber(total.targetArea)}</td>
            <td>${formatNumber(total.targetDemo)}</td>
            <td>${formatNumber(total.achArea)}</td>
            <td>${formatNumber(total.achDemo)}</td>
            <td>${formatNumber(total.localYield)}</td>
            <td>${formatNumber(total.demoYield)}</td>
            <td>${formatNumber(total.increase)}</td>
            <td>${formatNumber(total.diff)}</td>
        </tr>`;

    const headers = `
        <tr>
            <th>S.No.</th>
            <th>Crop</th>
            <th>State</th>
            <th colspan="2">Target of CFLD Approved</th>
            <th colspan="2">Achievement of CFLD</th>
            <th colspan="2">Yield(q/ha)</th>
            <th>Yield Increased(%)</th>
            <th>Average difference of yield between Demo and Local (q/ha)</th>
        </tr>
        <tr>
            <th></th><th></th><th></th>
            <th>Area (ha)</th>
            <th>No. of Demonstration</th>
            <th>Area (ha)</th>
            <th>No. of Demonstration</th>
            <th>Local</th>
            <th>Demo</th>
            <th></th><th></th>
        </tr>`;
    return renderCfldTable(headers, rows);
}

function renderSuperAdminLayout(ctx, records) {
    const byCropType = groupBy(records, r => r.cropTypeName || 'Unknown Crop Type');
    const cropTypeSections = Array.from(byCropType.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([cropType, cropTypeRecords], cropIndex) => {
            const bySeason = groupBy(cropTypeRecords, r => r.seasonName || 'Unknown');
            const seasonSections = Array.from(bySeason.entries())
                .sort((a, b) => seasonOrder(a[0]) - seasonOrder(b[0]) || a[0].localeCompare(b[0]))
                .map(([season, seasonRecords]) => `
                    <h3 class="about-kvk-subheading">Cluster Front Line Demonstration on ${ctx._escapeHtml(season)}</h3>
                    ${renderSeasonWiseTable(ctx, seasonRecords)}
                `)
                .join('');

            return `
                <div class="about-kvk-report">
                    <h2 class="about-kvk-heading">${cropIndex + 1}. ${ctx._escapeHtml(cropType)}</h2>
                    <h3 class="about-kvk-subheading">A. State-wise subsection</h3>
                    <h3 class="about-kvk-subheading">State wise details of Cluster Front Line Demonstration</h3>
                    ${renderStateWiseTable(ctx, cropTypeRecords)}
                    <h3 class="about-kvk-subheading">B. Season-wise subsection</h3>
                    ${seasonSections}
                </div>
            `;
        })
        .join('');

    return `
        <h2 class="about-kvk-heading">3. Cluster Front Line Demonstration on</h2>
        ${cropTypeSections}
    `;
}

function renderCfldCombinedSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    const records = rows.map(normalizeRecord);
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const uniqueStates = new Set(records.map(r => r.stateName).filter(Boolean));
    const uniqueKvks = new Set(records.map(r => r.kvkName).filter(Boolean));
    // Explicit context-based switch keeps module export and all-report behavior stable/reusable.
    const isSuperAdminStyle = Boolean(reportContext?.isAggregatedReport) || uniqueStates.size > 1 || uniqueKvks.size > 1;
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const content = isSuperAdminStyle ? renderSuperAdminLayout(this, records) : renderKvkLayout(this, records);

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    ${content}
</div>`;
}

module.exports = {
    renderCfldCombinedSection,
};
