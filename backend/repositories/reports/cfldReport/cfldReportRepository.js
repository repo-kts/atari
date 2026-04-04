const prisma = require('../../../config/prisma.js');

function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) {
        return null;
    }
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            where.createdAt.lte = new Date(filters.endDate);
        }
    }

    if (filters.year) {
        const yearRange = buildDateRangeForYear(filters.year);
        if (yearRange) {
            where.reportingYear = {
                gte: yearRange.start,
                lte: yearRange.end,
            };
        }
    }

    return where;
}

function mapCfldRecord(record) {
    const economic = (record.economicParameters || [])[0] || {};
    const socio = (record.socioEconomicParameters || [])[0] || {};
    const perception = (record.farmersPerceptionParameters || [])[0] || {};
    return {
        cfldTechId: record.cfldTechId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateId: record.kvk?.state?.stateId || null,
        stateName: record.kvk?.state?.stateName || '',
        cropId: record.cropId,
        cropName: record.crop?.cropName || '',
        cropTypeId: record.typeId,
        cropTypeName: record.cropType?.typeName || '',
        seasonId: record.seasonId,
        seasonName: record.season?.seasonName || '',
        reportingYear: record.reportingYear || null,
        status: record.status || '',
        areaInHa: record.areaInHa ?? 0,
        technologyDemonstrated: record.technologyDemonstrated || '',
        existingFarmerPractice: record.existingFarmerPractice || '',
        farmerYield: record.farmerYield ?? 0,
        demoYieldMax: record.demoYieldMax ?? 0,
        demoYieldMin: record.demoYieldMin ?? 0,
        demoYieldAvg: record.demoYieldAvg ?? 0,
        percentIncrease: record.percentIncrease ?? 0,
        districtYield: record.districtYield ?? 0,
        stateYield: record.stateYield ?? 0,
        potentialYield: record.potentialYield ?? 0,
        yieldGapDistrictMinimized: record.yieldGapDistrictMinimized ?? 0,
        yieldGapStateMinimized: record.yieldGapStateMinimized ?? 0,
        yieldGapPotentialMinimized: record.yieldGapPotentialMinimized ?? 0,
        generalM: record.generalM ?? 0,
        generalF: record.generalF ?? 0,
        obcM: record.obcM ?? 0,
        obcF: record.obcF ?? 0,
        scM: record.scM ?? 0,
        scF: record.scF ?? 0,
        stM: record.stM ?? 0,
        stF: record.stF ?? 0,
        trainingPhotoPath: record.trainingPhotoPath || null,
        qualityActionPhotoPath: record.qualityActionPhotoPath || null,
        economic: {
            existingPlotGrossCost: economic.existingPlotGrossCost ?? null,
            existingPlotGrossReturn: economic.existingPlotGrossReturn ?? null,
            existingPlotNetReturn: economic.existingPlotNetReturn ?? null,
            existingPlotBcr: economic.existingPlotBcr ?? null,
            demonstrationPlotGrossCost: economic.demonstrationPlotGrossCost ?? null,
            demonstrationPlotGrossReturn: economic.demonstrationPlotGrossReturn ?? null,
            demonstrationPlotNetReturn: economic.demonstrationPlotNetReturn ?? null,
            demonstrationPlotBcr: economic.demonstrationPlotBcr ?? null,
            additionalIncome: economic.additionalIncome ?? null,
        },
        socio: {
            totalProduceObtainedKg: socio.totalProduceObtainedKg ?? null,
            produceSoldKgPerHousehold: socio.produceSoldKgPerHousehold ?? null,
            sellingRateRsPerKg: socio.sellingRateRsPerKg ?? null,
            produceUsedForOwnSowingKg: socio.produceUsedForOwnSowingKg ?? null,
            produceDistributedToOtherFarmersKg: socio.produceDistributedToOtherFarmersKg ?? null,
            incomeUtilizationPurpose: socio.incomeUtilizationPurpose ?? null,
            employmentGeneratedMandaysPerHousehold: socio.employmentGeneratedMandaysPerHousehold ?? null,
        },
        perception: {
            suitabilityToFarmingSystem: perception.suitabilityToFarmingSystem ?? null,
            likingPreference: perception.likingPreference ?? null,
            affordability: perception.affordability ?? null,
            anyNegativeEffect: perception.anyNegativeEffect ?? null,
            technologyAcceptableToAllGroupVillage: perception.technologyAcceptableToAllGroupVillage ?? null,
            suggestionsForChangeOrImprovementIfAny: perception.suggestionsForChangeOrImprovementIfAny ?? null,
            farmerFeedback: perception.farmerFeedback ?? null,
        },
    };
}

async function getCfldCombinedData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const records = await prisma.cfldTechnicalParameter.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                    state: { select: { stateId: true, stateName: true } },
                },
            },
            crop: { select: { cropName: true } },
            cropType: { select: { typeId: true, typeName: true } },
            season: { select: { seasonId: true, seasonName: true } },
            economicParameters: true,
            socioEconomicParameters: true,
            farmersPerceptionParameters: true,
        },
        orderBy: [{ typeId: 'asc' }, { seasonId: 'asc' }, { cropId: 'asc' }],
    });

    return records.map(mapCfldRecord);
}

module.exports = {
    getCfldCombinedData,
};
