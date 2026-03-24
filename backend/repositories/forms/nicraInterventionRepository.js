const prisma = require('../../config/prisma.js');

const nicraInterventionRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const result = await prisma.nicraIntervention.create({
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
        return nicraInterventionRepository._mapResponse(result);
    },

    _mapResponse: (r) => {
        if (!r) return null;
        return {
            ...r,
            id: r.nicraInterventionId,
            startDate: r.startDate && r.startDate instanceof Date ? r.startDate.toISOString().split('T')[0] : (r.startDate || ''),
            endDate: r.endDate && r.endDate instanceof Date ? r.endDate.toISOString().split('T')[0] : (r.endDate || '')
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.nicraIntervention.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nicraInterventionId: 'desc' }
        });
        return results.map(r => nicraInterventionRepository._mapResponse(r));
    },

    findById: async (id, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const result = await prisma.nicraIntervention.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
        return nicraInterventionRepository._mapResponse(result);
    },

    update: async (id, data, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraIntervention.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.nicraIntervention.update({
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
        return nicraInterventionRepository._mapResponse(updated);
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
