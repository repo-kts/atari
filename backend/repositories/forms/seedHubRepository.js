const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const toIntOrNull = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? null : n;
};

const toFloatOrZero = (value) => {
    const n = parseFloat(value);
    return Number.isNaN(n) ? 0 : n;
};

const seedHubRepository = {
    findAll: async (filters = {}, user) => {
        const where = {};

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId, 10);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId, 10);
        }

        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                ensureNotFutureDate(from);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                ensureNotFutureDate(to);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }

        const results = await prisma.kvkSeedHubProgram.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } }
            },
            orderBy: { seedHubId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { seedHubId: parseInt(id, 10) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId, 10);
        }

        const result = await prisma.kvkSeedHubProgram.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;
        if (Number.isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const reportingYear = parseReportingYearDate(data.reportingYear);
        ensureNotFutureDate(reportingYear);

        const created = await prisma.kvkSeedHubProgram.create({
            data: {
                kvkId,
                reportingYear,
                seasonId: toIntOrNull(data.seasonId) || 1,
                cropName: data.cropName || '',
                varietyName: data.varietyName || data.variety || '',
                areaCoveredHa: toFloatOrZero(data.areaCovered ?? data.areaCoveredHa ?? data.area),
                yieldQPerHa: toFloatOrZero(data.yield ?? data.yieldQPerHa),
                quantityProducedQ: toFloatOrZero(data.quantityProduced ?? data.quantityProducedQ),
                quantitySaleOutQ: toFloatOrZero(data.quantitySold ?? data.quantitySaleOutQ),
                farmersPurchased: toIntOrNull(data.farmersCount ?? data.farmersPurchased) || 0,
                quantitySaleToFarmersQ: toFloatOrZero(data.quantitySoldFarmers ?? data.quantitySaleToFarmersQ),
                villagesCovered: toIntOrNull(data.villagesCovered) || 0,
                quantitySaleToOtherOrgQ: toFloatOrZero(data.quantitySoldOrg ?? data.quantitySaleToOtherOrgQ),
                amountGeneratedLakh: toFloatOrZero(data.amountGenerated ?? data.amountGeneratedLakh),
                totalAmountPresentLakh: toFloatOrZero(data.totalAmountPresently ?? data.totalAmountPresentLakh)
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } }
            }
        });

        return _mapResponse(created);
    },

    update: async (id, data, user) => {
        const where = { seedHubId: parseInt(id, 10) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId, 10);
        }

        const existing = await prisma.kvkSeedHubProgram.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updateData = {};
        if (data.reportingYear !== undefined) {
            const parsed = parseReportingYearDate(data.reportingYear);
            ensureNotFutureDate(parsed);
            updateData.reportingYear = parsed;
        }
        if (data.seasonId !== undefined) updateData.seasonId = toIntOrNull(data.seasonId);
        if (data.cropName !== undefined) updateData.cropName = data.cropName || '';
        if (data.varietyName !== undefined || data.variety !== undefined) updateData.varietyName = data.varietyName || data.variety || '';
        if (data.areaCovered !== undefined || data.areaCoveredHa !== undefined || data.area !== undefined) updateData.areaCoveredHa = toFloatOrZero(data.areaCovered ?? data.areaCoveredHa ?? data.area);
        if (data.yield !== undefined || data.yieldQPerHa !== undefined) updateData.yieldQPerHa = toFloatOrZero(data.yield ?? data.yieldQPerHa);
        if (data.quantityProduced !== undefined || data.quantityProducedQ !== undefined) updateData.quantityProducedQ = toFloatOrZero(data.quantityProduced ?? data.quantityProducedQ);
        if (data.quantitySold !== undefined || data.quantitySaleOutQ !== undefined) updateData.quantitySaleOutQ = toFloatOrZero(data.quantitySold ?? data.quantitySaleOutQ);
        if (data.farmersCount !== undefined || data.farmersPurchased !== undefined) updateData.farmersPurchased = toIntOrNull(data.farmersCount ?? data.farmersPurchased) || 0;
        if (data.quantitySoldFarmers !== undefined || data.quantitySaleToFarmersQ !== undefined) updateData.quantitySaleToFarmersQ = toFloatOrZero(data.quantitySoldFarmers ?? data.quantitySaleToFarmersQ);
        if (data.villagesCovered !== undefined) updateData.villagesCovered = toIntOrNull(data.villagesCovered) || 0;
        if (data.quantitySoldOrg !== undefined || data.quantitySaleToOtherOrgQ !== undefined) updateData.quantitySaleToOtherOrgQ = toFloatOrZero(data.quantitySoldOrg ?? data.quantitySaleToOtherOrgQ);
        if (data.amountGenerated !== undefined || data.amountGeneratedLakh !== undefined) updateData.amountGeneratedLakh = toFloatOrZero(data.amountGenerated ?? data.amountGeneratedLakh);
        if (data.totalAmountPresently !== undefined || data.totalAmountPresentLakh !== undefined) updateData.totalAmountPresentLakh = toFloatOrZero(data.totalAmountPresently ?? data.totalAmountPresentLakh);

        const updated = await prisma.kvkSeedHubProgram.update({
            where: { seedHubId: parseInt(id, 10) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } }
            }
        });
        return _mapResponse(updated);
    },

    delete: async (id, user) => {
        const where = { seedHubId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkSeedHubProgram.deleteMany({
            where
        });

        if (result.count === 0) throw new Error('Record not found or unauthorized');

        return { success: true };
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.seedHubId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        reportingYear: formatReportingYear(r.reportingYear),
        cropName: r.cropName,
        varietyName: r.varietyName,
        variety: r.varietyName,

        // Field mappings to match SeedHubForms.tsx
        areaCovered: r.areaCoveredHa,
        areaCoveredHa: r.areaCoveredHa,
        area: r.areaCoveredHa,

        yield: r.yieldQPerHa,
        yieldQPerHa: r.yieldQPerHa,

        quantityProduced: r.quantityProducedQ,
        quantityProducedQ: r.quantityProducedQ,

        quantitySold: r.quantitySaleOutQ,
        quantitySaleOutQ: r.quantitySaleOutQ,

        farmersCount: r.farmersPurchased,
        farmersPurchased: r.farmersPurchased,

        quantitySoldFarmers: r.quantitySaleToFarmersQ,
        quantitySaleToFarmersQ: r.quantitySaleToFarmersQ,

        villagesCovered: r.villagesCovered,

        quantitySoldOrg: r.quantitySaleToOtherOrgQ,
        quantitySaleToOtherOrgQ: r.quantitySaleToOtherOrgQ,

        amountGenerated: r.amountGeneratedLakh,
        amountGeneratedLakh: r.amountGeneratedLakh,

        totalAmountPresently: r.totalAmountPresentLakh,
        totalAmountPresentLakh: r.totalAmountPresentLakh,
    };
}

module.exports = seedHubRepository;
