const cfldTechnicalParameterRepository = require('../../repositories/forms/cfldTechnicalParameterRepository');
const prisma = require('../../config/prisma.js');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../../utils/errorHandler.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

const TRANSACTION_OPTIONS = {
    maxWait: 5000,
    timeout: 12000,
};

function assertKvkRecordAccess(record, user) {
    if (!record || !user) return;
    if (!['kvk_admin', 'kvk_user'].includes(user.roleName)) return;

    if (Number(record.kvkId) !== Number(user.kvkId)) {
        throw new UnauthorizedError('Unauthorized');
    }
}

const cfldTechnicalParameterService = {
    create: async (data, user) => {
        const result = await cfldTechnicalParameterRepository.create(data, {}, user);
        await invalidateCfldReportCache(result?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await cfldTechnicalParameterRepository.findAll(filters, user);
    },

    findById: async (id) => {
        return await cfldTechnicalParameterRepository.findById(id);
    },

    update: async (id, data, user) => {
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new NotFoundError('CFLD technical parameter');
        assertKvkRecordAccess(existing, user);
        const result = await cfldTechnicalParameterRepository.update(id, data);
        await invalidateCfldReportCache(existing.kvkId);
        return result;
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

        assertKvkRecordAccess(source, user);

        if (!source.reportingYear) {
            throw new ValidationError('Cannot transfer CFLD without reportingYear', 'reportingYear');
        }

        // Allow transfer unless already transferred
        if (source.status === 'TRANSFERRED') {
            throw new ValidationError('This CFLD record is already transferred');
        }

        const nextReportingYear = new Date(source.reportingYear);
        if (Number.isNaN(nextReportingYear.getTime())) {
            throw new ValidationError('Invalid source reportingYear for transfer', 'reportingYear');
        }
        nextReportingYear.setFullYear(nextReportingYear.getFullYear() + 1);

        const sourceEconomic = (source.economicParameters || [])[0] || null;
        const sourceSocio = (source.socioEconomicParameters || [])[0] || null;
        const sourcePerception = (source.farmersPerceptionParameters || [])[0] || null;

        const transferred = await prisma.$transaction(async (tx) => {
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
                    reportingYear: nextReportingYear,
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
        }, TRANSACTION_OPTIONS);
        await invalidateCfldReportCache(source.kvkId);
        return transferred;
    },

    delete: async (id, user) => {
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new NotFoundError('CFLD technical parameter');
        assertKvkRecordAccess(existing, user);
        const deleted = await cfldTechnicalParameterRepository.delete(id);
        await invalidateCfldReportCache(existing.kvkId);
        return deleted;
    }
};

async function invalidateCfldReportCache(kvkId) {
    if (!kvkId) return;
    try {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('cfldCombined', kvkId);
    } catch (error) {
        // Non-blocking cache cleanup; writes should still succeed.
        console.warn('Failed to invalidate CFLD report cache:', error?.message || error);
    }
}

module.exports = cfldTechnicalParameterService;
