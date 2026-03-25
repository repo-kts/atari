const prisma = require('../../config/prisma.js');

const budgetDetailRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.budgetDetail.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                salaryAllocation: parseFloat(data.salaryAllocation || 0),
                salaryExpenditure: parseFloat(data.salaryExpenditure || 0),
                generalMainGrantAllocation: parseFloat(data.generalMainGrantAllocation || 0),
                generalMainGrantExpenditure: parseFloat(data.generalMainGrantExpenditure || 0),
                generalTspGrantAllocation: parseFloat(data.generalTspGrantAllocation || 0),
                generalTspGrantExpenditure: parseFloat(data.generalTspGrantExpenditure || 0),
                generalScspGrantAllocation: parseFloat(data.generalScspGrantAllocation || 0),
                generalScspGrantExpenditure: parseFloat(data.generalScspGrantExpenditure || 0),
                capitalMainGrantAllocation: parseFloat(data.capitalMainGrantAllocation || 0),
                capitalMainGrantExpenditure: parseFloat(data.capitalMainGrantExpenditure || 0),
                capitalTspGrantAllocation: parseFloat(data.capitalTspGrantAllocation || 0),
                capitalTspGrantExpenditure: parseFloat(data.capitalTspGrantExpenditure || 0),
                capitalScspGrantAllocation: parseFloat(data.capitalScspGrantAllocation || 0),
                capitalScspGrantExpenditure: parseFloat(data.capitalScspGrantExpenditure || 0),
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.budgetDetail.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { budgetDetailId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.budgetDetail.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { budgetDetailId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.budgetDetail.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.budgetDetail.update({
            where: { budgetDetailId: id },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                salaryAllocation: data.salaryAllocation !== undefined ? parseFloat(data.salaryAllocation) : existing.salaryAllocation,
                salaryExpenditure: data.salaryExpenditure !== undefined ? parseFloat(data.salaryExpenditure) : existing.salaryExpenditure,
                generalMainGrantAllocation: data.generalMainGrantAllocation !== undefined ? parseFloat(data.generalMainGrantAllocation) : existing.generalMainGrantAllocation,
                generalMainGrantExpenditure: data.generalMainGrantExpenditure !== undefined ? parseFloat(data.generalMainGrantExpenditure) : existing.generalMainGrantExpenditure,
                generalTspGrantAllocation: data.generalTspGrantAllocation !== undefined ? parseFloat(data.generalTspGrantAllocation) : existing.generalTspGrantAllocation,
                generalTspGrantExpenditure: data.generalTspGrantExpenditure !== undefined ? parseFloat(data.generalTspGrantExpenditure) : existing.generalTspGrantExpenditure,
                generalScspGrantAllocation: data.generalScspGrantAllocation !== undefined ? parseFloat(data.generalScspGrantAllocation) : existing.generalScspGrantAllocation,
                generalScspGrantExpenditure: data.generalScspGrantExpenditure !== undefined ? parseFloat(data.generalScspGrantExpenditure) : existing.generalScspGrantExpenditure,
                capitalMainGrantAllocation: data.capitalMainGrantAllocation !== undefined ? parseFloat(data.capitalMainGrantAllocation) : existing.capitalMainGrantAllocation,
                capitalMainGrantExpenditure: data.capitalMainGrantExpenditure !== undefined ? parseFloat(data.capitalMainGrantExpenditure) : existing.capitalMainGrantExpenditure,
                capitalTspGrantAllocation: data.capitalTspGrantAllocation !== undefined ? parseFloat(data.capitalTspGrantAllocation) : existing.capitalTspGrantAllocation,
                capitalTspGrantExpenditure: data.capitalTspGrantExpenditure !== undefined ? parseFloat(data.capitalTspGrantExpenditure) : existing.capitalTspGrantExpenditure,
                capitalScspGrantAllocation: data.capitalScspGrantAllocation !== undefined ? parseFloat(data.capitalScspGrantAllocation) : existing.capitalScspGrantAllocation,
                capitalScspGrantExpenditure: data.capitalScspGrantExpenditure !== undefined ? parseFloat(data.capitalScspGrantExpenditure) : existing.capitalScspGrantExpenditure,
            }
        });
    },

    delete: async (id, user) => {
        const where = { budgetDetailId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.budgetDetail.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.budgetDetail.delete({
            where: { budgetDetailId: id }
        });
    }
};

module.exports = budgetDetailRepository;
