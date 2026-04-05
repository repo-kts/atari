function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function renderFpoCbboDetailsSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map((row, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${this._escapeHtml(row.stateName || '-')}</td>
            <td>${this._escapeHtml(row.districtName || '-')}</td>
            <td>${toNumber(row.blocksAllocated)}</td>
            <td>${toNumber(row.fposRegisteredAsCbbo)}</td>
            <td>${toNumber(row.avgMembersPerFpo)}</td>
            <td>${toNumber(row.fposReceivedManagementCost)}</td>
            <td>${toNumber(row.fposReceivedEquityGrant)}</td>
            <td>${toNumber(row.techBackstoppingProvided)}</td>
            <td>${toNumber(row.trainingProgrammeOrganized)}</td>
            <td>${this._escapeHtml(row.trainingReceivedByMembers || '-')}</td>
            <td>${toNumber(row.assistanceInEconomicActivities)}</td>
            <td>${this._escapeHtml(row.businessPlanPreparedWithCbbo || '-')}</td>
            <td>${this._escapeHtml(row.businessPlanPreparedWithoutCbbo || '-')}</td>
            <td>${toNumber(row.fposDoingBusiness)}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .fpo-cbbo-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .fpo-cbbo-table th, .fpo-cbbo-table td { padding: 2px 3px !important; font-size: 6.7pt !important; line-height: 1.15; word-break: break-word; }
        .fpo-cbbo-table thead th { text-align: center; vertical-align: middle; }
    </style>
    <table class="data-table fpo-cbbo-table">
        <thead>
            <tr>
                <th>Sl.no.</th>
                <th>Name of state</th>
                <th>Name of district</th>
                <th>No. of blocks allocated</th>
                <th>No. of FPOs registered as CBBO</th>
                <th>Average no of members per FPO</th>
                <th>No. of FPO received management cost</th>
                <th>No. of FPO received equity grant</th>
                <th>Tech. backstopping provided to no. of FPOs</th>
                <th>No. of training programme organized for FPOs for technology backstopping as CBBO</th>
                <th>Training received by FPO members</th>
                <th>Assistance to no. of FPOs in economic activities</th>
                <th>Is business plan prepared for FPOs as CBBOs</th>
                <th>Is business plan prepared for FPOs as without CBBOs</th>
                <th>No. of FPOs doing business</th>
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
    renderFpoCbboDetailsSection,
};
