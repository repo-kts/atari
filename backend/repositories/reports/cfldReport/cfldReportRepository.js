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

function buildExtensionWhere(kvkId, filters = {}) {
    const where = { kvkId };
    if (filters.startDate || filters.endDate) {
        where.activityDate = {};
        if (filters.startDate) {
            where.activityDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            where.activityDate.lte = new Date(filters.endDate);
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

async function getCfldExtensionActivityData(kvkId, filters = {}) {
    const where = buildExtensionWhere(kvkId, filters);
    const rows = await prisma.extensionActivityOrganized.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                    state: { select: { stateId: true, stateName: true } },
                },
            },
            season: { select: { seasonId: true, seasonName: true } },
            extensionActivity: { select: { extensionActivityId: true, extensionName: true } },
        },
        orderBy: [{ activityDate: 'asc' }, { organizedId: 'asc' }],
    });

    return rows.map(row => {
        const totalM = (row.generalM || 0) + (row.obcM || 0) + (row.scM || 0) + (row.stM || 0);
        const totalF = (row.generalF || 0) + (row.obcF || 0) + (row.scF || 0) + (row.stF || 0);
        return {
            organizedId: row.organizedId,
            kvkId: row.kvkId,
            kvkName: row.kvk?.kvkName || '',
            stateId: row.kvk?.state?.stateId || null,
            stateName: row.kvk?.state?.stateName || '',
            seasonId: row.seasonId || null,
            seasonName: row.season?.seasonName || '',
            extensionActivityId: row.extensionActivityId,
            extensionActivityName: row.extensionActivity?.extensionName || '',
            activityDate: row.activityDate || null,
            placeOfActivity: row.placeOfActivity || '',
            generalM: row.generalM || 0,
            generalF: row.generalF || 0,
            obcM: row.obcM || 0,
            obcF: row.obcF || 0,
            scM: row.scM || 0,
            scF: row.scF || 0,
            stM: row.stM || 0,
            stF: row.stF || 0,
            totalM,
            totalF,
            totalFarmers: totalM + totalF,
        };
    });
}

async function getCfldBudgetUtilizationData(kvkId, filters = {}) {
    const where = { kvkId };
    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.year) {
        const yearRange = buildDateRangeForYear(filters.year);
        if (yearRange) {
            where.reportingYearDate = {
                gte: yearRange.start,
                lte: yearRange.end,
            };
        }
    }

    const rows = await prisma.kvkBudgetUtilization.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                    state: { select: { stateId: true, stateName: true } },
                },
            },
            season: { select: { seasonId: true, seasonName: true } },
            crop: { select: { cropId: true, cropName: true } },
            items: {
                include: { budgetItem: { select: { budgetItemId: true, itemName: true } } },
            },
        },
        orderBy: [{ budgetId: 'asc' }],
    });

    return rows.map(row => {
        const items = (row.items || []).map(item => {
            const received = Number(item.budgetReceived || 0);
            const utilized = Number(item.budgetUtilized || 0);
            return {
                budgetItemId: item.budgetItemId,
                itemName: item.budgetItem?.itemName || '',
                budgetReceived: received,
                budgetUtilized: utilized,
                balance: received - utilized,
            };
        });
        return {
            budgetId: row.budgetId,
            kvkId: row.kvkId,
            kvkName: row.kvk?.kvkName || '',
            stateId: row.kvk?.state?.stateId || null,
            stateName: row.kvk?.state?.stateName || '',
            reportingYearDate: row.reportingYearDate || null,
            seasonId: row.seasonId || null,
            seasonName: row.season?.seasonName || '',
            cropId: row.cropId || null,
            cropName: row.crop?.cropName || '',
            overallFundAllocation: Number(row.overallFundAllocation || 0),
            areaAllotted: Number(row.areaAllotted || 0),
            areaAchieved: Number(row.areaAchieved || 0),
            items,
        };
    });
}

module.exports = {
    getCfldCombinedData,
    getCfldExtensionActivityData,
    getCfldBudgetUtilizationData,
};
