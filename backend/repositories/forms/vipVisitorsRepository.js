const prisma = require('../../config/prisma.js');

const vipVisitorsRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        let dignitaryTypeId = data.dignitaryTypeId ? parseInt(data.dignitaryTypeId) : 0;

        // If dignitaryType name is provided instead of ID
        if (data.dignitaryType && typeof data.dignitaryType === 'string') {
            let typeRec = await prisma.dignitaryType.findFirst({
                where: { name: { equals: data.dignitaryType, mode: 'insensitive' } }
            });
            if (!typeRec) {
                typeRec = await prisma.dignitaryType.create({
                    data: { name: data.dignitaryType }
                });
            }
            dignitaryTypeId = typeRec.dignitaryTypeId;
        }

        if (!dignitaryTypeId) throw new Error('Dignitary Type is required');

        return await prisma.vipVisitor.create({
            data: {
                kvkId,
                dateOfVisit: data.visitDate ? new Date(data.visitDate) : new Date(),
                dignitaryTypeId,
                ministerName: data.ministerName || '',
                salientPoints: data.observations || '',
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.vipVisitor.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                dignitaryType: { select: { dignitaryTypeId: true, name: true } }
            },
            orderBy: { vipVisitorId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { vipVisitorId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        return await prisma.vipVisitor.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                dignitaryType: { select: { dignitaryTypeId: true, name: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { vipVisitorId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.vipVisitor.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        let dignitaryTypeId = existing.dignitaryTypeId;
        if (data.dignitaryType && typeof data.dignitaryType === 'string') {
            let typeRec = await prisma.dignitaryType.findFirst({
                where: { name: { equals: data.dignitaryType, mode: 'insensitive' } }
            });
            if (!typeRec) {
                typeRec = await prisma.dignitaryType.create({
                    data: { name: data.dignitaryType }
                });
            }
            dignitaryTypeId = typeRec.dignitaryTypeId;
        } else if (data.dignitaryTypeId !== undefined) {
            dignitaryTypeId = parseInt(data.dignitaryTypeId);
        }

        return await prisma.vipVisitor.update({
            where: { vipVisitorId: parseInt(id) },
            data: {
                dateOfVisit: data.visitDate ? new Date(data.visitDate) : existing.dateOfVisit,
                dignitaryTypeId,
                ministerName: data.ministerName !== undefined ? data.ministerName : existing.ministerName,
                salientPoints: data.observations !== undefined ? data.observations : existing.salientPoints,
            }
        });
    },

    delete: async (id, user) => {
        const where = { vipVisitorId: parseInt(id) };
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.vipVisitor.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.vipVisitor.delete({
            where: { vipVisitorId: parseInt(id) }
        });
    },

    findAllDignitaryTypes: async () => {
        return await prisma.dignitaryType.findMany({
            orderBy: { name: 'asc' }
        });
    }
};

module.exports = vipVisitorsRepository;
