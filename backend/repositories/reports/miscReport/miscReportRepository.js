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

async function getPpvFraPlantVarieties(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.ppvFraPlantVarieties.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
        },
        orderBy: [{ reportingYear: 'desc' }, { cropName: 'asc' }],
    });
}

async function getVipVisitors(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.vipVisitor.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            dignitaryType: { select: { dignitaryTypeId: true, name: true } },
        },
        orderBy: [{ dateOfVisit: 'desc' }, { ministerName: 'asc' }],
    });
}

async function getRaweFetFit(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.raweFetFitProgramme.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            attachmentType: { select: { attachmentTypeId: true, name: true } },
        },
        orderBy: [{ startDate: 'desc' }],
    });
}

async function getPpvFraTraining(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

    return await prisma.ppvFraTraining.findMany({
        where,
        include: {
            kvk: { select: { kvkId: true, kvkName: true } },
            trainingType: { select: { typeId: true, typeName: true } },
        },
        orderBy: [{ programmeDate: 'desc' }, { title: 'asc' }],
    });
}

module.exports = {
    getPrevalentDiseasesCrops,
    getPrevalentDiseasesLivestock,
    getNykTraining,
    getPpvFraPlantVarieties,
    getPpvFraTraining,
    getVipVisitors,
    getRaweFetFit,
};
