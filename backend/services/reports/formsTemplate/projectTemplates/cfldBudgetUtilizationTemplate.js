function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
    const n = toNumber(value);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function resolveItemValue(items, matcher) {
    const found = (items || []).find(item => matcher((item.itemName || '').toLowerCase()));
    if (!found) {
        return { budgetReceived: 0, budgetUtilized: 0, balance: 0 };
    }
    return {
        budgetReceived: toNumber(found.budgetReceived),
        budgetUtilized: toNumber(found.budgetUtilized),
        balance: toNumber(found.balance),
    };
}

function getFixedItems(record) {
    const items = record.items || [];
    return [
        {
            label: 'Critical input',
            ...resolveItemValue(items, name => name.includes('critical input')),
        },
        {
            label: 'TA/DA/POL etc. for monitoring',
            ...resolveItemValue(items, name => name.includes('ta/da') || name.includes('ta da') || name.includes('monitor')),
        },
        {
            label: 'Extension Activities (Field Day)',
            ...resolveItemValue(items, name => name.includes('extension')),
        },
        {
            label: 'Publication of literature',
            ...resolveItemValue(items, name => name.includes('publication')),
        },
    ];
}

function renderCfldBudgetUtilizationSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const bodyRows = records.map((record, index) => {
        const items = getFixedItems(record);
        return items.map((item, rowIndex) => {
            const sharedColumns = rowIndex === 0
                ? `
                    <td rowspan="4">${index + 1}</td>
                    <td rowspan="4">${this._escapeHtml(record.seasonName || '-')}</td>
                    <td rowspan="4">${this._escapeHtml(record.cropName || '-')}</td>
                    <td rowspan="4">${formatNumber(record.overallFundAllocation)}</td>
                    <td rowspan="4">${formatNumber(record.areaAllotted)}</td>
                    <td rowspan="4">${formatNumber(record.areaAchieved)}</td>
                `
                : '';
            return `
                <tr>
                    ${sharedColumns}
                    <td>${this._escapeHtml(item.label)}</td>
                    <td>${formatNumber(item.budgetReceived)}</td>
                    <td>${formatNumber(item.budgetUtilized)}</td>
                    <td>${formatNumber(item.balance)}</td>
                </tr>
            `;
        }).join('');
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
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
    </table>
</div>`;
}

module.exports = {
    renderCfldBudgetUtilizationSection,
};
