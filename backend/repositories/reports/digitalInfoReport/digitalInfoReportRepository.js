const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('../aboutkvkReport/commonFilters.js');

async function getKisanSarathi(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kisanSarathi.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
        },
        orderBy: [{ kisanSarathiId: 'asc' }],
    });
}

async function getMobileApp(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.mobileApp.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
        },
        orderBy: [{ mobileAppId: 'asc' }],
    });
}

async function getKmas(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.kmas.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
        },
        orderBy: [{ kmasId: 'asc' }],
    });
}

async function getWebPortal(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.webPortal.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
        },
        orderBy: [{ webPortalId: 'asc' }],
    });
}

async function getMsgDetails(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.msgDetails.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
        },
        orderBy: [{ msgDetailsId: 'asc' }],
    });
}

module.exports = {
    getKisanSarathi,
    getMobileApp,
    getKmas,
    getWebPortal,
    getMsgDetails,
};
