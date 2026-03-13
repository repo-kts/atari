const prisma = require('../../config/prisma.js');

const nicraInterventionRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraIntervention.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                seedBankFodderBank: data.seedBankFodderBank,
                crop: data.crop,
                variety: data.variety,
                quantityQ: parseFloat(data.quantityQ || 0),
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.nicraIntervention.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nicraInterventionId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraIntervention.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraIntervention.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraIntervention.update({
            where: { nicraInterventionId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                seedBankFodderBank: data.seedBankFodderBank !== undefined ? data.seedBankFodderBank : existing.seedBankFodderBank,
                crop: data.crop !== undefined ? data.crop : existing.crop,
                variety: data.variety !== undefined ? data.variety : existing.variety,
                quantityQ: data.quantityQ !== undefined ? parseFloat(data.quantityQ) : existing.quantityQ,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraIntervention.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraIntervention.delete({
            where: { nicraInterventionId: parseInt(id) }
        });
    }
};

module.exports = nicraInterventionRepository;
