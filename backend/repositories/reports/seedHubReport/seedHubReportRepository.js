const prisma = require('../../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    if (filters.startDate || filters.endDate || filters.year) {
        where.reportingYear = {};
        if (filters.year && !filters.startDate && !filters.endDate) {
            const y = Number(filters.year);
            if (Number.isFinite(y)) {
                where.reportingYear.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
                where.reportingYear.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
            }
        } else {
            if (filters.startDate) {
                const from = new Date(filters.startDate);
                if (!isNaN(from)) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.endDate) {
                const to = new Date(filters.endDate);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }
    }
    return where;
}

async function getSeedHubData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.kvkSeedHubProgram.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true, state: { select: { stateName: true } } } },
            season: { select: { seasonName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { seedHubId: 'asc' }],
    });

    return rows.map(r => ({
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        stateName: r.kvk?.state?.stateName || '',
        season: r.season?.seasonName || '',
        cropName: r.cropName || '',
        varietyName: r.varietyName || '',
        areaCoveredHa: Number(r.areaCoveredHa || 0),
        yieldQPerHa: Number(r.yieldQPerHa || 0),
        quantityProducedQ: Number(r.quantityProducedQ || 0),
        quantitySaleOutQ: Number(r.quantitySaleOutQ || 0),
        farmersPurchased: Number(r.farmersPurchased || 0),
        quantitySaleToFarmersQ: Number(r.quantitySaleToFarmersQ || 0),
        villagesCovered: Number(r.villagesCovered || 0),
        quantitySaleToOtherOrgQ: Number(r.quantitySaleToOtherOrgQ || 0),
        amountGeneratedLakh: Number(r.amountGeneratedLakh || 0),
        totalAmountPresentLakh: Number(r.totalAmountPresentLakh || 0),
    }));
}

module.exports = { getSeedHubData };
