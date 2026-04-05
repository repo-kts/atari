function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatNum(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
}

function renderDrmrDetailsSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map(row => `
        <tr>
            <td>${this._escapeHtml(row.kvkName || '-')}</td>
            <td>${this._escapeHtml(row.varietiesUsedInIp || row.varietyImprovedPractice || '-')}</td>
            <td>${this._escapeHtml(row.situation || row.situations || '-')}</td>
            <td>${this._escapeHtml(row.varietiesUsedInFp || row.varietyFarmerPractice || '-')}</td>
            <td>${formatNum(row.yieldImprovedKgPerHa || row.yieldImproved)}</td>
            <td>${formatNum(row.yieldFarmerKgPerHa || row.yieldFarmerPractise)}</td>
            <td>${formatNum(row.yieldIncreasePercent)}</td>
            <td>${formatNum(row.costImprovedPerHa || row.costImproved)}</td>
            <td>${formatNum(row.costFarmerPerHa || row.costFarmerPractise)}</td>
            <td>${formatNum(row.grossReturnImprovedPerHa || row.grossReturnImproved)}</td>
            <td>${formatNum(row.grossReturnFarmerPerHa || row.grossReturnFarmerPractise)}</td>
            <td>${formatNum(row.netReturnImprovedPerHa || row.netReturnImproved)}</td>
            <td>${formatNum(row.netReturnFarmerPerHa || row.netReturnFarmerPractise)}</td>
            <td>${formatNum(row.bcRatioImproved)}</td>
            <td>${formatNum(row.bcRatioFarmer || row.bcRatioFarmerPractise)}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .drmr-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .drmr-table th, .drmr-table td { padding: 2px 3px !important; font-size: 6.8pt !important; line-height: 1.15; word-break: break-word; }
        .drmr-table thead th { text-align: center; vertical-align: middle; }
    </style>
    <table class="data-table drmr-table">
        <thead>
            <tr>
                <th rowspan="2">Name of KVK</th>
                <th rowspan="2">Varieties used in IP</th>
                <th rowspan="2">Situations (Irrigated/Rainfed)</th>
                <th rowspan="2">Varieties used in FP</th>
                <th colspan="2">Yield (Kg/ha)</th>
                <th rowspan="2">YIOFP (%)</th>
                <th colspan="2">COC (Rs./ha)</th>
                <th colspan="2">GMR (Rs./ha)</th>
                <th colspan="2">ANMR (Rs./ha)</th>
                <th colspan="2">B:C ratio GMR/COC</th>
            </tr>
            <tr>
                <th>IP</th><th>FP</th>
                <th>IP</th><th>FP</th>
                <th>IP</th><th>FP</th>
                <th>IP</th><th>FP</th>
                <th>IP</th><th>FP</th>
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
    renderDrmrDetailsSection,
};
