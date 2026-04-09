const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const prisma = require('../../config/prisma.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const safeParseFloat = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
};

const safeParseInt = (val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
};

const districtLevelDataRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const created = await prisma.districtLevelData.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                items: data.items,
                information: data.information,
                season: data.season,
                type: data.type,
                cropName: data.cropName,
                area: safeParseFloat(data.area),
                production: safeParseFloat(data.production),
                productivity: safeParseFloat(data.productivity),
                month: data.month,
                rainfall: safeParseFloat(data.rainfall),
                maxTemp: safeParseFloat(data.maxTemp),
                minTemp: safeParseFloat(data.minTemp),
                maxRH: safeParseFloat(data.maxRH),
                minRH: safeParseFloat(data.minRH),
                livestockName: data.livestockName,
                number: safeParseInt(data.number),
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('districtLevelData', kvkId);
        return created;
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.districtLevelData.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { districtLevelDataId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.districtLevelData.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { districtLevelDataId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.districtLevelData.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.districtLevelData.update({
            where: { districtLevelDataId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                items: data.items !== undefined ? data.items : existing.items,
                information: data.information !== undefined ? data.information : existing.information,
                season: data.season !== undefined ? data.season : existing.season,
                type: data.type !== undefined ? data.type : existing.type,
                cropName: data.cropName !== undefined ? data.cropName : existing.cropName,
                area: data.area !== undefined ? safeParseFloat(data.area) : existing.area,
                production: data.production !== undefined ? safeParseFloat(data.production) : existing.production,
                productivity: data.productivity !== undefined ? safeParseFloat(data.productivity) : existing.productivity,
                month: data.month !== undefined ? data.month : existing.month,
                rainfall: data.rainfall !== undefined ? safeParseFloat(data.rainfall) : existing.rainfall,
                maxTemp: data.maxTemp !== undefined ? safeParseFloat(data.maxTemp) : existing.maxTemp,
                minTemp: data.minTemp !== undefined ? safeParseFloat(data.minTemp) : existing.minTemp,
                maxRH: data.maxRH !== undefined ? safeParseFloat(data.maxRH) : existing.maxRH,
                minRH: data.minRH !== undefined ? safeParseFloat(data.minRH) : existing.minRH,
                livestockName: data.livestockName !== undefined ? data.livestockName : existing.livestockName,
                number: data.number !== undefined ? safeParseInt(data.number) : existing.number,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('districtLevelData', existing.kvkId);
        return updated;
    },

    delete: async (id, user) => {
        const where = { districtLevelDataId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.districtLevelData.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const removed = await prisma.districtLevelData.delete({
            where: { districtLevelDataId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('districtLevelData', existing.kvkId);
        return removed;
    }
};

module.exports = districtLevelDataRepository;
