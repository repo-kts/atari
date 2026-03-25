const prisma = require('../../config/prisma.js');

async function resolveSeedBankFodderBankId(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') return null;

    const parsedId = parseInt(rawValue, 10);
    if (!isNaN(parsedId)) {
        const byId = await prisma.nicraSeedBankFodderBankMaster.findUnique({
            where: { nicraSeedBankFodderBankId: parsedId },
            select: { nicraSeedBankFodderBankId: true },
        });
        if (byId) return byId.nicraSeedBankFodderBankId;
    }

    const name = String(rawValue).trim();
    if (!name) return null;

    const existing = await prisma.nicraSeedBankFodderBankMaster.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { nicraSeedBankFodderBankId: true },
    });
    if (existing) return existing.nicraSeedBankFodderBankId;

    const created = await prisma.nicraSeedBankFodderBankMaster.create({
        data: { name },
        select: { nicraSeedBankFodderBankId: true },
    });
    return created.nicraSeedBankFodderBankId;
}

const nicraInterventionRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');
        const seedBankFodderBankId = await resolveSeedBankFodderBankId(
            data.seedBankFodderBankId ?? data.seedBankFodderBank
        );

        const result = await prisma.nicraIntervention.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                seedBankFodderBankId,
                crop: data.crop,
                variety: data.variety,
                quantityQ: parseFloat(data.quantityQ || 0),
            },
            include: {
                seedBankFodderBank: true,
            },
        });
        return nicraInterventionRepository._mapResponse(result);
    },

    _mapResponse: (r) => {
        if (!r) return null;
        return {
            ...r,
            id: r.nicraInterventionId,
            seedBankFodderBankId: r.seedBankFodderBankId,
            seedBankFodderBank: r.seedBankFodderBank?.name || r.seedBankFodderBank || null,
            startDate: r.startDate && r.startDate instanceof Date ? r.startDate.toISOString().split('T')[0] : (r.startDate || ''),
            endDate: r.endDate && r.endDate instanceof Date ? r.endDate.toISOString().split('T')[0] : (r.endDate || '')
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.nicraIntervention.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                seedBankFodderBank: true,
            },
            orderBy: { nicraInterventionId: 'desc' }
        });
        return results.map(r => nicraInterventionRepository._mapResponse(r));
    },

    findById: async (id, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const result = await prisma.nicraIntervention.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                seedBankFodderBank: true,
            }
        });
        return nicraInterventionRepository._mapResponse(result);
    },

    update: async (id, data, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraIntervention.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const seedBankFodderBankId = (data.seedBankFodderBankId !== undefined || data.seedBankFodderBank !== undefined)
            ? await resolveSeedBankFodderBankId(data.seedBankFodderBankId ?? data.seedBankFodderBank)
            : existing.seedBankFodderBankId;

        const updated = await prisma.nicraIntervention.update({
            where: { nicraInterventionId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                seedBankFodderBankId,
                crop: data.crop !== undefined ? data.crop : existing.crop,
                variety: data.variety !== undefined ? data.variety : existing.variety,
                quantityQ: data.quantityQ !== undefined ? parseFloat(data.quantityQ) : existing.quantityQ,
            },
            include: {
                seedBankFodderBank: true,
            },
        });
        return nicraInterventionRepository._mapResponse(updated);
    },

    delete: async (id, user) => {
        const where = { nicraInterventionId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
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
