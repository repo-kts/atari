function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

function renderCraExtensionActivitySection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map((row, index) => {
        const generalM = toNumber(row.generalM || row.genM);
        const generalF = toNumber(row.generalF || row.genF);
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
                <td>${this._escapeHtml(row.kvkName || '-')}</td>
                <td>${this._escapeHtml(row.extensionActivityName || row.activityName || '-')}</td>
                <td>${this._escapeHtml(row.withinStateOrOutState || row.withinStateWithoutState || '-')}</td>
                <td>${toNumber(row.exposureVisitNo || row.exposureVisit)}</td>
                <td>${this._escapeHtml(formatDate(row.startDate))}</td>
                <td>${this._escapeHtml(formatDate(row.endDate))}</td>
                <td>${generalM}</td><td>${generalF}</td><td>${generalT}</td>
                <td>${obcM}</td><td>${obcF}</td><td>${obcT}</td>
                <td>${scM}</td><td>${scF}</td><td>${scT}</td>
                <td>${stM}</td><td>${stF}</td><td>${stT}</td>
                <td>${totalM}</td><td>${totalF}</td><td>${totalT}</td>
            </tr>
        `;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .cra-ext-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .cra-ext-table th, .cra-ext-table td { padding: 2px 3px !important; font-size: 6.8pt !important; line-height: 1.15; word-break: break-word; }
        .cra-ext-table thead th { text-align: center; vertical-align: middle; }
    </style>
    <table class="data-table cra-ext-table">
        <thead>
            <tr>
                <th rowspan="3">Sl.no.</th>
                <th rowspan="3">KVK</th>
                <th rowspan="3">Name of Extension Activity</th>
                <th rowspan="3">Within State/Out of State</th>
                <th rowspan="3">Exposure visit (no.)</th>
                <th rowspan="3">Start Date</th>
                <th rowspan="3">End Date</th>
                <th colspan="15">Number of farmers under exposure</th>
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

module.exports = {
    renderCraExtensionActivitySection,
};
