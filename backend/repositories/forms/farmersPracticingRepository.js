const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    translatePrismaError,
} = require('../../utils/errorHandler.js');

const RESOURCE_NAME = 'Farmers practicing record';

const KVK_ROLES = ['kvk_admin', 'kvk_user'];
const isKvkUser = (user) => user && (KVK_ROLES.includes(user.roleName) || user.kvkId);

/** RFC 4122 UUID string (version nibble 1–5, variant 8/9/a/b; case-insensitive). */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {unknown} raw
 * @returns {string} Normalized lowercase UUID string
 */
function parseFarmersPracticingId(raw) {
    if (raw === null || raw === undefined) {
        throw new ValidationError('Record id is required.', 'id');
    }
    const s = String(raw).trim();
    if (!s) {
        throw new ValidationError('Record id cannot be empty.', 'id');
    }
    if (!UUID_REGEX.test(s)) {
        throw new ValidationError(
            'Invalid record id. Use a valid UUID (e.g. 550e8400-e29b-41d4-a716-446655440000).',
            'id',
        );
    }
    return s.toLowerCase();
}

function getKvkId(user, data) {
    const id = (user && user.kvkId) ? parseInt(user.kvkId, 10) : (data.kvkId ? parseInt(data.kvkId, 10) : null);
    if (!id || Number.isNaN(id)) {
        throw new ValidationError('A valid kvkId is required to save this record.', 'kvkId');
    }
    return id;
}

function requireKvkScopeForUser(user) {
    if (!isKvkUser(user)) return null;
    const kid = parseInt(user.kvkId, 10);
    if (Number.isNaN(kid)) {
        throw new UnauthorizedError('Your account is not linked to a valid KVK.');
    }
    return kid;
}

const safeFloat = (val, d = 0) => { const n = parseFloat(val); return isNaN(n) ? d : n; };
const safeInt = (val, d = null) => {
    if (val === null || val === undefined || val === '') return d;
    const n = parseInt(val, 10);
    return isNaN(n) ? d : n;
};

/**
 * Pick first float from payload by key order (supports both Prisma/API names and form aliases).
 * Returns undefined if none of the keys are set (keeps existing on update).
 */
function pickFloatFromPayload(data, ...keys) {
    if (!data) return undefined;
    for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(data, k)) {
            const v = data[k];
            if (v !== undefined && v !== null && v !== '') {
                return safeFloat(v, null);
            }
        }
    }
    return undefined;
}

/** String / nullable text field from payload. */
function pickStrFromPayload(data, ...keys) {
    if (!data) return undefined;
    for (const k of keys) {
        if (Object.prototype.hasOwnProperty.call(data, k)) {
            const v = data[k];
            if (v === undefined) continue;
            if (v === null || v === '') return null;
            return String(v);
        }
    }
    return undefined;
}

function mapFarmersFormToCreate(data) {
    return {
        reportingYear: parseReportingYearDate(data.reportingYear || data.year),
        farmerName: data.farmerName || '',
        contactNumber: String(data.contactNumber || ''),
        villageName: data.villageName || '',
        address: data.address || '',
        noOfIndigenousCows: (data.noOfIndigenousCows || data.noOfAnimals) ? safeInt(data.noOfIndigenousCows || data.noOfAnimals, null) : null,
        landHolding: data.landHolding ? safeFloat(data.landHolding, null) : null,
        normalCropsGrown: data.normalCropsGrown !== undefined && data.normalCropsGrown !== '' ? safeInt(data.normalCropsGrown, null) : null,
        practicingYearsOfNaturalFarming: data.practicingYearOfNaturalFarming != null && data.practicingYearOfNaturalFarming !== ''
            ? String(data.practicingYearOfNaturalFarming)
            : null,
        areaCoveredUnderNaturalFarming: safeFloat(data.areaCoveredUnderNaturalFarming || data.area || data.areaInHa, 0),
        cropGrownUnderNaturalFarming: data.cropGrownUnderNaturalFarming || '',
        naturalFarmingTechnologyPracticingAdopted: data.naturalFarmingTechnologyPracticingAdopted || '',
        plantHeightWithout: (data.without_practicing_plantHeight || data.without_plantHeight || data.without_plantWeight)
            ? safeFloat(data.without_practicing_plantHeight || data.without_plantHeight || data.without_plantWeight, null) : null,
        plantHeightWith: (data.with_practicing_plantHeight || data.with_plantHeight || data.with_plantWeight)
            ? safeFloat(data.with_practicing_plantHeight || data.with_plantHeight || data.with_plantWeight, null) : null,
        otherRelevantParameterWithout: (data.without_otherParameter || data.without_practicing_otherParameter)
            ? safeFloat(data.without_otherParameter || data.without_practicing_otherParameter, null) : null,
        otherRelevantParameterWith: (data.with_otherParameter || data.with_practicing_otherParameter)
            ? safeFloat(data.with_otherParameter || data.with_practicing_otherParameter, null) : null,
        yieldWithout: (data.without_yield || data.without_practicing_yield) ? safeFloat(data.without_yield || data.without_practicing_yield, null) : null,
        yieldWith: (data.with_yield || data.with_practicing_yield) ? safeFloat(data.with_yield || data.with_practicing_yield, null) : null,
        costWithout: (data.without_costOfCultivation || data.without_practicing_costOfCultivation)
            ? safeFloat(data.without_costOfCultivation || data.without_practicing_costOfCultivation, null) : null,
        costWith: (data.with_costOfCultivation || data.with_practicing_costOfCultivation)
            ? safeFloat(data.with_costOfCultivation || data.with_practicing_costOfCultivation, null) : null,
        grossReturnWithout: (data.without_grossReturn || data.without_practicing_grossReturn)
            ? safeFloat(data.without_grossReturn || data.without_practicing_grossReturn, null) : null,
        grossReturnWith: (data.with_grossReturn || data.with_practicing_grossReturn)
            ? safeFloat(data.with_grossReturn || data.with_practicing_grossReturn, null) : null,
        netReturnWithout: (data.without_netReturn || data.without_practicing_netReturn)
            ? safeFloat(data.without_netReturn || data.without_practicing_netReturn, null) : null,
        netReturnWith: (data.with_netReturn || data.with_practicing_netReturn)
            ? safeFloat(data.with_netReturn || data.with_practicing_netReturn, null) : null,
        bcRatioWithout: (data.without_practicing_bcRatio || data.without_bcrRatio || data.without_practicing_bcrRatio)
            ? safeFloat(data.without_practicing_bcRatio || data.without_bcrRatio || data.without_practicing_bcrRatio, null) : null,
        bcRatioWith: (data.with_practicing_bcRatio || data.with_bcrRatio || data.with_practicing_bcrRatio)
            ? safeFloat(data.with_practicing_bcRatio || data.with_bcrRatio || data.with_practicing_bcrRatio, null) : null,
        soilPhWithout: (data.without_soilPh || data.without_practicing_soilPh) ? safeFloat(data.without_soilPh || data.without_practicing_soilPh, null) : null,
        soilPhWith: (data.with_soilPh || data.with_practicing_soilPh) ? safeFloat(data.with_soilPh || data.with_practicing_soilPh, null) : null,
        soilOcWithout: (data.without_soilOc || data.without_practicing_soilOc) ? safeFloat(data.without_soilOc || data.without_practicing_soilOc, null) : null,
        soilOcWith: (data.with_soilOc || data.with_practicing_soilOc) ? safeFloat(data.with_soilOc || data.with_practicing_soilOc, null) : null,
        soilEcWithout: (data.without_practicing_soilEc || data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt)
            ? safeFloat(data.without_practicing_soilEc || data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt, null) : null,
        soilEcWith: (data.with_practicing_soilEc || data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt)
            ? safeFloat(data.with_practicing_soilEc || data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt, null) : null,
        availableNWithout: (data.without_availableN || data.without_practicing_availableN)
            ? safeFloat(data.without_availableN || data.without_practicing_availableN, null) : null,
        availableNWith: (data.with_availableN || data.with_practicing_availableN)
            ? safeFloat(data.with_availableN || data.with_practicing_availableN, null) : null,
        availablePWithout: (data.without_availableP || data.without_practicing_availableP)
            ? safeFloat(data.without_availableP || data.without_practicing_availableP, null) : null,
        availablePWith: (data.with_availableP || data.with_practicing_availableP)
            ? safeFloat(data.with_availableP || data.with_practicing_availableP, null) : null,
        availableKWithout: (data.without_availableK || data.without_practicing_availableK)
            ? safeFloat(data.without_availableK || data.without_practicing_availableK, null) : null,
        availableKWith: (data.with_availableK || data.with_practicing_availableK)
            ? safeFloat(data.with_availableK || data.with_practicing_availableK, null) : null,
        soilMicrobesWithout: (data.without_practicing_soilMicrobes || data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial)
            ? safeFloat(data.without_practicing_soilMicrobes || data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial, null) : null,
        soilMicrobesWith: (data.with_practicing_soilMicrobes || data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial)
            ? safeFloat(data.with_practicing_soilMicrobes || data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial, null) : null,
        anyOtherWithout: (data.without_practicing_anyOtherSpecific || data.without_anyOtherSpecific || data.without_practicing_populationDensity)
            ? safeFloat(data.without_practicing_anyOtherSpecific || data.without_anyOtherSpecific || data.without_practicing_populationDensity, null) : null,
        anyOtherWith: (data.with_practicing_anyOtherSpecific || data.with_anyOtherSpecific || data.with_practicing_populationDensity)
            ? safeFloat(data.with_practicing_anyOtherSpecific || data.with_anyOtherSpecific || data.with_practicing_populationDensity, null) : null,
        farmerFeedback: data.farmerFeedback || data.farmersFeedback || '',
        images: (data.images || data.demoImages)
            ? (typeof (data.images || data.demoImages) === 'string' ? (data.images || data.demoImages) : JSON.stringify(data.images || data.demoImages))
            : null,
    };
}

function mapDbRowToApi(r) {
    return {
        ...r,
        id: r.farmersPracticingId,
        reportingYear: formatReportingYear(r.reportingYear),
        kvkName: r.kvk?.kvkName,
        stateId: r.kvk?.stateId,
        stateName: r.kvk?.state?.stateName || null,
        practicingYearOfNaturalFarming: r.practicingYearsOfNaturalFarming,
        without_practicing_plantHeight: r.plantHeightWithout,
        without_practicing_plantWeight: r.plantHeightWithout,
        with_practicing_plantHeight: r.plantHeightWith,
        with_practicing_plantWeight: r.plantHeightWith,
        without_practicing_yield: r.yieldWithout,
        with_practicing_yield: r.yieldWith,
        without_practicing_costOfCultivation: r.costWithout,
        with_practicing_costOfCultivation: r.costWith,
        without_practicing_grossReturn: r.grossReturnWithout,
        with_practicing_grossReturn: r.grossReturnWith,
        without_practicing_netReturn: r.netReturnWithout,
        with_practicing_netReturn: r.netReturnWith,
        without_practicing_bcrRatio: r.bcRatioWithout,
        without_practicing_bcRatio: r.bcRatioWithout,
        with_practicing_bcrRatio: r.bcRatioWith,
        with_practicing_bcRatio: r.bcRatioWith,
        without_practicing_soilPh: r.soilPhWithout,
        with_practicing_soilPh: r.soilPhWith,
        without_practicing_soilOc: r.soilOcWithout,
        with_practicing_soilOc: r.soilOcWith,
        without_practicing_otherParameter: r.otherRelevantParameterWithout,
        with_practicing_otherParameter: r.otherRelevantParameterWith,
        without_practicing_soilEc: r.soilEcWithout,
        without_practicing_solubleSalt: r.soilEcWithout,
        with_practicing_soilEc: r.soilEcWith,
        with_practicing_solubleSalt: r.soilEcWith,
        without_practicing_availableN: r.availableNWithout,
        with_practicing_availableN: r.availableNWith,
        without_practicing_availableP: r.availablePWithout,
        with_practicing_availableP: r.availablePWith,
        without_practicing_availableK: r.availableKWithout,
        with_practicing_availableK: r.availableKWith,
        without_practicing_soilMicrobes: r.soilMicrobesWithout,
        without_practicing_soilMicrobial: r.soilMicrobesWithout,
        with_practicing_soilMicrobes: r.soilMicrobesWith,
        with_practicing_soilMicrobial: r.soilMicrobesWith,
        without_practicing_anyOtherSpecific: r.anyOtherWithout,
        without_practicing_populationDensity: r.anyOtherWithout,
        with_practicing_anyOtherSpecific: r.anyOtherWith,
        with_practicing_populationDensity: r.anyOtherWith,
        farmersFeedback: r.farmerFeedback,
    };
}

const farmersPracticingRepository = {
    create: async (data, user) => {
        try {
            const kvkId = getKvkId(user, data);
            const mapped = mapFarmersFormToCreate(data);
            return await prisma.farmersPracticingNaturalFarming.create({
                data: { kvkId, ...mapped },
            });
        } catch (e) {
            if (e instanceof ValidationError || e instanceof UnauthorizedError) throw e;
            throw translatePrismaError(e, RESOURCE_NAME, 'create');
        }
    },
    findAll: async (filters, user) => {
        try {
            const where = {};
            const scoped = requireKvkScopeForUser(user);
            if (scoped != null) where.kvkId = scoped;
            else if (filters?.kvkId) where.kvkId = parseInt(String(filters.kvkId), 10);

            const records = await prisma.farmersPracticingNaturalFarming.findMany({
                where,
                include: {
                    kvk: { select: { kvkName: true, stateId: true, state: { select: { stateName: true } } } },
                },
                orderBy: [{ reportingYear: 'desc' }, { farmersPracticingId: 'desc' }],
            });
            return records.map(mapDbRowToApi);
        } catch (e) {
            if (e instanceof UnauthorizedError) throw e;
            throw translatePrismaError(e, RESOURCE_NAME, 'list');
        }
    },
    findById: async (id, user) => {
        try {
            const farmersPracticingId = parseFarmersPracticingId(id);
            const where = { farmersPracticingId };
            const scoped = requireKvkScopeForUser(user);
            if (scoped != null) where.kvkId = scoped;
            const r = await prisma.farmersPracticingNaturalFarming.findFirst({
                where,
                include: {
                    kvk: { select: { kvkName: true, stateId: true, state: { select: { stateName: true } } } },
                },
            });
            if (!r) return null;
            return mapDbRowToApi(r);
        } catch (e) {
            if (e instanceof ValidationError || e instanceof UnauthorizedError) throw e;
            throw translatePrismaError(e, RESOURCE_NAME, 'get');
        }
    },
    update: async (id, data, user) => {
        try {
            const farmersPracticingId = parseFarmersPracticingId(id);
            const where = { farmersPracticingId };
            const scoped = requireKvkScopeForUser(user);
            if (scoped != null) where.kvkId = scoped;
            const existing = await prisma.farmersPracticingNaturalFarming.findFirst({ where });
            if (!existing) throw new NotFoundError(RESOURCE_NAME);

            return await prisma.farmersPracticingNaturalFarming.update({
                where: { farmersPracticingId },
                data: {
                    reportingYear: (data.reportingYear || data.year) !== undefined
                        ? parseReportingYearDate(data.reportingYear || data.year)
                        : existing.reportingYear,
                    farmerName: data.farmerName !== undefined ? data.farmerName : existing.farmerName,
                    contactNumber: data.contactNumber !== undefined ? String(data.contactNumber) : existing.contactNumber,
                    villageName: data.villageName !== undefined ? data.villageName : existing.villageName,
                    address: data.address !== undefined ? data.address : existing.address,
                    noOfIndigenousCows: (data.noOfIndigenousCows !== undefined || data.noOfAnimals !== undefined)
                        ? safeInt(data.noOfIndigenousCows ?? data.noOfAnimals, null)
                        : existing.noOfIndigenousCows,
                    landHolding: data.landHolding !== undefined ? safeFloat(data.landHolding, null) : existing.landHolding,
                    normalCropsGrown: data.normalCropsGrown !== undefined
                        ? (data.normalCropsGrown === '' ? null : safeInt(data.normalCropsGrown, null))
                        : existing.normalCropsGrown,
                    practicingYearsOfNaturalFarming: (() => {
                        const v = pickStrFromPayload(data, 'practicingYearsOfNaturalFarming', 'practicingYearOfNaturalFarming');
                        return v !== undefined ? v : existing.practicingYearsOfNaturalFarming;
                    })(),
                    areaCoveredUnderNaturalFarming: (data.areaCoveredUnderNaturalFarming !== undefined || data.area !== undefined || data.areaInHa !== undefined)
                        ? safeFloat(data.areaCoveredUnderNaturalFarming ?? data.area ?? data.areaInHa, 0)
                        : existing.areaCoveredUnderNaturalFarming,
                    cropGrownUnderNaturalFarming: data.cropGrownUnderNaturalFarming !== undefined
                        ? data.cropGrownUnderNaturalFarming
                        : existing.cropGrownUnderNaturalFarming,
                    naturalFarmingTechnologyPracticingAdopted: data.naturalFarmingTechnologyPracticingAdopted !== undefined
                        ? data.naturalFarmingTechnologyPracticingAdopted
                        : existing.naturalFarmingTechnologyPracticingAdopted,
                    plantHeightWithout: (() => {
                        const v = pickFloatFromPayload(data,
                            'plantHeightWithout',
                            'without_practicing_plantHeight', 'without_plantHeight', 'without_plantWeight');
                        return v !== undefined ? v : existing.plantHeightWithout;
                    })(),
                    plantHeightWith: (() => {
                        const v = pickFloatFromPayload(data,
                            'plantHeightWith',
                            'with_practicing_plantHeight', 'with_plantHeight', 'with_plantWeight');
                        return v !== undefined ? v : existing.plantHeightWith;
                    })(),
                    otherRelevantParameterWithout: (() => {
                        const v = pickFloatFromPayload(data,
                            'otherRelevantParameterWithout',
                            'without_otherParameter', 'without_practicing_otherParameter');
                        return v !== undefined ? v : existing.otherRelevantParameterWithout;
                    })(),
                    otherRelevantParameterWith: (() => {
                        const v = pickFloatFromPayload(data,
                            'otherRelevantParameterWith',
                            'with_otherParameter', 'with_practicing_otherParameter');
                        return v !== undefined ? v : existing.otherRelevantParameterWith;
                    })(),
                    yieldWithout: (() => {
                        const v = pickFloatFromPayload(data, 'yieldWithout', 'without_yield', 'without_practicing_yield');
                        return v !== undefined ? v : existing.yieldWithout;
                    })(),
                    yieldWith: (() => {
                        const v = pickFloatFromPayload(data, 'yieldWith', 'with_yield', 'with_practicing_yield');
                        return v !== undefined ? v : existing.yieldWith;
                    })(),
                    costWithout: (() => {
                        const v = pickFloatFromPayload(data, 'costWithout', 'without_costOfCultivation', 'without_practicing_costOfCultivation');
                        return v !== undefined ? v : existing.costWithout;
                    })(),
                    costWith: (() => {
                        const v = pickFloatFromPayload(data, 'costWith', 'with_costOfCultivation', 'with_practicing_costOfCultivation');
                        return v !== undefined ? v : existing.costWith;
                    })(),
                    grossReturnWithout: (() => {
                        const v = pickFloatFromPayload(data, 'grossReturnWithout', 'without_grossReturn', 'without_practicing_grossReturn');
                        return v !== undefined ? v : existing.grossReturnWithout;
                    })(),
                    grossReturnWith: (() => {
                        const v = pickFloatFromPayload(data, 'grossReturnWith', 'with_grossReturn', 'with_practicing_grossReturn');
                        return v !== undefined ? v : existing.grossReturnWith;
                    })(),
                    netReturnWithout: (() => {
                        const v = pickFloatFromPayload(data, 'netReturnWithout', 'without_netReturn', 'without_practicing_netReturn');
                        return v !== undefined ? v : existing.netReturnWithout;
                    })(),
                    netReturnWith: (() => {
                        const v = pickFloatFromPayload(data, 'netReturnWith', 'with_netReturn', 'with_practicing_netReturn');
                        return v !== undefined ? v : existing.netReturnWith;
                    })(),
                    bcRatioWithout: (() => {
                        const v = pickFloatFromPayload(data, 'bcRatioWithout',
                            'without_practicing_bcRatio', 'without_bcrRatio', 'without_practicing_bcrRatio');
                        return v !== undefined ? v : existing.bcRatioWithout;
                    })(),
                    bcRatioWith: (() => {
                        const v = pickFloatFromPayload(data, 'bcRatioWith',
                            'with_practicing_bcRatio', 'with_bcrRatio', 'with_practicing_bcrRatio');
                        return v !== undefined ? v : existing.bcRatioWith;
                    })(),
                    soilPhWithout: (() => {
                        const v = pickFloatFromPayload(data, 'soilPhWithout', 'without_soilPh', 'without_practicing_soilPh');
                        return v !== undefined ? v : existing.soilPhWithout;
                    })(),
                    soilPhWith: (() => {
                        const v = pickFloatFromPayload(data, 'soilPhWith', 'with_soilPh', 'with_practicing_soilPh');
                        return v !== undefined ? v : existing.soilPhWith;
                    })(),
                    soilOcWithout: (() => {
                        const v = pickFloatFromPayload(data, 'soilOcWithout', 'without_soilOc', 'without_practicing_soilOc');
                        return v !== undefined ? v : existing.soilOcWithout;
                    })(),
                    soilOcWith: (() => {
                        const v = pickFloatFromPayload(data, 'soilOcWith', 'with_soilOc', 'with_practicing_soilOc');
                        return v !== undefined ? v : existing.soilOcWith;
                    })(),
                    soilEcWithout: (() => {
                        const v = pickFloatFromPayload(data, 'soilEcWithout',
                            'without_practicing_soilEc', 'without_soilEc', 'without_solubleSalt', 'without_practicing_solubleSalt');
                        return v !== undefined ? v : existing.soilEcWithout;
                    })(),
                    soilEcWith: (() => {
                        const v = pickFloatFromPayload(data, 'soilEcWith',
                            'with_practicing_soilEc', 'with_soilEc', 'with_solubleSalt', 'with_practicing_solubleSalt');
                        return v !== undefined ? v : existing.soilEcWith;
                    })(),
                    availableNWithout: (() => {
                        const v = pickFloatFromPayload(data, 'availableNWithout', 'without_availableN', 'without_practicing_availableN');
                        return v !== undefined ? v : existing.availableNWithout;
                    })(),
                    availableNWith: (() => {
                        const v = pickFloatFromPayload(data, 'availableNWith', 'with_availableN', 'with_practicing_availableN');
                        return v !== undefined ? v : existing.availableNWith;
                    })(),
                    availablePWithout: (() => {
                        const v = pickFloatFromPayload(data, 'availablePWithout', 'without_availableP', 'without_practicing_availableP');
                        return v !== undefined ? v : existing.availablePWithout;
                    })(),
                    availablePWith: (() => {
                        const v = pickFloatFromPayload(data, 'availablePWith', 'with_availableP', 'with_practicing_availableP');
                        return v !== undefined ? v : existing.availablePWith;
                    })(),
                    availableKWithout: (() => {
                        const v = pickFloatFromPayload(data, 'availableKWithout', 'without_availableK', 'without_practicing_availableK');
                        return v !== undefined ? v : existing.availableKWithout;
                    })(),
                    availableKWith: (() => {
                        const v = pickFloatFromPayload(data, 'availableKWith', 'with_availableK', 'with_practicing_availableK');
                        return v !== undefined ? v : existing.availableKWith;
                    })(),
                    soilMicrobesWithout: (() => {
                        const v = pickFloatFromPayload(data, 'soilMicrobesWithout',
                            'without_practicing_soilMicrobes', 'without_soilMicrobes', 'without_soilMicrobial', 'without_practicing_soilMicrobial');
                        return v !== undefined ? v : existing.soilMicrobesWithout;
                    })(),
                    soilMicrobesWith: (() => {
                        const v = pickFloatFromPayload(data, 'soilMicrobesWith',
                            'with_practicing_soilMicrobes', 'with_soilMicrobes', 'with_soilMicrobial', 'with_practicing_soilMicrobial');
                        return v !== undefined ? v : existing.soilMicrobesWith;
                    })(),
                    anyOtherWithout: (() => {
                        const v = pickFloatFromPayload(data, 'anyOtherWithout',
                            'without_practicing_anyOtherSpecific', 'without_anyOtherSpecific', 'without_practicing_populationDensity');
                        return v !== undefined ? v : existing.anyOtherWithout;
                    })(),
                    anyOtherWith: (() => {
                        const v = pickFloatFromPayload(data, 'anyOtherWith',
                            'with_practicing_anyOtherSpecific', 'with_anyOtherSpecific', 'with_practicing_populationDensity');
                        return v !== undefined ? v : existing.anyOtherWith;
                    })(),
                    farmerFeedback: (() => {
                        if (data.farmersFeedback !== undefined) return String(data.farmersFeedback);
                        if (data.farmerFeedback !== undefined) return String(data.farmerFeedback);
                        return existing.farmerFeedback;
                    })(),
                    images: (data.images || data.demoImages) !== undefined
                        ? (data.images || data.demoImages
                            ? (typeof (data.images || data.demoImages) === 'string' ? (data.images || data.demoImages) : JSON.stringify(data.images || data.demoImages))
                            : null)
                        : existing.images,
                },
            });
        } catch (e) {
            if (e instanceof ValidationError || e instanceof NotFoundError || e instanceof UnauthorizedError) throw e;
            throw translatePrismaError(e, RESOURCE_NAME, 'update');
        }
    },
    delete: async (id, user) => {
        try {
            const farmersPracticingId = parseFarmersPracticingId(id);
            const where = { farmersPracticingId };
            const scoped = requireKvkScopeForUser(user);
            if (scoped != null) where.kvkId = scoped;
            const existing = await prisma.farmersPracticingNaturalFarming.findFirst({ where });
            if (!existing) throw new NotFoundError(RESOURCE_NAME);
            return await prisma.farmersPracticingNaturalFarming.delete({ where: { farmersPracticingId } });
        } catch (e) {
            if (e instanceof ValidationError || e instanceof NotFoundError || e instanceof UnauthorizedError) throw e;
            throw translatePrismaError(e, RESOURCE_NAME, 'delete');
        }
    },
};

module.exports = { farmersPracticingRepository };
