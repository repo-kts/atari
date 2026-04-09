const prisma = require('../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate && filters.endDate) {
        where.AND = [
            { startDate: { lte: new Date(filters.endDate) } },
            { endDate: { gte: new Date(filters.startDate) } },
        ];
    } else if (filters.year) {
        const yearStr = String(filters.year);
        const yStart = new Date(`${yearStr}-01-01T00:00:00.000Z`);
        const yEnd = new Date(`${yearStr}-12-31T23:59:59.999Z`);
        where.AND = [
            { startDate: { lte: yEnd } },
            { endDate: { gte: yStart } },
        ];
    }

    return where;
}

async function getProjectBudgetReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.projectBudget.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
            projectName: { select: { projectName: true } },
            fundingAgency: { select: { agencyName: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
    });

    return rows.map((r) => {
        const allocated = Number(r.budgetAllocated) || 0;
        const exp = Number(r.expenditure) || 0;
        const displayProject = r.specifyProjectName?.trim()
            || r.projectName?.projectName
            || '—';
        const displayAgency = r.specifyAgencyName?.trim()
            || r.fundingAgency?.agencyName
            || '—';

        return {
            projectBudgetId: r.projectBudgetId,
            kvkId: r.kvkId,
            kvkName: r.kvk?.kvkName || '',
            projectDisplayName: displayProject,
            accountNumber: r.accountNumber || '',
            fundingAgencyDisplay: displayAgency,
            budgetEstimate: r.budgetEstimate,
            budgetAllocated: r.budgetAllocated,
            budgetReleased: r.budgetReleased,
            expenditure: r.expenditure,
            unspentBalance: allocated - exp,
        };
    });
}

module.exports = {
    getProjectBudgetReportData,
};
