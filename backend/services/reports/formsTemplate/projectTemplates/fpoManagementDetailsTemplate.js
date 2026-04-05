function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
}

function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderFpoManagementDetailsSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = rows.map((row, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${this._escapeHtml(row.fpoName || '-')}</td>
            <td>${this._escapeHtml(row.address || row.fpoAddress || '-')}</td>
            <td>${this._escapeHtml(row.registrationNumber || row.registrationNo || '-')}</td>
            <td>${this._escapeHtml(formatDate(row.registrationDate))}</td>
            <td>${this._escapeHtml(row.proposedActivity || '-')}</td>
            <td>${this._escapeHtml(row.commodityIdentified || '-')}</td>
            <td>${toNumber(row.totalBomMembers || row.bomMembersCount)}</td>
            <td>${toNumber(row.totalFarmersAttached || row.farmersAttachedCount)}</td>
            <td>${this._escapeHtml(formatMoney(row.financialPositionLakh || row.financialPosition))}</td>
            <td>${this._escapeHtml(row.successIndicator || '-')}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <style>
        .fpo-mgmt-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .fpo-mgmt-table th, .fpo-mgmt-table td { padding: 2px 3px !important; font-size: 6.9pt !important; line-height: 1.15; word-break: break-word; }
        .fpo-mgmt-table thead th { text-align: center; vertical-align: middle; }
    </style>
    <table class="data-table fpo-mgmt-table">
        <thead>
            <tr>
                <th>Sr.No.</th>
                <th>Name of the FPO</th>
                <th>Address of FPO</th>
                <th>Registration No</th>
                <th>Date of Registration</th>
                <th>Proposed Activity</th>
                <th>Commodity identified</th>
                <th>Total No. of BOM Members</th>
                <th>Total no of farmers attached</th>
                <th>Financial position (Rupees in lakh)</th>
                <th>Success indicator</th>
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
    renderFpoManagementDetailsSection,
};
