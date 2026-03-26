const cfldTechnicalParameterRepository = require('../../repositories/forms/cfldTechnicalParameterRepository');
const prisma = require('../../config/prisma.js');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../../utils/errorHandler.js');

const cfldTechnicalParameterService = {
    create: async (data, user) => {
        return await cfldTechnicalParameterRepository.create(data, {}, user);
    },

    findAll: async (filters, user) => {
        return await cfldTechnicalParameterRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await cfldTechnicalParameterRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldTechnicalParameterRepository.update(id, data);
    },

    transferToNextYear: async (id, user) => {
        const cfldTechId = Number(id);
        if (!Number.isFinite(cfldTechId) || cfldTechId <= 0) {
            throw new ValidationError('Invalid CFLD technical parameter id', 'id');
        }

        const source = await prisma.cfldTechnicalParameter.findUnique({
            where: { cfldTechId },
            include: {
                economicParameters: true,
                socioEconomicParameters: true,
                farmersPerceptionParameters: true,
            },
        });

        if (!source) throw new NotFoundError('CFLD technical parameter');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(source.kvkId) !== Number(user.kvkId)) {
            throw new UnauthorizedError('Unauthorized');
        }

        if (!source.reportingYearId) {
            throw new ValidationError('Cannot transfer CFLD without reportingYearId', 'reportingYearId');
        }

        // Allow transfer unless already transferred
        if (source.status === 'TRANSFERRED') {
            throw new ValidationError('This CFLD record is already transferred');
        }

        // Determine next year: try yearId ordering first, then derive from yearName
        let nextYear = await prisma.yearMaster.findFirst({
            where: { yearId: { gt: source.reportingYearId } },
            orderBy: { yearId: 'asc' },
            select: { yearId: true, yearName: true },
        });

        if (!nextYear) {
            const allYears = await prisma.yearMaster.findMany({
                select: { yearId: true, yearName: true },
                orderBy: { yearId: 'asc' },
            });

            const current = allYears.find((y) => y.yearId === source.reportingYearId);
            const currentStart = _extractYearStart(current?.yearName);
            if (currentStart !== null) {
                const candidate = allYears
                    .map((year) => ({ ...year, start: _extractYearStart(year.yearName) }))
                    .filter((year) => year.start !== null && year.start > currentStart)
                    .sort((a, b) => a.start - b.start)[0];
                nextYear = candidate || null;
            }
        }

        if (!nextYear) {
            throw new ValidationError('No next reporting year found for transfer');
        }

        const nextYearId = nextYear.yearId;

        const sourceEconomic = (source.economicParameters || [])[0] || null;
        const sourceSocio = (source.socioEconomicParameters || [])[0] || null;
        const sourcePerception = (source.farmersPerceptionParameters || [])[0] || null;

        return await prisma.$transaction(async (tx) => {
            // Mark source as transferred
            await tx.cfldTechnicalParameter.update({
                where: { cfldTechId: source.cfldTechId },
                data: { status: 'TRANSFERRED' },
            });

            // Mark existing section records as transferred
            await tx.cfldEconomicParameters.updateMany({
                where: { cfldTechId: source.cfldTechId },
                data: { status: 'TRANSFERRED' },
            });
            await tx.cfldSocioEconomicParameters.updateMany({
                where: { cfldTechId: source.cfldTechId },
                data: { status: 'TRANSFERRED' },
            });
            await tx.cfldFarmersPerceptionParameters.updateMany({
                where: { cfldTechId: source.cfldTechId },
                data: { status: 'TRANSFERRED' },
            });

            // Create new technical record for next year
            const newTechnical = await tx.cfldTechnicalParameter.create({
                data: {
                    kvkId: source.kvkId,
                    cropId: source.cropId,
                    month: source.month,
                    typeId: source.typeId,
                    seasonId: source.seasonId,
                    reportingYearId: nextYearId,
                    status: 'ONGOING',
                    varietyName: source.varietyName,
                    areaInHa: source.areaInHa,
                    technologyDemonstrated: source.technologyDemonstrated,
                    existingFarmerPractice: source.existingFarmerPractice,
                    farmerYield: source.farmerYield,
                    demoYieldMax: source.demoYieldMax,
                    demoYieldMin: source.demoYieldMin,
                    demoYieldAvg: source.demoYieldAvg,
                    percentIncrease: source.percentIncrease,
                    districtYield: source.districtYield,
                    stateYield: source.stateYield,
                    potentialYield: source.potentialYield,
                    yieldGapDistrictMinimized: source.yieldGapDistrictMinimized,
                    yieldGapStateMinimized: source.yieldGapStateMinimized,
                    yieldGapPotentialMinimized: source.yieldGapPotentialMinimized,
                    generalM: source.generalM,
                    generalF: source.generalF,
                    obcM: source.obcM,
                    obcF: source.obcF,
                    scM: source.scM,
                    scF: source.scF,
                    stM: source.stM,
                    stF: source.stF,
                    trainingPhotoPath: source.trainingPhotoPath,
                    qualityActionPhotoPath: source.qualityActionPhotoPath,
                },
            });

            // Copy sections to next year
            if (sourceEconomic) {
                await tx.cfldEconomicParameters.create({
                    data: {
                        cfldTechId: newTechnical.cfldTechId,
                        status: 'ONGOING',
                        existingPlotGrossCost: sourceEconomic.existingPlotGrossCost,
                        existingPlotGrossReturn: sourceEconomic.existingPlotGrossReturn,
                        existingPlotNetReturn: sourceEconomic.existingPlotNetReturn,
                        existingPlotBcr: sourceEconomic.existingPlotBcr,
                        demonstrationPlotGrossCost: sourceEconomic.demonstrationPlotGrossCost,
                        demonstrationPlotGrossReturn: sourceEconomic.demonstrationPlotGrossReturn,
                        demonstrationPlotNetReturn: sourceEconomic.demonstrationPlotNetReturn,
                        demonstrationPlotBcr: sourceEconomic.demonstrationPlotBcr,
                        additionalIncome: sourceEconomic.additionalIncome,
                    },
                });
            }

            if (sourceSocio) {
                await tx.cfldSocioEconomicParameters.create({
                    data: {
                        cfldTechId: newTechnical.cfldTechId,
                        status: 'ONGOING',
                        totalProduceObtainedKg: sourceSocio.totalProduceObtainedKg,
                        produceSoldKgPerHousehold: sourceSocio.produceSoldKgPerHousehold,
                        sellingRateRsPerKg: sourceSocio.sellingRateRsPerKg,
                        produceUsedForOwnSowingKg: sourceSocio.produceUsedForOwnSowingKg,
                        produceDistributedToOtherFarmersKg: sourceSocio.produceDistributedToOtherFarmersKg,
                        incomeUtilizationPurpose: sourceSocio.incomeUtilizationPurpose,
                        employmentGeneratedMandaysPerHousehold: sourceSocio.employmentGeneratedMandaysPerHousehold,
                    },
                });
            }

            if (sourcePerception) {
                await tx.cfldFarmersPerceptionParameters.create({
                    data: {
                        cfldTechId: newTechnical.cfldTechId,
                        status: 'ONGOING',
                        suitabilityToFarmingSystem: sourcePerception.suitabilityToFarmingSystem,
                        likingPreference: sourcePerception.likingPreference,
                        affordability: sourcePerception.affordability,
                        anyNegativeEffect: sourcePerception.anyNegativeEffect,
                        technologyAcceptableToAllGroupVillage: sourcePerception.technologyAcceptableToAllGroupVillage,
                        suggestionsForChangeOrImprovementIfAny: sourcePerception.suggestionsForChangeOrImprovementIfAny,
                        farmerFeedback: sourcePerception.farmerFeedback,
                    },
                });
            }

            return newTechnical;
        });
    },

    delete: async (id, user) => {
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new Error('Record not found');

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }
        return await cfldTechnicalParameterRepository.delete(id);
    }
};

module.exports = cfldTechnicalParameterService;

function _extractYearStart(yearName) {
    if (!yearName) return null;
    const match = String(yearName).match(/(19|20)\\d{2}/);
    return match ? Number(match[0]) : null;
}
