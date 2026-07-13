const prisma = require('../../config/prisma.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');
const { assertOtherFieldsValid } = require('../../utils/formRepositoryHelpers.js');

const PROJECT_BUDGET_OTHER_RULES = [
    { idField: 'financialProjectId', otherField: 'specifyProjectName', model: 'financialProject', idKey: 'financialProjectId', label: 'Project name' },
    { idField: 'sourceOfFundingId', otherField: 'specifyAgencyName', model: 'fundingSourceMaster', idKey: 'fundingSourceId', label: 'Source of funding' },
];

const { buildFormListOrderBy } = require('../../utils/formListOrderBy.js');
const projectBudgetRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');
        await assertOtherFieldsValid(PROJECT_BUDGET_OTHER_RULES, data);

        const record = await prisma.projectBudget.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                financialProjectId: parseInt(data.financialProjectId),
                sourceOfFundingId: data.sourceOfFundingId ? parseInt(data.sourceOfFundingId) : null,
                specifyProjectName: data.specifyProjectName || null,
                specifyAgencyName: data.specifyAgencyName || null,
                fundingAgencyName: data.fundingAgencyName || null,
                accountNumber: data.accountNumber || '',
                budgetEstimate: parseFloat(data.budgetEstimate || 0),
                budgetAllocated: parseFloat(data.budgetAllocated || 0),
                budgetReleased: parseFloat(data.budgetReleased || 0),
                expenditure: parseFloat(data.expenditure || 0),
            }
        });

        await reportCacheInvalidationService.invalidateDataSourceForKvk('projectBudget', kvkId);
        return {
            ...record,
            unspentBalance: (record.budgetAllocated || 0) - (record.expenditure || 0)
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const records = await prisma.projectBudget.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                projectName: { select: { projectName: true } },
                sourceOfFunding: { select: { name: true } }
            },
            orderBy: buildFormListOrderBy(user, { kvkRelation: 'kvk', createdAt: true, tiebreak: 'projectBudgetId' })
        });

        return records.map(record => ({
            ...record,
            unspentBalance: (record.budgetAllocated || 0) - (record.expenditure || 0)
        }));
    },

    findById: async (id, user) => {
        const where = { projectBudgetId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }
        const record = await prisma.projectBudget.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                projectName: { select: { projectName: true } },
                sourceOfFunding: { select: { name: true } }
            }
        });

        if (!record) return null;

        return {
            ...record,
            unspentBalance: (record.budgetAllocated || 0) - (record.expenditure || 0)
        };
    },

    update: async (id, data, user) => {
        const where = { projectBudgetId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.projectBudget.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        await assertOtherFieldsValid(PROJECT_BUDGET_OTHER_RULES, {
            financialProjectId: data.financialProjectId !== undefined ? data.financialProjectId : existing.financialProjectId,
            specifyProjectName: data.specifyProjectName !== undefined ? data.specifyProjectName : existing.specifyProjectName,
            sourceOfFundingId: data.sourceOfFundingId !== undefined ? data.sourceOfFundingId : existing.sourceOfFundingId,
            specifyAgencyName: data.specifyAgencyName !== undefined ? data.specifyAgencyName : existing.specifyAgencyName,
        });

        const updated = await prisma.projectBudget.update({
            where: { projectBudgetId: id },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                financialProjectId: data.financialProjectId !== undefined ? parseInt(data.financialProjectId) : existing.financialProjectId,
                sourceOfFundingId: data.sourceOfFundingId !== undefined ? (data.sourceOfFundingId ? parseInt(data.sourceOfFundingId) : null) : existing.sourceOfFundingId,
                specifyProjectName: data.specifyProjectName !== undefined ? data.specifyProjectName : existing.specifyProjectName,
                specifyAgencyName: data.specifyAgencyName !== undefined ? data.specifyAgencyName : existing.specifyAgencyName,
                fundingAgencyName: data.fundingAgencyName !== undefined ? data.fundingAgencyName : existing.fundingAgencyName,
                accountNumber: data.accountNumber !== undefined ? data.accountNumber : existing.accountNumber,
                budgetEstimate: data.budgetEstimate !== undefined ? parseFloat(data.budgetEstimate) : existing.budgetEstimate,
                budgetAllocated: data.budgetAllocated !== undefined ? parseFloat(data.budgetAllocated) : existing.budgetAllocated,
                budgetReleased: data.budgetReleased !== undefined ? parseFloat(data.budgetReleased) : existing.budgetReleased,
                expenditure: data.expenditure !== undefined ? parseFloat(data.expenditure) : existing.expenditure,
            }
        });

        await reportCacheInvalidationService.invalidateDataSourceForKvk('projectBudget', existing.kvkId);
        return {
            ...updated,
            unspentBalance: (updated.budgetAllocated || 0) - (updated.expenditure || 0)
        };
    },

    delete: async (id, user) => {
        const where = { projectBudgetId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }
        const existing = await prisma.projectBudget.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const removed = await prisma.projectBudget.delete({
            where: { projectBudgetId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('projectBudget', existing.kvkId);
        return removed;
    }
};

module.exports = projectBudgetRepository;
