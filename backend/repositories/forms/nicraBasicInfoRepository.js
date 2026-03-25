const prisma = require('../../config/prisma.js');

const nicraBasicInfoRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const result = await prisma.nicraBasicInfo.create({
            data: {
                kvkId,
                reportingDate: data.monthYear ? new Date(data.monthYear + '-01') : new Date(),
                rfNormal: parseFloat(data.rfMmDistrictNormal || data.rfNormal || 0),
                rfReceived: parseFloat(data.rfMmDistrictReceived || data.rfReceived || 0),
                tempMax: parseFloat(data.maxTemperature || data.tempMax || 0),
                tempMin: parseFloat(data.minTemperature || data.tempMin || 0),
                drySpell10Days: parseInt(data.dry10 || 0),
                drySpell15Days: parseInt(data.dry15 || 0),
                drySpell20Days: parseInt(data.dry20 || 0),
                intensiveRainAbove60mm: parseInt(data.intensiveRain || 0),
                waterDepthCm: parseFloat(data.waterDepth || 0),
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
            }
        });
        return nicraBasicInfoRepository._mapResponse(result);
    },

    _mapResponse: (r) => {
        if (!r) return null;
        return {
            ...r,
            id: r.nicraBasicInfoId,
            kvkName: r.kvk ? r.kvk.kvkName : '',
            monthYear: r.reportingDate ? r.reportingDate.toISOString().slice(0, 7) : '',
            rfMmDistrictNormal: r.rfNormal,
            rfMmDistrictReceived: r.rfReceived,
            maxTemperature: r.tempMax,
            minTemperature: r.tempMin,
            dry10: r.drySpell10Days,
            dry15: r.drySpell15Days,
            dry20: r.drySpell20Days,
            intensiveRain: r.intensiveRainAbove60mm,
            waterDepth: r.waterDepthCm,
            startDate: r.startDate && r.startDate instanceof Date ? r.startDate.toISOString().split('T')[0] : (r.startDate || ''),
            endDate: r.endDate && r.endDate instanceof Date ? r.endDate.toISOString().split('T')[0] : (r.endDate || ''),
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const items = await prisma.nicraBasicInfo.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: { nicraBasicInfoId: 'desc' }
        });
        return items.map(nicraBasicInfoRepository._mapResponse);
    },

    findById: async (id, user) => {
        const where = { nicraBasicInfoId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const item = await prisma.nicraBasicInfo.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } } }
        });
        return nicraBasicInfoRepository._mapResponse(item);
    },

    update: async (id, data, user) => {
        const where = { nicraBasicInfoId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraBasicInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.nicraBasicInfo.update({
            where: { nicraBasicInfoId: parseInt(id) },
            data: {
                reportingDate: data.monthYear ? new Date(data.monthYear + '-01') : existing.reportingDate,
                rfNormal: data.rfMmDistrictNormal !== undefined ? parseFloat(data.rfMmDistrictNormal || 0) : (data.rfNormal !== undefined ? parseFloat(data.rfNormal || 0) : existing.rfNormal),
                rfReceived: data.rfMmDistrictReceived !== undefined ? parseFloat(data.rfMmDistrictReceived || 0) : (data.rfReceived !== undefined ? parseFloat(data.rfReceived || 0) : existing.rfReceived),
                tempMax: data.maxTemperature !== undefined ? parseFloat(data.maxTemperature || 0) : (data.tempMax !== undefined ? parseFloat(data.tempMax || 0) : existing.tempMax),
                tempMin: data.minTemperature !== undefined ? parseFloat(data.minTemperature || 0) : (data.tempMin !== undefined ? parseFloat(data.tempMin || 0) : existing.tempMin),
                drySpell10Days: data.dry10 !== undefined ? parseInt(data.dry10 || 0) : existing.drySpell10Days,
                drySpell15Days: data.dry15 !== undefined ? parseInt(data.dry15 || 0) : existing.drySpell15Days,
                drySpell20Days: data.dry20 !== undefined ? parseInt(data.dry20 || 0) : existing.drySpell20Days,
                intensiveRainAbove60mm: data.intensiveRain !== undefined ? parseInt(data.intensiveRain || 0) : existing.intensiveRainAbove60mm,
                waterDepthCm: data.waterDepth !== undefined ? parseFloat(data.waterDepth || 0) : existing.waterDepthCm,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
            }
        });
        return nicraBasicInfoRepository._mapResponse(updated);
    },

    delete: async (id, user) => {
        const where = { nicraBasicInfoId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
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
