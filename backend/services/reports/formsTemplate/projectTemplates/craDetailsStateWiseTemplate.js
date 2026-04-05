function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function toLabel(index) {
    return `${String.fromCharCode(65 + index)}.`;
}

function groupByState(records) {
    const map = new Map();
    records.forEach(record => {
        const stateName = record.stateName || record.state?.stateName || 'State not mapped';
        if (!map.has(stateName)) {
            map.set(stateName, []);
        }
        map.get(stateName).push(record);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function renderStateTable(ctx, rows) {
    const bodyRows = rows.map((row, index) => {
        const generalM = toNumber(row.generalM);
        const generalF = toNumber(row.generalF);
        const obcM = toNumber(row.obcM);
        const obcF = toNumber(row.obcF);
        const scM = toNumber(row.scM);
        const scF = toNumber(row.scF);
        const stM = toNumber(row.stM);
        const stF = toNumber(row.stF);

        const generalT = generalM + generalF;
        const obcT = obcM + obcF;
        const scT = scM + scF;
        const stT = stM + stF;
        const totalM = generalM + obcM + scM + stM;
        const totalF = generalF + obcF + scF + stF;
        const totalT = totalM + totalF;

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${ctx._escapeHtml(row.seasonName || row.season || '-')}</td>
                <td>${ctx._escapeHtml(row.interventions || row.technologyDemonstrated || '-')}</td>
                <td>${ctx._escapeHtml(row.croppingSystem || row.cropingSystem || '-')}</td>
                <td>${ctx._escapeHtml(row.farmingSystemName || '-')}</td>
                <td>${toNumber(row.areaInAcre)}</td>
                <td>${toNumber(row.cropYield)}</td>
                <td>${toNumber(row.systemProductivity)}</td>
                <td>${toNumber(row.totalReturn)}</td>
                <td>${toNumber(row.farmerPracticeYield)}</td>
                <td>${generalM}</td><td>${generalF}</td><td>${generalT}</td>
                <td>${obcM}</td><td>${obcF}</td><td>${obcT}</td>
                <td>${scM}</td><td>${scF}</td><td>${scT}</td>
                <td>${stM}</td><td>${stF}</td><td>${stT}</td>
                <td>${totalM}</td><td>${totalF}</td><td>${totalT}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="cra-table-wrap">
        <table class="data-table cra-details-table">
            <colgroup>
                <col style="width: 3%">
                <col style="width: 4%">
                <col style="width: 11%">
                <col style="width: 9%">
                <col style="width: 6%">
                <col style="width: 4%">
                <col style="width: 3%">
                <col style="width: 4%">
                <col style="width: 4%">
                <col style="width: 4%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
                <col style="width: 2%">
            </colgroup>
            <thead>
                <tr>
                    <th rowspan="3">Sl. no.</th>
                    <th rowspan="3">Season</th>
                    <th rowspan="3">Technology demonstrated / interventions</th>
                    <th rowspan="3">Cropping system</th>
                    <th rowspan="3">Farming system crop under demonstration</th>
                    <th rowspan="3">Area under demonstration (in ac)</th>
                    <th rowspan="3">Crop yield (q/ha)</th>
                    <th rowspan="3">System productivity (q/ha)</th>
                    <th rowspan="3">Total return (Rs./ha)</th>
                    <th rowspan="3">Yield obtained under farmer practice (q/ha)</th>
                    <th colspan="15">No. of farmers under demonstration</th>
                </tr>
                <tr>
                    <th colspan="3">General</th>
                    <th colspan="3">OBC</th>
                    <th colspan="3">SC</th>
                    <th colspan="3">ST</th>
                    <th colspan="3">Total</th>
                </tr>
                <tr>
                    <th>M</th><th>F</th><th>T</th>
                    <th>M</th><th>F</th><th>T</th>
                    <th>M</th><th>F</th><th>T</th>
                    <th>M</th><th>F</th><th>T</th>
                    <th>M</th><th>F</th><th>T</th>
                </tr>
            </thead>
            <tbody>
                ${bodyRows}
            </tbody>
        </table>
        </div>
    `;
}

function renderCraDetailsStateWiseSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const stateGroups = groupByState(rows);

    const groupedHtml = stateGroups.map(([stateName, stateRows], index) => `
        <h3 class="about-kvk-subheading">${toLabel(index)} State: ${this._escapeHtml(stateName)}</h3>
        ${renderStateTable(this, stateRows)}
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .cra-table-wrap { width: 100%; overflow: visible; }
        .cra-details-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .cra-details-table th, .cra-details-table td { padding: 2px 3px !important; font-size: 6.6pt !important; line-height: 1.15; word-break: break-word; }
        .cra-details-table thead th { text-align: center; vertical-align: middle; }
    </style>
    ${groupedHtml}
</div>
`;
}

module.exports = {
    renderCraDetailsStateWiseSection,
};
