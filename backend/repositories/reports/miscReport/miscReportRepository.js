const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('../aboutkvkReport/commonFilters.js');

async function getPrevalentDiseasesCrops(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.prevalentDiseasesInCrop.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
        },
        orderBy: [{ dateOfOutbreak: 'desc' }, { diseaseName: 'asc' }],
    });
}

async function getPrevalentDiseasesLivestock(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.prevalentDiseasesOnLivestock.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
        },
        orderBy: [{ dateOfOutbreak: 'desc' }, { diseaseName: 'asc' }],
    });
}

async function getNykTraining(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.nykTraining.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
        },
        orderBy: [{ startDate: 'desc' }, { title: 'asc' }],
    });
}

module.exports = {
    getPrevalentDiseasesCrops,
    getPrevalentDiseasesLivestock,
    getNykTraining,
};
