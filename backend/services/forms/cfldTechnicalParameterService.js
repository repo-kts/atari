const cfldTechnicalParameterRepository = require('../../repositories/forms/cfldTechnicalParameterRepository');
const prisma = require('../../config/prisma.js');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../../utils/errorHandler.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');
const { createAttachmentBinding } = require('./formAttachmentBinding.js');

const trainingAttachments = createAttachmentBinding({
    formCode: 'cfld_technical_training',
    primaryKey: 'cfldTechId',
});
const actionAttachments = createAttachmentBinding({
    formCode: 'cfld_technical_action',
    primaryKey: 'cfldTechId',
});

function stripBoth(data) {
    if (!data || typeof data !== 'object') return { payload: data, training: [], action: [] };
    const { trainingAttachmentIds, actionAttachmentIds, ...rest } = data;
    return {
        payload: rest,
        training: Array.isArray(trainingAttachmentIds) ? trainingAttachmentIds : [],
        action: Array.isArray(actionAttachmentIds) ? actionAttachmentIds : [],
    };
}

async function attachBoth(record, training, action, user) {
    if (!record) return;
    await trainingAttachments.attach(record, training, user);
    await actionAttachments.attach(record, action, user);
}

async function decorateBoth(record, user) {
    if (!record) return record;
    const withTraining = await trainingAttachments.decorate(record, user);
    const withAction = await actionAttachments.decorate(withTraining, user);
    // decorate() returns photos/datasheets/documents grouped by kind. Rename
    // to keep training/action distinction in the response.
    const trainingList = await trainingAttachments.decorate(record, user);
    const actionList = await actionAttachments.decorate(record, user);
    return {
        ...withAction,
        trainingPhotos: trainingList.photos || [],
        actionPhotos: actionList.photos || [],
    };
}

async function cleanupBoth(record, user) {
    if (!record) return;
    await trainingAttachments.cleanup(record, user);
    await actionAttachments.cleanup(record, user);
}

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
        const { payload, training, action } = stripBoth(data);
        const result = await cfldTechnicalParameterRepository.create(payload, {}, user);
        await attachBoth(result, training, action, user);
        await invalidateCfldReportCache(result?.kvkId);
        return decorateBoth(result, user);
    },

    findAll: async (filters, user) => {
        const rows = await cfldTechnicalParameterRepository.findAll(filters, user);
        if (rows && Array.isArray(rows.data)) {
            rows.data = await Promise.all(rows.data.map((r) => decorateBoth(r, user)));
            return rows;
        }
        if (Array.isArray(rows)) return Promise.all(rows.map((r) => decorateBoth(r, user)));
        return rows;
    },

    findById: async (id, user) => {
        const record = await cfldTechnicalParameterRepository.findById(id);
        return decorateBoth(record, user);
    },

    update: async (id, data, user) => {
        const { payload, training, action } = stripBoth(data);
        const existing = await cfldTechnicalParameterRepository.findById(id);
        if (!existing) throw new NotFoundError('CFLD technical parameter');
        assertKvkRecordAccess(existing, user);
        const result = await cfldTechnicalParameterRepository.update(id, payload);
        await attachBoth(result ?? existing, training, action, user);
        await invalidateCfldReportCache(existing.kvkId);
        return decorateBoth(result, user);
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
        await cleanupBoth(existing, user);
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
