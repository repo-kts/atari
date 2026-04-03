/**
 * CFLD Technical Parameter Repository
 * Uses Prisma ORM instead of raw queries for better type safety and maintainability
 */

const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const {
    resolveCropTypeId,
    resolveOrCreateCfldCrop,
    resolveKvkId,
    parseMonth,
    buildKvkScopedWhere,
} = require('../../utils/cfldHelpers.js');
const { ValidationError } = require('../../utils/errorHandler.js');

const TRANSACTION_OPTIONS = {
    maxWait: 5000,
    timeout: 12000,
};

// Repository configuration for reusability
const REPO_CONFIG = {
    model: 'cfldTechnicalParameter',
    idField: 'cfldTechId',
    include: {
        kvk: { select: { kvkName: true } },
        crop: { select: { cropName: true } },
        cropType: { select: { typeId: true, typeName: true } },
        season: { select: { seasonName: true } },
        economicParameters: {
            select: {
                status: true,
                existingPlotGrossCost: true,
                existingPlotGrossReturn: true,
                existingPlotNetReturn: true,
                existingPlotBcr: true,
                demonstrationPlotGrossCost: true,
                demonstrationPlotGrossReturn: true,
                demonstrationPlotNetReturn: true,
                demonstrationPlotBcr: true,
                additionalIncome: true,
            },
        },
        socioEconomicParameters: {
            select: {
                status: true,
                totalProduceObtainedKg: true,
                produceSoldKgPerHousehold: true,
                sellingRateRsPerKg: true,
                produceUsedForOwnSowingKg: true,
                produceDistributedToOtherFarmersKg: true,
                incomeUtilizationPurpose: true,
                employmentGeneratedMandaysPerHousehold: true,
            },
        },
        farmersPerceptionParameters: {
            select: {
                status: true,
                suitabilityToFarmingSystem: true,
                likingPreference: true,
                affordability: true,
                anyNegativeEffect: true,
                technologyAcceptableToAllGroupVillage: true,
                suggestionsForChangeOrImprovementIfAny: true,
                farmerFeedback: true,
            },
        },
    },
    orderBy: { cfldTechId: 'desc' },
};

/**
 * Safely parses a numeric value with fallback
 */
function safeParseFloat(value, fallback = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

/**
 * Safely parses an integer value with fallback
 */
function safeParseInt(value, fallback = 0) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? fallback : parsed;
}

function safeMaybeFloat(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

function safeMaybeText(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text ? text : null;
}

function normalizeActiveSection(data) {
    const raw = (data?.cfldActiveSection || data?.activeCfldSection || data?.section || '').toString().toLowerCase();
    if (raw.includes('economic')) return 'economic';
    if (raw.includes('socio')) return 'socio';
    if (raw.includes('perception')) return 'perception';
    return 'technical';
}

function hasValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
}

function calculatePercentIncrease({ farmerYield, demoYieldAvg }) {
    const farmer = Number(farmerYield);
    const demoAvg = Number(demoYieldAvg);
    if (!Number.isFinite(farmer) || !Number.isFinite(demoAvg) || farmer === 0) {
        return 0;
    }
    return Math.round(((demoAvg - farmer) / farmer) * 100);
}

function validateRequiredTechnicalFields(data) {
    const required = [
        ['month', data.month],
        ['seasonId', data.seasonId],
        ['crop', data.crop || data.cropId],
        ['typeId', data.typeId || data.cropTypeId || data.type || data.typeName],
        ['varietyName', data.varietyName],
        ['areaInHa', data.areaInHa ?? data.areaHectare],
        ['technologyDemonstrated', data.technologyDemonstrated],
        ['existingFarmerPractice', data.existingFarmerPractice],
        ['farmerYield', data.farmerYield ?? data.yieldFarmerField],
        ['demoYieldMax', data.yieldMax ?? data.demoYieldMax],
        ['demoYieldMin', data.yieldMin ?? data.demoYieldMin],
        ['demoYieldAvg', data.yieldAvg ?? data.demoYieldAvg],
        ['districtYield', data.districtYield ?? data.yieldGapDistrict],
        ['stateYield', data.stateYield ?? data.yieldGapState],
        ['potentialYield', data.potentialYield ?? data.yieldGapPotential],
        ['yieldGapDistrictMinimized', data.yieldGapDistrictMinimized ?? data.yieldGapMinimisedDistrict],
        ['yieldGapStateMinimized', data.yieldGapStateMinimized ?? data.yieldGapMinimisedState],
        ['yieldGapPotentialMinimized', data.yieldGapPotentialMinimized ?? data.yieldGapMinimisedPotential],
    ];
    for (const [field, value] of required) {
        if (!hasValue(value)) {
            throw new ValidationError(`${field} is required`, field);
        }
    }
}

async function evaluateCfldCompletionStatus(cfldTechId, tx) {
    const cfldTech = await tx.cfldTechnicalParameter.findUnique({
        where: { cfldTechId },
        include: {
            economicParameters: { select: { status: true } },
            socioEconomicParameters: { select: { status: true } },
            farmersPerceptionParameters: { select: { status: true } },
        },
    });
    if (!cfldTech) return null;

    const economicStatus = cfldTech.economicParameters?.[0]?.status || 'ONGOING';
    const socioStatus = cfldTech.socioEconomicParameters?.[0]?.status || 'ONGOING';
    const perceptionStatus = cfldTech.farmersPerceptionParameters?.[0]?.status || 'ONGOING';
    const allCompleted = [economicStatus, socioStatus, perceptionStatus].every((s) => s === 'COMPLETED');

    const nextStatus = allCompleted ? 'COMPLETED' : 'ONGOING';
    const updatePayload = {
        status: nextStatus,
        completedAt: allCompleted ? (cfldTech.completedAt || new Date()) : null,
    };
    await tx.cfldTechnicalParameter.update({
        where: { cfldTechId },
        data: updatePayload,
    });
}

/**
 * Builds create data object from request data
 */
async function buildCreateData(data, user) {
    validateRequiredTechnicalFields(data);
    const kvkId = resolveKvkId(user, data);
    const seasonId = data.seasonId ? safeParseInt(data.seasonId) : null;
    const month = parseMonth(data.month);
    const reportingYear = parseReportingYearDate(data.reportingYear);
    ensureNotFutureDate(reportingYear);

    // Resolve CFLD crop ID
    let cropId = null;
    if (data.cropId) {
        cropId = safeParseInt(data.cropId);
    } else if (data.crop && data.cropTypeId) {
        // Frontend sends crop name and cropTypeId - resolve CFLD crop
        try {
            cropId = await resolveOrCreateCfldCrop(
                data.crop,
                data.cropTypeId,
                seasonId || 1 // Default to season 1 if not provided
            );
        } catch (error) {
            throw new ValidationError(
                `Failed to resolve CFLD crop: ${error.message}`,
                'crop'
            );
        }
    }

    if (!cropId) {
        throw new ValidationError('Crop ID or crop name with type ID is required', 'crop');
    }

    // Resolve crop type ID from various input formats
    let typeId = null;
    if (data.typeId || data.cropTypeId) {
        typeId = await resolveCropTypeId(data.typeId || data.cropTypeId);
    } else if (data.type || data.typeName) {
        // Try to resolve by name if typeId not provided
        typeId = await resolveCropTypeId(data.type || data.typeName);
    } else {
        throw new ValidationError('Crop type ID is required', 'typeId');
    }

    const farmerYield = safeParseFloat(data.farmerYield || data.yieldFarmerField, 0);
    const demoYieldAvg = safeParseFloat(data.yieldAvg || data.demoYieldAvg, 0);
    const computedPercentIncrease = calculatePercentIncrease({ farmerYield, demoYieldAvg });
    const percentIncreaseInput = data.percentIncrease ?? data.yieldIncreasePercent;
    const percentIncrease = hasValue(percentIncreaseInput)
        ? safeParseInt(percentIncreaseInput, computedPercentIncrease)
        : computedPercentIncrease;

    return {
        kvkId,
        cropId,
        seasonId,
        month,
        typeId,
        ...(reportingYear ? { reportingYear } : {}),
        ...(data.status ? { status: data.status } : {}),
        varietyName: data.varietyName || '',
        areaInHa: safeParseFloat(data.areaInHa || data.areaHectare, 0),
        technologyDemonstrated: data.technologyDemonstrated || '',
        existingFarmerPractice: data.existingFarmerPractice || '',
        farmerYield,
        demoYieldMax: safeParseFloat(data.yieldMax || data.demoYieldMax, 0),
        demoYieldMin: safeParseFloat(data.yieldMin || data.demoYieldMin, 0),
        demoYieldAvg,
        percentIncrease,
        districtYield: safeParseFloat(data.districtYield || data.yieldGapDistrict, 0),
        stateYield: safeParseFloat(data.stateYield || data.yieldGapState, 0),
        potentialYield: safeParseFloat(data.potentialYield || data.yieldGapPotential, 0),
        yieldGapDistrictMinimized: safeParseFloat(
            data.yieldGapDistrictMinimized || data.yieldGapMinimisedDistrict,
            0
        ),
        yieldGapStateMinimized: safeParseFloat(
            data.yieldGapStateMinimized || data.yieldGapMinimisedState,
            0
        ),
        yieldGapPotentialMinimized: safeParseFloat(
            data.yieldGapPotentialMinimized || data.yieldGapMinimisedPotential,
            0
        ),
        generalM: safeParseInt(data.genM || data.generalM, 0),
        generalF: safeParseInt(data.genF || data.generalF, 0),
        obcM: safeParseInt(data.obcM, 0),
        obcF: safeParseInt(data.obcF, 0),
        scM: safeParseInt(data.scM, 0),
        scF: safeParseInt(data.scF, 0),
        stM: safeParseInt(data.stM, 0),
        stF: safeParseInt(data.stF, 0),
        trainingPhotoPath: data.trainingPhotoPath || null,
        qualityActionPhotoPath: data.qualityActionPhotoPath || null,
    };
}

async function upsertEconomicParameters(tx, { cfldTechId, data }) {
    await tx.cfldEconomicParameters.upsert({
        where: {
            cfldTechId,
        },
        update: {
            status: 'COMPLETED',
            existingPlotGrossCost: safeMaybeFloat(data.existingPlotGrossCost),
            existingPlotGrossReturn: safeMaybeFloat(data.existingPlotGrossReturn),
            existingPlotNetReturn: safeMaybeFloat(data.existingPlotNetReturn),
            existingPlotBcr: safeMaybeFloat(data.existingPlotBcr),
            demonstrationPlotGrossCost: safeMaybeFloat(data.demonstrationPlotGrossCost),
            demonstrationPlotGrossReturn: safeMaybeFloat(data.demonstrationPlotGrossReturn),
            demonstrationPlotNetReturn: safeMaybeFloat(data.demonstrationPlotNetReturn),
            demonstrationPlotBcr: safeMaybeFloat(data.demonstrationPlotBcr),
            additionalIncome: safeMaybeFloat(data.additionalIncome),
        },
        create: {
            cfldTechId,
            status: 'COMPLETED',
            existingPlotGrossCost: safeMaybeFloat(data.existingPlotGrossCost),
            existingPlotGrossReturn: safeMaybeFloat(data.existingPlotGrossReturn),
            existingPlotNetReturn: safeMaybeFloat(data.existingPlotNetReturn),
            existingPlotBcr: safeMaybeFloat(data.existingPlotBcr),
            demonstrationPlotGrossCost: safeMaybeFloat(data.demonstrationPlotGrossCost),
            demonstrationPlotGrossReturn: safeMaybeFloat(data.demonstrationPlotGrossReturn),
            demonstrationPlotNetReturn: safeMaybeFloat(data.demonstrationPlotNetReturn),
            demonstrationPlotBcr: safeMaybeFloat(data.demonstrationPlotBcr),
            additionalIncome: safeMaybeFloat(data.additionalIncome),
        },
    });
}

async function upsertSocioEconomicParameters(tx, { cfldTechId, data }) {
    // Don't rely on ON CONFLICT / Prisma upsert: the DB may not have a unique constraint on cfldTechId.
    const existing = await tx.cfldSocioEconomicParameters.findFirst({
        where: { cfldTechId },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        select: { cfldSocioEconomicId: true },
    });

    const payload = {
        status: 'COMPLETED',
        totalProduceObtainedKg: safeMaybeFloat(data.totalProduceObtainedKg),
        produceSoldKgPerHousehold: safeMaybeFloat(data.produceSoldKgPerHousehold),
        sellingRateRsPerKg: safeMaybeFloat(data.sellingRateRsPerKg),
        produceUsedForOwnSowingKg: safeMaybeFloat(data.produceUsedForOwnSowingKg),
        produceDistributedToOtherFarmersKg: safeMaybeFloat(data.produceDistributedToOtherFarmersKg),
        incomeUtilizationPurpose: safeMaybeText(data.incomeUtilizationPurpose),
        employmentGeneratedMandaysPerHousehold: safeMaybeFloat(data.employmentGeneratedMandaysPerHousehold),
    };

    if (existing?.cfldSocioEconomicId) {
        await tx.cfldSocioEconomicParameters.update({
            where: { cfldSocioEconomicId: existing.cfldSocioEconomicId },
            data: payload,
        });
        return;
    }

    await tx.cfldSocioEconomicParameters.create({
        data: { cfldTechId, ...payload },
    });
}

async function upsertFarmersPerceptionParameters(tx, { cfldTechId, data }) {
    // Don't rely on ON CONFLICT / Prisma upsert: the DB may not have a unique constraint on cfldTechId.
    const existing = await tx.cfldFarmersPerceptionParameters.findFirst({
        where: { cfldTechId },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        select: { cfldPerceptionId: true },
    });

    const payload = {
        status: 'COMPLETED',
        suitabilityToFarmingSystem: safeMaybeText(data.suitabilityToFarmingSystem),
        likingPreference: safeMaybeText(data.likingPreference),
        affordability: safeMaybeText(data.affordability),
        anyNegativeEffect: safeMaybeText(data.anyNegativeEffect),
        technologyAcceptableToAllGroupVillage: safeMaybeText(data.technologyAcceptableToAllGroupVillage),
        suggestionsForChangeOrImprovementIfAny: safeMaybeText(data.suggestionsForChangeOrImprovementIfAny),
        farmerFeedback: safeMaybeText(data.farmerFeedback),
    };

    if (existing?.cfldPerceptionId) {
        await tx.cfldFarmersPerceptionParameters.update({
            where: { cfldPerceptionId: existing.cfldPerceptionId },
            data: payload,
        });
        return;
    }

    await tx.cfldFarmersPerceptionParameters.create({
        data: { cfldTechId, ...payload },
    });
}

/**
 * Builds update data object from request data
 */
async function buildUpdateData(data, existing) {
    const updateData = {};

    // Resolve CFLD crop if crop name is provided
    if (data.crop && data.cropTypeId) {
        try {
            const cropId = await resolveOrCreateCfldCrop(
                data.crop,
                data.cropTypeId,
                data.seasonId || existing.seasonId || 1
            );
            updateData.cropId = cropId;
        } catch (error) {
            throw new ValidationError(
                `Failed to resolve CFLD crop: ${error.message}`,
                'crop'
            );
        }
    } else if (data.cropId) {
        updateData.cropId = safeParseInt(data.cropId);
    }

    // Resolve crop type ID if provided
    if (data.typeId !== undefined || data.cropTypeId !== undefined) {
        updateData.typeId = await resolveCropTypeId(data.typeId || data.cropTypeId);
    } else if (data.type !== undefined || data.typeName !== undefined) {
        // Try to resolve by name if typeId not provided
        updateData.typeId = await resolveCropTypeId(data.type || data.typeName);
    }

    // Update other fields
    if (data.seasonId !== undefined) {
        updateData.seasonId = safeParseInt(data.seasonId);
    }

    if (data.month !== undefined) {
        updateData.month = parseMonth(data.month);
    }

    if (data.varietyName !== undefined) updateData.varietyName = data.varietyName;
    if (data.areaInHa !== undefined || data.areaHectare !== undefined) {
        updateData.areaInHa = safeParseFloat(data.areaInHa || data.areaHectare, existing.areaInHa);
    }
    if (data.technologyDemonstrated !== undefined) {
        updateData.technologyDemonstrated = data.technologyDemonstrated;
    }
    if (data.existingFarmerPractice !== undefined) {
        updateData.existingFarmerPractice = data.existingFarmerPractice;
    }
    if (data.farmerYield !== undefined || data.yieldFarmerField !== undefined) {
        updateData.farmerYield = safeParseFloat(
            data.farmerYield || data.yieldFarmerField,
            existing.farmerYield
        );
    }
    if (data.yieldMax !== undefined || data.demoYieldMax !== undefined) {
        updateData.demoYieldMax = safeParseFloat(
            data.yieldMax || data.demoYieldMax,
            existing.demoYieldMax
        );
    }
    if (data.yieldMin !== undefined || data.demoYieldMin !== undefined) {
        updateData.demoYieldMin = safeParseFloat(
            data.yieldMin || data.demoYieldMin,
            existing.demoYieldMin
        );
    }
    if (data.yieldAvg !== undefined || data.demoYieldAvg !== undefined) {
        updateData.demoYieldAvg = safeParseFloat(
            data.yieldAvg || data.demoYieldAvg,
            existing.demoYieldAvg
        );
    }
    if (data.districtYield !== undefined || data.yieldGapDistrict !== undefined) {
        updateData.districtYield = safeParseFloat(
            data.districtYield || data.yieldGapDistrict,
            existing.districtYield
        );
    }
    if (data.stateYield !== undefined || data.yieldGapState !== undefined) {
        updateData.stateYield = safeParseFloat(
            data.stateYield || data.yieldGapState,
            existing.stateYield
        );
    }
    if (data.potentialYield !== undefined || data.yieldGapPotential !== undefined) {
        updateData.potentialYield = safeParseFloat(
            data.potentialYield || data.yieldGapPotential,
            existing.potentialYield
        );
    }
    if (data.yieldGapDistrictMinimized !== undefined || data.yieldGapMinimisedDistrict !== undefined) {
        updateData.yieldGapDistrictMinimized = safeParseFloat(
            data.yieldGapDistrictMinimized || data.yieldGapMinimisedDistrict,
            existing.yieldGapDistrictMinimized
        );
    }
    if (data.yieldGapStateMinimized !== undefined || data.yieldGapMinimisedState !== undefined) {
        updateData.yieldGapStateMinimized = safeParseFloat(
            data.yieldGapStateMinimized || data.yieldGapMinimisedState,
            existing.yieldGapStateMinimized
        );
    }
    if (data.yieldGapPotentialMinimized !== undefined || data.yieldGapMinimisedPotential !== undefined) {
        updateData.yieldGapPotentialMinimized = safeParseFloat(
            data.yieldGapPotentialMinimized || data.yieldGapMinimisedPotential,
            existing.yieldGapPotentialMinimized
        );
    }
    if (data.genM !== undefined || data.generalM !== undefined) {
        updateData.generalM = safeParseInt(data.genM || data.generalM, existing.generalM);
    }
    if (data.genF !== undefined || data.generalF !== undefined) {
        updateData.generalF = safeParseInt(data.genF || data.generalF, existing.generalF);
    }
    if (data.obcM !== undefined) updateData.obcM = safeParseInt(data.obcM, existing.obcM);
    if (data.obcF !== undefined) updateData.obcF = safeParseInt(data.obcF, existing.obcF);
    if (data.scM !== undefined) updateData.scM = safeParseInt(data.scM, existing.scM);
    if (data.scF !== undefined) updateData.scF = safeParseInt(data.scF, existing.scF);
    if (data.stM !== undefined) updateData.stM = safeParseInt(data.stM, existing.stM);
    if (data.stF !== undefined) updateData.stF = safeParseInt(data.stF, existing.stF);
    if (data.trainingPhotoPath !== undefined) {
        updateData.trainingPhotoPath = data.trainingPhotoPath;
    }
    if (data.qualityActionPhotoPath !== undefined) {
        updateData.qualityActionPhotoPath = data.qualityActionPhotoPath;
    }

    if (data.reportingYear !== undefined) {
        const parsed = parseReportingYearDate(data.reportingYear);
        ensureNotFutureDate(parsed);
        updateData.reportingYear = parsed;
    }

    if (data.percentIncrease !== undefined || data.yieldIncreasePercent !== undefined) {
        updateData.percentIncrease = safeParseInt(
            data.percentIncrease ?? data.yieldIncreasePercent,
            existing.percentIncrease
        );
    } else {
        const hasFarmerYield = updateData.farmerYield !== undefined;
        const hasDemoAvg = updateData.demoYieldAvg !== undefined;
        if (!(hasFarmerYield || hasDemoAvg)) {
            return updateData;
        }
        updateData.percentIncrease = calculatePercentIncrease({
            farmerYield: hasFarmerYield ? updateData.farmerYield : existing.farmerYield,
            demoYieldAvg: hasDemoAvg ? updateData.demoYieldAvg : existing.demoYieldAvg,
        });
    }

    return updateData;
}

const cfldTechnicalParameterRepository = {
    /**
     * Create a new CFLD Technical Parameter record
     */
    create: async (data, opts, user) => {
        try {
            const createData = await buildCreateData(data, user);
            const activeSection = normalizeActiveSection(data);

            const result = await prisma.$transaction(async (tx) => {
                const created = await tx[REPO_CONFIG.model].create({
                    data: createData,
                });

                if (activeSection === 'economic') {
                    await upsertEconomicParameters(tx, { cfldTechId: created.cfldTechId, data });
                } else if (activeSection === 'socio') {
                    await upsertSocioEconomicParameters(tx, { cfldTechId: created.cfldTechId, data });
                } else if (activeSection === 'perception') {
                    await upsertFarmersPerceptionParameters(tx, { cfldTechId: created.cfldTechId, data });
                }
                await evaluateCfldCompletionStatus(created.cfldTechId, tx);

                // Re-fetch so included relations reflect upserts (UI hydration)
                return await tx[REPO_CONFIG.model].findUnique({
                    where: { [REPO_CONFIG.idField]: created.cfldTechId },
                    include: REPO_CONFIG.include,
                });
            }, TRANSACTION_OPTIONS);

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Error creating CFLD technical parameter:', error);
            throw new ValidationError(
                `Failed to create CFLD technical parameter: ${error.message}`,
                'create'
            );
        }
    },

    /**
     * Find all CFLD Technical Parameter records with filtering
     */
    findAll: async (filters = {}, user) => {
        try {
            const where = buildKvkScopedWhere(user, filters);

            const results = await prisma[REPO_CONFIG.model].findMany({
                where,
                include: REPO_CONFIG.include,
                orderBy: REPO_CONFIG.orderBy,
            });

            return results.map(_mapResponse);
        } catch (error) {
            console.error('Error finding CFLD technical parameters:', error);
            throw new ValidationError(
                `Failed to fetch CFLD technical parameters: ${error.message}`,
                'findAll'
            );
        }
    },

    /**
     * Find a single CFLD Technical Parameter by ID
     */
    findById: async (id) => {
        try {
            const result = await prisma[REPO_CONFIG.model].findUnique({
                where: { [REPO_CONFIG.idField]: safeParseInt(id) },
                include: REPO_CONFIG.include,
            });

            return result ? _mapResponse(result) : null;
        } catch (error) {
            console.error('Error finding CFLD technical parameter by ID:', error);
            throw new ValidationError(
                `Failed to fetch CFLD technical parameter: ${error.message}`,
                'findById'
            );
        }
    },

    /**
     * Update an existing CFLD Technical Parameter record
     */
    update: async (id, data) => {
        try {
            const cfldTechId = safeParseInt(id);
            const existing = await prisma[REPO_CONFIG.model].findUnique({
                where: { [REPO_CONFIG.idField]: cfldTechId },
            });

            if (!existing) {
                throw new ValidationError('CFLD technical parameter not found', 'id');
            }

            const updateData = await buildUpdateData(data, existing);
            const activeSection = normalizeActiveSection(data);

            const result = await prisma.$transaction(async (tx) => {
                await tx[REPO_CONFIG.model].update({
                    where: { [REPO_CONFIG.idField]: cfldTechId },
                    data: updateData,
                });

                if (activeSection === 'economic') {
                    await upsertEconomicParameters(tx, { cfldTechId, data });
                } else if (activeSection === 'socio') {
                    await upsertSocioEconomicParameters(tx, { cfldTechId, data });
                } else if (activeSection === 'perception') {
                    await upsertFarmersPerceptionParameters(tx, { cfldTechId, data });
                }
                await evaluateCfldCompletionStatus(cfldTechId, tx);

                // Re-fetch so included relations reflect upserts (UI hydration)
                return await tx[REPO_CONFIG.model].findUnique({
                    where: { [REPO_CONFIG.idField]: cfldTechId },
                    include: REPO_CONFIG.include,
                });
            }, TRANSACTION_OPTIONS);

            return _mapResponse(result);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            console.error('Error updating CFLD technical parameter:', error);
            throw new ValidationError(
                `Failed to update CFLD technical parameter: ${error.message}`,
                'update'
            );
        }
    },

    /**
     * Delete a CFLD Technical Parameter record
     */
    delete: async (id) => {
        try {
            return await prisma[REPO_CONFIG.model].delete({
                where: { [REPO_CONFIG.idField]: safeParseInt(id) },
            });
        } catch (error) {
            console.error('Error deleting CFLD technical parameter:', error);
            throw new ValidationError(
                `Failed to delete CFLD technical parameter: ${error.message}`,
                'delete'
            );
        }
    },
};

/**
 * Maps Prisma response to API response format
 * Removed duplicate keys - keeping only one version of each field
 * Includes fields expected by frontend table display
 */
function _mapResponse(r) {
    if (!r) return null;
    
    const economic = Array.isArray(r.economicParameters) ? (r.economicParameters[0] || null) : null;
    const socio = Array.isArray(r.socioEconomicParameters) ? (r.socioEconomicParameters[0] || null) : null;
    const perception = Array.isArray(r.farmersPerceptionParameters) ? (r.farmersPerceptionParameters[0] || null) : null;

    // Calculate total number of farmers
    const numberOfFarmers = (r.generalM || 0) + (r.generalF || 0) + 
                          (r.obcM || 0) + (r.obcF || 0) + 
                          (r.scM || 0) + (r.scF || 0) + 
                          (r.stM || 0) + (r.stF || 0);
    
    return {
        id: r.cfldTechId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        cropId: r.cropId,
        cropName: r.crop ? r.crop.cropName : undefined,
        month: r.month,
        cropTypeId: r.typeId,
        typeName: r.cropType ? r.cropType.typeName : undefined,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        reportingYear: formatReportingYear(r.reportingYear),
        status: r.status,
        completedAt: r.completedAt,
        varietyName: r.varietyName,
        areaInHa: r.areaInHa,
        technologyDemonstrated: r.technologyDemonstrated,
        existingFarmerPractice: r.existingFarmerPractice,
        farmerYield: r.farmerYield,
        demoYieldMax: r.demoYieldMax,
        demoYieldMin: r.demoYieldMin,
        demoYieldAvg: r.demoYieldAvg,
        percentIncrease: r.percentIncrease,
        districtYield: r.districtYield,
        stateYield: r.stateYield,
        potentialYield: r.potentialYield,
        yieldGapDistrictMinimized: r.yieldGapDistrictMinimized,
        yieldGapStateMinimized: r.yieldGapStateMinimized,
        yieldGapPotentialMinimized: r.yieldGapPotentialMinimized,
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        trainingPhotoPath: r.trainingPhotoPath,
        qualityActionPhotoPath: r.qualityActionPhotoPath,
        existingPlotGrossCost: economic?.existingPlotGrossCost,
        existingPlotGrossReturn: economic?.existingPlotGrossReturn,
        existingPlotNetReturn: economic?.existingPlotNetReturn,
        existingPlotBcr: economic?.existingPlotBcr,
        demonstrationPlotGrossCost: economic?.demonstrationPlotGrossCost,
        demonstrationPlotGrossReturn: economic?.demonstrationPlotGrossReturn,
        demonstrationPlotNetReturn: economic?.demonstrationPlotNetReturn,
        demonstrationPlotBcr: economic?.demonstrationPlotBcr,
        additionalIncome: economic?.additionalIncome,
        economicStatus: economic?.status,

        totalProduceObtainedKg: socio?.totalProduceObtainedKg,
        produceSoldKgPerHousehold: socio?.produceSoldKgPerHousehold,
        sellingRateRsPerKg: socio?.sellingRateRsPerKg,
        produceUsedForOwnSowingKg: socio?.produceUsedForOwnSowingKg,
        produceDistributedToOtherFarmersKg: socio?.produceDistributedToOtherFarmersKg,
        incomeUtilizationPurpose: socio?.incomeUtilizationPurpose,
        employmentGeneratedMandaysPerHousehold: socio?.employmentGeneratedMandaysPerHousehold,
        socioStatus: socio?.status,

        suitabilityToFarmingSystem: perception?.suitabilityToFarmingSystem,
        likingPreference: perception?.likingPreference,
        affordability: perception?.affordability,
        anyNegativeEffect: perception?.anyNegativeEffect,
        technologyAcceptableToAllGroupVillage: perception?.technologyAcceptableToAllGroupVillage,
        suggestionsForChangeOrImprovementIfAny: perception?.suggestionsForChangeOrImprovementIfAny,
        farmerFeedback: perception?.farmerFeedback,
        perceptionStatus: perception?.status,
        numberOfFarmers: numberOfFarmers,
    };
}

module.exports = cfldTechnicalParameterRepository;
