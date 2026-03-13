const prisma = require('../../config/prisma.js');

const nicraConvergenceRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraConvergenceProgramme.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                developmentSchemeProgramme: data.developmentSchemeProgramme,
                natureOfWork: data.natureOfWork,
                amountRs: parseFloat(data.amountRs || 0),
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : '',
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

        return await prisma.nicraConvergenceProgramme.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nicraConvergenceProgrammeId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraConvergenceProgrammeId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraConvergenceProgramme.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraConvergenceProgrammeId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraConvergenceProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraConvergenceProgramme.update({
            where: { nicraConvergenceProgrammeId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                developmentSchemeProgramme: data.developmentSchemeProgramme !== undefined ? data.developmentSchemeProgramme : existing.developmentSchemeProgramme,
                natureOfWork: data.natureOfWork !== undefined ? data.natureOfWork : existing.natureOfWork,
                amountRs: data.amountRs !== undefined ? parseFloat(data.amountRs) : existing.amountRs,
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : (existing.photographs || ''),
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraConvergenceProgrammeId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraConvergenceProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraConvergenceProgramme.delete({
            where: { nicraConvergenceProgrammeId: parseInt(id) }
        });
    }
};

module.exports = nicraConvergenceRepository;
