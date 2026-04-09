const prisma = require('../../config/prisma.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const revenueGenerationRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const created = await prisma.revenueGeneration.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                headName: data.headName,
                income: parseFloat(data.income || 0),
                sponsoringAgency: data.sponsoringAgency,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('revenueGeneration', kvkId);
        return created;
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.revenueGeneration.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { revenueGenerationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.revenueGeneration.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { revenueGenerationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.revenueGeneration.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.revenueGeneration.update({
            where: { revenueGenerationId: id },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                headName: data.headName !== undefined ? data.headName : existing.headName,
                income: data.income !== undefined ? parseFloat(data.income) : existing.income,
                sponsoringAgency: data.sponsoringAgency !== undefined ? data.sponsoringAgency : existing.sponsoringAgency,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('revenueGeneration', existing.kvkId);
        return updated;
    },

    delete: async (id, user) => {
        const where = { revenueGenerationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.revenueGeneration.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const removed = await prisma.revenueGeneration.delete({
            where: { revenueGenerationId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('revenueGeneration', existing.kvkId);
        return removed;
    }
};

module.exports = revenueGenerationRepository;
