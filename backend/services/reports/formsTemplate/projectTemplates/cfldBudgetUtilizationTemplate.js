function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
    const n = toNumber(value);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function groupBy(items, getKey) {
    const map = new Map();
    items.forEach((item) => {
        const key = getKey(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    });
    return map;
}

// A budget record holds many items (Critical Input, TA/DA, …), each with its
// own received/utilized. The form repo maps these to `budgetItems`; older/raw
// payloads may use `items`. Read either and derive balance.
function getDynamicItems(record) {
    const srcItems = (Array.isArray(record.items) && record.items.length > 0)
        ? record.items
        : (Array.isArray(record.budgetItems) ? record.budgetItems : []);

    if (srcItems.length === 0) {
        return [{ label: '-', budgetReceived: 0, budgetUtilized: 0, balance: 0 }];
    }

    return srcItems.map((item) => {
        const budgetReceived = toNumber(item.budgetReceived ?? item.received);
        const budgetUtilized = toNumber(item.budgetUtilized ?? item.budgetUtilised ?? item.utilized);
        const balance = toNumber(item.balance ?? (budgetReceived - budgetUtilized));
        return {
            label: item.itemName || item.label || '-',
            budgetReceived,
            budgetUtilized,
            balance,
        };
    });
}

function renderBudgetTable(ctx, records) {
    const bodyRows = records.map((record, index) => {
        const items = getDynamicItems(record);
        const rowSpan = items.length;
        return items.map((item, rowIndex) => {
            const sharedColumns = rowIndex === 0
                ? `
                    <td rowspan="${rowSpan}">${index + 1}</td>
                    <td rowspan="${rowSpan}">${ctx._escapeHtml(record.seasonName || '-')}</td>
                    <td rowspan="${rowSpan}">${ctx._escapeHtml(record.cropName || '-')}</td>
                    <td rowspan="${rowSpan}">${formatNumber(record.overallFundAllocation)}</td>
                    <td rowspan="${rowSpan}">${formatNumber(record.areaAllotted)}</td>
                    <td rowspan="${rowSpan}">${formatNumber(record.areaAchieved)}</td>
                `
                : '';
            return `
                <tr>
                    ${sharedColumns}
                    <td>${ctx._escapeHtml(item.label)}</td>
                    <td>${formatNumber(item.budgetReceived)}</td>
                    <td>${formatNumber(item.budgetUtilized)}</td>
                    <td>${formatNumber(item.balance)}</td>
                </tr>
            `;
        }).join('');
    }).join('');

    return `
    <table class="data-table">
        <thead>
            <tr>
                <th>SL.</th>
                <th>Season</th>
                <th>Crop (Provide crop wise information)</th>
                <th>Overall fund allocation</th>
                <th>Area (ha) alloted</th>
                <th>Area (ha) achieved</th>
                <th>Items</th>
                <th>Budget Received (Rs.)</th>
                <th>Budget Utilization (Rs.)</th>
                <th>Balance (Rs.)</th>
            </tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>`;
}

function renderCfldBudgetUtilizationSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const uniqueKvks = new Set(records.map((r) => r.kvkName).filter(Boolean));
    // Admin / super-admin → group KVK-wise (one "KVK: X" block per KVK) like
    // Other Extension Activities. A single KVK user gets a plain table.
    const isAdminStyle = Boolean(reportContext?.isAggregatedReport) || uniqueKvks.size > 1;

    const content = isAdminStyle
        ? Array.from(groupBy(records, (r) => r.kvkName || 'Unknown KVK').entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([kvk, kvkRecords]) => `
                <h2 class="about-kvk-heading" style="margin-top:14px;">KVK: ${this._escapeHtml(kvk)}</h2>
                ${renderBudgetTable(this, kvkRecords)}
            `).join('')
        : renderBudgetTable(this, records);

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    ${content}
</div>`;
}

module.exports = {
    renderCfldBudgetUtilizationSection,
};
