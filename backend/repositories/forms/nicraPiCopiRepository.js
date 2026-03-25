const prisma = require('../../config/prisma.js');

async function resolveNicraPiTypeId(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') return null;
    const parsedId = parseInt(rawValue, 10);
    if (!isNaN(parsedId)) {
        const byId = await prisma.nicraPiTypeMaster.findUnique({
            where: { nicraPiTypeId: parsedId },
            select: { nicraPiTypeId: true },
        });
        if (byId) return byId.nicraPiTypeId;
    }
    const name = String(rawValue).trim();
    if (!name) return null;
    const existing = await prisma.nicraPiTypeMaster.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { nicraPiTypeId: true },
    });
    if (existing) return existing.nicraPiTypeId;
    const created = await prisma.nicraPiTypeMaster.create({
        data: { name },
        select: { nicraPiTypeId: true },
    });
    return created.nicraPiTypeId;
}

const nicraPiCopiRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');
        const piTypeId = await resolveNicraPiTypeId(data.piTypeId ?? data.type);

        return await prisma.nicraPiCopi.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                piTypeId,
                name: data.name,
            },
            include: {
                piType: true,
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

        const results = await prisma.nicraPiCopi.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                piType: true,
            },
            orderBy: { nicraPiCopiId: 'desc' }
        });
        return results.map(r => ({
            ...r,
            type: r.piType?.name || null,
        }));
    },

    findById: async (id, user) => {
        const where = { nicraPiCopiId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const result = await prisma.nicraPiCopi.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                piType: true,
            }
        });
        if (!result) return null;
        return {
            ...result,
            type: result.piType?.name || null,
        };
    },

    update: async (id, data, user) => {
        const where = { nicraPiCopiId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraPiCopi.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const piTypeId = (data.piTypeId !== undefined || data.type !== undefined)
            ? await resolveNicraPiTypeId(data.piTypeId ?? data.type)
            : existing.piTypeId;

        const updated = await prisma.nicraPiCopi.update({
            where: { nicraPiCopiId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                piTypeId,
                name: data.name !== undefined ? data.name : existing.name,
            },
            include: {
                piType: true,
            }
        });
        return {
            ...updated,
            type: updated.piType?.name || null,
        };
    },

    delete: async (id, user) => {
        const where = { nicraPiCopiId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraPiCopi.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraPiCopi.delete({
            where: { nicraPiCopiId: parseInt(id) }
        });
    }
};

module.exports = nicraPiCopiRepository;
