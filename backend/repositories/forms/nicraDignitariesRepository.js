const prisma = require('../../config/prisma.js');

async function resolveNicraDignitaryTypeId(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') return null;
    const parsedId = parseInt(rawValue, 10);
    if (!isNaN(parsedId)) {
        const byId = await prisma.nicraDignitaryTypeMaster.findUnique({
            where: { nicraDignitaryTypeId: parsedId },
            select: { nicraDignitaryTypeId: true },
        });
        if (byId) return byId.nicraDignitaryTypeId;
    }
    const name = String(rawValue).trim();
    if (!name) return null;
    const existing = await prisma.nicraDignitaryTypeMaster.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { nicraDignitaryTypeId: true },
    });
    if (existing) return existing.nicraDignitaryTypeId;
    const created = await prisma.nicraDignitaryTypeMaster.create({
        data: { name },
        select: { nicraDignitaryTypeId: true },
    });
    return created.nicraDignitaryTypeId;
}

const nicraDignitariesRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');
        const dignitaryTypeId = await resolveNicraDignitaryTypeId(data.dignitaryTypeId ?? data.type);

        return await prisma.nicraDignitariesVisited.create({
            data: {
                kvkId,
                dateOfVisit: new Date(data.dateOfVisit),
                dignitaryTypeId,
                name: data.name,
                remark: data.remark,
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : null,
            },
            include: {
                dignitaryType: true,
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

        const results = await prisma.nicraDignitariesVisited.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                dignitaryType: true,
            },
            orderBy: { nicraDignitariesVisitedId: 'desc' }
        });
        return results.map(r => ({
            ...r,
            type: r.dignitaryType?.name || null,
        }));
    },

    findById: async (id, user) => {
        const where = { nicraDignitariesVisitedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const result = await prisma.nicraDignitariesVisited.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                dignitaryType: true,
            }
        });
        if (!result) return null;
        return {
            ...result,
            type: result.dignitaryType?.name || null,
        };
    },

    update: async (id, data, user) => {
        const where = { nicraDignitariesVisitedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraDignitariesVisited.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const dignitaryTypeId = (data.dignitaryTypeId !== undefined || data.type !== undefined)
            ? await resolveNicraDignitaryTypeId(data.dignitaryTypeId ?? data.type)
            : existing.dignitaryTypeId;

        const updated = await prisma.nicraDignitariesVisited.update({
            where: { nicraDignitariesVisitedId: parseInt(id) },
            data: {
                dateOfVisit: data.dateOfVisit ? new Date(data.dateOfVisit) : existing.dateOfVisit,
                dignitaryTypeId,
                name: data.name !== undefined ? data.name : existing.name,
                remark: data.remark !== undefined ? data.remark : existing.remark,
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : existing.photographs,
            },
            include: {
                dignitaryType: true,
            }
        });
        return {
            ...updated,
            type: updated.dignitaryType?.name || null,
        };
    },

    delete: async (id, user) => {
        const where = { nicraDignitariesVisitedId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraDignitariesVisited.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraDignitariesVisited.delete({
            where: { nicraDignitariesVisitedId: parseInt(id) }
        });
    }
};

module.exports = nicraDignitariesRepository;
