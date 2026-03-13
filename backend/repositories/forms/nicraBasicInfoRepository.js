const prisma = require('../../config/prisma.js');

const nicraBasicInfoRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraBasicInfo.create({
            data: {
                kvkId,
                reportingDate: data.monthYear ? new Date(data.monthYear + '-01') : new Date(),
                rfNormal: parseFloat(data.rfNormal || 0),
                rfReceived: parseFloat(data.rfReceived || 0),
                tempMax: parseFloat(data.tempMax || 0),
                tempMin: parseFloat(data.tempMin || 0),
                drySpell10Days: parseInt(data.dry10 || 0),
                drySpell15Days: parseInt(data.dry15 || 0),
                drySpell20Days: parseInt(data.dry20 || 0),
                intensiveRainAbove60mm: parseInt(data.intensiveRain || 0),
                waterDepthCm: parseFloat(data.waterDepth || 0),
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
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

        return await prisma.nicraBasicInfo.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: { nicraBasicInfoId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraBasicInfoId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraBasicInfo.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } } }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraBasicInfoId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraBasicInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraBasicInfo.update({
            where: { nicraBasicInfoId: parseInt(id) },
            data: {
                reportingDate: data.monthYear ? new Date(data.monthYear + '-01') : existing.reportingDate,
                rfNormal: data.rfNormal !== undefined ? parseFloat(data.rfNormal || 0) : existing.rfNormal,
                rfReceived: data.rfReceived !== undefined ? parseFloat(data.rfReceived || 0) : existing.rfReceived,
                tempMax: data.tempMax !== undefined ? parseFloat(data.tempMax || 0) : existing.tempMax,
                tempMin: data.tempMin !== undefined ? parseFloat(data.tempMin || 0) : existing.tempMin,
                drySpell10Days: data.dry10 !== undefined ? parseInt(data.dry10 || 0) : existing.drySpell10Days,
                drySpell15Days: data.dry15 !== undefined ? parseInt(data.dry15 || 0) : existing.drySpell15Days,
                drySpell20Days: data.dry20 !== undefined ? parseInt(data.dry20 || 0) : existing.drySpell20Days,
                intensiveRainAbove60mm: data.intensiveRain !== undefined ? parseInt(data.intensiveRain || 0) : existing.intensiveRainAbove60mm,
                waterDepthCm: data.waterDepth !== undefined ? parseFloat(data.waterDepth || 0) : existing.waterDepthCm,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraBasicInfoId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraBasicInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraBasicInfo.delete({
            where: { nicraBasicInfoId: parseInt(id) }
        });
    }
};

module.exports = nicraBasicInfoRepository;
