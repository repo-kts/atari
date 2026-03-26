const prisma = require('../../config/prisma.js');

const projectBudgetRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const record = await prisma.projectBudget.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                projectName: data.projectName || '',
                accountNumber: data.accountNumber || '',
                fundingAgency: data.fundingAgency || '',
                budgetEstimate: parseFloat(data.budgetEstimate || 0),
                budgetAllocated: parseFloat(data.budgetAllocated || 0),
                budgetReleased: parseFloat(data.budgetReleased || 0),
                expenditure: parseFloat(data.expenditure || 0),
            }
        });

        return {
            ...record,
            unspentBalance: (record.budgetReleased || 0) - (record.expenditure || 0)
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.role)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const records = await prisma.projectBudget.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return records.map(record => ({
            ...record,
            unspentBalance: (record.budgetReleased || 0) - (record.expenditure || 0)
        }));
    },

    findById: async (id, user) => {
        const where = { projectBudgetId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.role)) {
            where.kvkId = user.kvkId;
        }
        const record = await prisma.projectBudget.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        if (!record) return null;

        return {
            ...record,
            unspentBalance: (record.budgetReleased || 0) - (record.expenditure || 0)
        };
    },

    update: async (id, data, user) => {
        const where = { projectBudgetId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.role)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.projectBudget.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.projectBudget.update({
            where: { projectBudgetId: id },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                projectName: data.projectName !== undefined ? data.projectName : existing.projectName,
                accountNumber: data.accountNumber !== undefined ? data.accountNumber : existing.accountNumber,
                fundingAgency: data.fundingAgency !== undefined ? data.fundingAgency : existing.fundingAgency,
                budgetEstimate: data.budgetEstimate !== undefined ? parseFloat(data.budgetEstimate) : existing.budgetEstimate,
                budgetAllocated: data.budgetAllocated !== undefined ? parseFloat(data.budgetAllocated) : existing.budgetAllocated,
                budgetReleased: data.budgetReleased !== undefined ? parseFloat(data.budgetReleased) : existing.budgetReleased,
                expenditure: data.expenditure !== undefined ? parseFloat(data.expenditure) : existing.expenditure,
            }
        });

        return {
            ...updated,
            unspentBalance: (updated.budgetReleased || 0) - (updated.expenditure || 0)
        };
    },

    delete: async (id, user) => {
        const where = { projectBudgetId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.role)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.projectBudget.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.projectBudget.delete({
            where: { projectBudgetId: id }
        });
    }
};

module.exports = projectBudgetRepository;
