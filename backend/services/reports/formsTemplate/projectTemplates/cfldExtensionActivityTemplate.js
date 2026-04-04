function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function renderCfldExtensionActivitySection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const totals = {
        generalM: 0, generalF: 0,
        obcM: 0, obcF: 0,
        scM: 0, scF: 0,
        stM: 0, stF: 0,
        totalM: 0, totalF: 0, totalT: 0,
    };

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

        totals.generalM += generalM;
        totals.generalF += generalF;
        totals.obcM += obcM;
        totals.obcF += obcF;
        totals.scM += scM;
        totals.scF += scF;
        totals.stM += stM;
        totals.stF += stF;
        totals.totalM += totalM;
        totals.totalF += totalF;
        totals.totalT += totalT;

        const extensionActivityLabel = row.extensionActivityName
            || row.extensionActivityOrganized
            || row.extensionActivitiesOrganized
            || row.extensionActivity?.extensionName
            || '-';

        const dateAndPlace = `${formatDate(row.activityDate || row.date)} and ${row.placeOfActivity || '-'}`;

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${this._escapeHtml(extensionActivityLabel)}</td>
                <td>${this._escapeHtml(dateAndPlace)}</td>
                <td>${generalM}</td><td>${generalF}</td><td>${generalT}</td>
                <td>${obcM}</td><td>${obcF}</td><td>${obcT}</td>
                <td>${scM}</td><td>${scF}</td><td>${scT}</td>
                <td>${stM}</td><td>${stF}</td><td>${stT}</td>
                <td>${totalM}</td><td>${totalF}</td><td>${totalT}</td>
            </tr>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h3 class="about-kvk-subheading">C. Extension activities under CFLD conducted :</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th rowspan="3">S.No.</th>
                <th rowspan="3">Extension Activities organized</th>
                <th rowspan="3">Date and place of activity</th>
                <th colspan="15">Number of farmers</th>
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
            <tr style="font-weight:700;">
                <td colspan="3">Total</td>
                <td>${totals.generalM}</td><td>${totals.generalF}</td><td>${totals.generalM + totals.generalF}</td>
                <td>${totals.obcM}</td><td>${totals.obcF}</td><td>${totals.obcM + totals.obcF}</td>
                <td>${totals.scM}</td><td>${totals.scF}</td><td>${totals.scM + totals.scF}</td>
                <td>${totals.stM}</td><td>${totals.stF}</td><td>${totals.stM + totals.stF}</td>
                <td>${totals.totalM}</td><td>${totals.totalF}</td><td>${totals.totalT}</td>
            </tr>
        </tbody>
    </table>
</div>`;
}

module.exports = {
    renderCfldExtensionActivitySection,
};
