const cfldTechnicalParameterRepository = require('../../repositories/forms/cfldTechnicalParameterRepository.js');
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

function isSuperAdmin(user) {
    return user?.roleName === 'super_admin' || user?.role === 'super_admin';
}

function wasTouchedAfterCreate(record) {
    if (!record?.createdAt || !record?.updatedAt) return false;
    return new Date(record.updatedAt).getTime() > new Date(record.createdAt).getTime() + 1000;
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

        // Allow transfer unless already transferred
        if (source.status === 'TRANSFERRED') {
            throw new ValidationError('This CFLD record is already transferred');
        }

        const sourceReportingYear = source.reportingYear || source.month;
        if (!sourceReportingYear) {
            throw new ValidationError('Cannot transfer CFLD without reportingYear', 'reportingYear');
        }

        const nextReportingYear = new Date(sourceReportingYear);
        if (Number.isNaN(nextReportingYear.getTime())) {
            throw new ValidationError('Invalid source reportingYear for transfer', 'reportingYear');
        }
        nextReportingYear.setFullYear(nextReportingYear.getFullYear() + 1);

        const currentYear = new Date().getFullYear();
        if (nextReportingYear.getFullYear() > currentYear) {
            throw new ValidationError(
                `Cannot transfer to ${nextReportingYear.getFullYear()}: transfer to a future year is not allowed`,
                'reportingYear'
            );
        }

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
                    cropOther: source.cropOther,
                    month: source.month,
                    typeId: source.typeId,
                    typeOther: source.typeOther,
                    seasonId: source.seasonId,
                    seasonOther: source.seasonOther,
                    reportingYear: nextReportingYear,
                    status: 'ONGOING',
                    transferredFromCfldTechId: source.cfldTechId,
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

    revokeTransfer: async (id, user) => {
        if (!isSuperAdmin(user)) {
            throw new UnauthorizedError('Only superadmin can undo CFLD transfer');
        }

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
        if (source.status !== 'TRANSFERRED') {
            throw new ValidationError('Only transferred CFLD records can have their transfer undone');
        }

        const children = await prisma.cfldTechnicalParameter.findMany({
            where: { transferredFromCfldTechId: cfldTechId },
            include: {
                economicParameters: true,
                socioEconomicParameters: true,
                farmersPerceptionParameters: true,
            },
        });

        for (const child of children) {
            const sections = [
                ...(child.economicParameters || []),
                ...(child.socioEconomicParameters || []),
                ...(child.farmersPerceptionParameters || []),
            ];
            const childWasTouched = child.status !== 'ONGOING' || wasTouchedAfterCreate(child);
            const sectionWasTouched = sections.some((section) => section.status !== 'ONGOING' || wasTouchedAfterCreate(section));
            if (childWasTouched || sectionWasTouched) {
                throw new ValidationError(
                    'Cannot undo: the next-year CFLD already has updates or was completed/transferred again.'
                );
            }
        }

        const restored = await prisma.$transaction(async (tx) => {
            const childIds = children.map((child) => child.cfldTechId);
            if (childIds.length) {
                await tx.cfldTechnicalParameter.deleteMany({
                    where: { cfldTechId: { in: childIds } },
                });
            }
            return tx.cfldTechnicalParameter.update({
                where: { cfldTechId },
                data: { status: 'ONGOING', completedAt: null },
            });
        }, TRANSACTION_OPTIONS);

        await invalidateCfldReportCache(source.kvkId);
        return restored;
    },

    markCompleted: async (id, user) => {
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
        if (source.status === 'TRANSFERRED') {
            throw new ValidationError('Transferred CFLD records cannot be marked completed');
        }

        const economic = source.economicParameters?.[0] || null;
        const socio = source.socioEconomicParameters?.[0] || null;
        const perception = source.farmersPerceptionParameters?.[0] || null;
        if (!economic || !socio || !perception) {
            throw new ValidationError('Save economic, socio economic, and farmers perception details before marking completed');
        }

        const updated = await prisma.$transaction(async (tx) => {
            await tx.cfldEconomicParameters.updateMany({
                where: { cfldTechId },
                data: { status: 'COMPLETED' },
            });
            await tx.cfldSocioEconomicParameters.updateMany({
                where: { cfldTechId },
                data: { status: 'COMPLETED' },
            });
            await tx.cfldFarmersPerceptionParameters.updateMany({
                where: { cfldTechId },
                data: { status: 'COMPLETED' },
            });
            return tx.cfldTechnicalParameter.update({
                where: { cfldTechId },
                data: { status: 'COMPLETED', completedAt: source.completedAt || new Date() },
            });
        }, TRANSACTION_OPTIONS);

        await invalidateCfldReportCache(source.kvkId);
        return updated;
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
