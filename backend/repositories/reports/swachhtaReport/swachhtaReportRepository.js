const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('../aboutkvkReport/commonFilters.js');

async function getSwachhtaSewa(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);
    return await prisma.swachhtaHiSewa.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true } } },
        orderBy: [{ observationDate: 'desc' }],
    });
}

async function getSwachhtaPakhwada(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);
    return await prisma.swachhtaPakhwada.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true } } },
        orderBy: [{ observationDate: 'desc' }],
    });
}

async function getSwachhtaBudget(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);
    return await prisma.swachhQuarterlyExpenditure.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true } } },
        orderBy: [{ swachhQuarterlyExpenditureId: 'asc' }],
    });
}

module.exports = { getSwachhtaSewa, getSwachhtaPakhwada, getSwachhtaBudget };
