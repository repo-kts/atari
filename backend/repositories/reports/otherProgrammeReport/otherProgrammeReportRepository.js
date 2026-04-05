const prisma = require('../../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    if (filters.startDate || filters.endDate || filters.year) {
        where.programmeDate = {};
        if (filters.year && !filters.startDate && !filters.endDate) {
            const y = Number(filters.year);
            if (Number.isFinite(y)) {
                where.programmeDate.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
                where.programmeDate.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
            }
        } else {
            if (filters.startDate) {
                const from = new Date(filters.startDate);
                if (!isNaN(from)) {
                    from.setHours(0, 0, 0, 0);
                    where.programmeDate.gte = from;
                }
            }
            if (filters.endDate) {
                const to = new Date(filters.endDate);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    where.programmeDate.lte = to;
                }
            }
        }
    }
    return where;
}

async function getOtherProgrammeData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.kvkOtherProgramme.findMany({
        where,
        include: { kvk: { select: { kvkName: true } } },
        orderBy: [{ programmeDate: 'asc' }, { kvkOtherProgrammeId: 'asc' }],
    });
    // Robust fallback: build a complete kvkId -> kvkName map to handle any missing relations
    const allKvks = await prisma.kvk.findMany({ select: { kvkId: true, kvkName: true } });
    const kvkIdToName = allKvks.reduce((acc, k) => { acc[k.kvkId] = k.kvkName || ''; return acc; }, {});
    return rows.map(r => {
        const totals = {
            genT: (r.farmersGeneralM || 0) + (r.farmersGeneralF || 0),
            obcT: (r.farmersObcM || 0) + (r.farmersObcF || 0),
            scT: (r.farmersScM || 0) + (r.farmersScF || 0),
            stT: (r.farmersStM || 0) + (r.farmersStF || 0),
        };
        const grandM = (r.farmersGeneralM || 0) + (r.farmersObcM || 0) + (r.farmersScM || 0) + (r.farmersStM || 0);
        const grandF = (r.farmersGeneralF || 0) + (r.farmersObcF || 0) + (r.farmersScF || 0) + (r.farmersStF || 0);
        return {
            kvkName: r.kvk?.kvkName || kvkIdToName[r.kvkId] || '',
            programmeName: r.programmeName,
            programmeDate: r.programmeDate,
            venue: r.venue,
            purpose: r.purpose,
            genM: r.farmersGeneralM || 0, genF: r.farmersGeneralF || 0, genT: totals.genT,
            obcM: r.farmersObcM || 0, obcF: r.farmersObcF || 0, obcT: totals.obcT,
            scM: r.farmersScM || 0, scF: r.farmersScF || 0, scT: totals.scT,
            stM: r.farmersStM || 0, stF: r.farmersStF || 0, stT: totals.stT,
            grandM, grandF, grandT: grandM + grandF,
        };
    });
}

module.exports = { getOtherProgrammeData };
