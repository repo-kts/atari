const prisma = require('../../config/prisma.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const resourceGenerationRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const created = await prisma.resourceGeneration.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                programmeName: data.programmeName,
                programmePurpose: data.programmePurpose,
                sourcesOfFund: data.sourcesOfFund,
                amount: parseFloat(data.amount || 0),
                infrastructureCreated: data.infrastructureCreated,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('resourceGeneration', kvkId);
        return created;
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.resourceGeneration.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { resourceGenerationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.resourceGeneration.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { resourceGenerationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.resourceGeneration.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.resourceGeneration.update({
            where: { resourceGenerationId: id },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                programmeName: data.programmeName !== undefined ? data.programmeName : existing.programmeName,
                programmePurpose: data.programmePurpose !== undefined ? data.programmePurpose : existing.programmePurpose,
                sourcesOfFund: data.sourcesOfFund !== undefined ? data.sourcesOfFund : existing.sourcesOfFund,
                amount: data.amount !== undefined ? parseFloat(data.amount) : existing.amount,
                infrastructureCreated: data.infrastructureCreated !== undefined ? data.infrastructureCreated : existing.infrastructureCreated,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('resourceGeneration', existing.kvkId);
        return updated;
    },

    delete: async (id, user) => {
        const where = { resourceGenerationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.resourceGeneration.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const removed = await prisma.resourceGeneration.delete({
            where: { resourceGenerationId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('resourceGeneration', existing.kvkId);
        return removed;
    }
};

module.exports = resourceGenerationRepository;
