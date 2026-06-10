const prisma = require('../../../config/prisma.js');
const { applyDateFilters } = require('../aboutkvkReport/commonFilters.js');

async function getSwachhtaSewa(kvkId, filters = {}) {
    const where = { kvkId };
    applyDateFilters(where, filters, 'observationDate');
    return await prisma.swachhtaHiSewa.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } } },
        orderBy: [{ observationDate: 'desc' }],
    });
}

async function getSwachhtaPakhwada(kvkId, filters = {}) {
    const where = { kvkId };
    applyDateFilters(where, filters, 'observationDate');
    return await prisma.swachhtaPakhwada.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } } },
        orderBy: [{ observationDate: 'desc' }],
    });
}

async function getSwachhtaBudget(kvkId, filters = {}) {
    const where = { kvkId };
    applyDateFilters(where, filters, 'reportingYear');
    return await prisma.swachhQuarterlyExpenditure.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } } },
        orderBy: [{ swachhQuarterlyExpenditureId: 'asc' }],
    });
}

module.exports = { getSwachhtaSewa, getSwachhtaPakhwada, getSwachhtaBudget };
