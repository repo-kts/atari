const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

function normalizeTspScspType(value) {
    const normalized = String(value || '').trim().toUpperCase();
    if (normalized === 'TSP' || normalized === 'SCSP') return normalized;
    throw new Error('Invalid TSP/SCSP type. Allowed values are TSP or SCSP.');
}

function safeParseInt(value) {
    if (value === undefined || value === null || value === '') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
}

function safeParseFloat(value) {
    if (value === undefined || value === null || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

async function resolveActivityId(rawActivityId, rawActivityName) {
    const parsedId = rawActivityId !== undefined && rawActivityId !== null && rawActivityId !== ''
        ? parseInt(rawActivityId)
        : NaN;

    if (!isNaN(parsedId)) {
        const byId = await prisma.tspScspActivities.findUnique({
            where: { tspScspActivityId: parsedId },
            select: { tspScspActivityId: true },
        });
        if (byId) return byId.tspScspActivityId;
    }

    const fallbackName = rawActivityName || (!isNaN(parsedId) ? `Activity ${parsedId}` : '');
    const activityName = String(fallbackName).trim();
    if (!activityName) {
        throw new Error('Valid activity is required');
    }

    const existing = await prisma.tspScspActivities.findFirst({
        where: { activityName: { equals: activityName, mode: 'insensitive' } },
        select: { tspScspActivityId: true },
    });
    if (existing) return existing.tspScspActivityId;

    const created = await prisma.tspScspActivities.create({
        data: { activityName },
        select: { tspScspActivityId: true },
    });
    return created.tspScspActivityId;
}

async function resolveTypeId(rawType) {
    const normalized = String(rawType || '').trim().toUpperCase();
    if (!normalized) return null;
    if (normalized !== 'TSP' && normalized !== 'SCSP') {
        throw new Error('Invalid TSP/SCSP type. Allowed values are TSP or SCSP.');
    }

    const existing = await prisma.tspScspTypeMaster.findFirst({
        where: { typeName: { equals: normalized, mode: 'insensitive' } },
        select: { tspScspTypeId: true },
    });
    if (existing) return existing.tspScspTypeId;

    const created = await prisma.tspScspTypeMaster.create({
        data: { typeName: normalized },
        select: { tspScspTypeId: true },
    });
    return created.tspScspTypeId;
}

const tspScspRepository = {
    create: async (data, user) => {
        const kvkId = parseInt(data.kvkId ?? user?.kvkId);
        if (isNaN(kvkId)) throw new Error('Valid kvkId is required');
        const type = normalizeTspScspType(data.type);
        const isScsp = type === 'SCSP';
        const tspScspTypeId = await resolveTypeId(type);
        const activityId = await resolveActivityId(data.activityId, data.activityName);

        const tspDistrictId = !isScsp ? safeParseInt(data.districtId) : null;
        if (!isScsp && tspDistrictId === null) {
            throw new Error('Valid districtId is required for TSP');
        }

        const result = await prisma.tspScsp.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                type,
                tspScspTypeId,
                activityId,
                numberOfTrainingsOrDemos: parseInt(data.numberOfTrainingsOrDemos ?? data.noOfTrainings ?? 0),
                numberOfBeneficiaries: parseInt(data.numberOfBeneficiaries ?? data.noOfBeneficiaries ?? 0),
                fundsReceived: !isScsp ? (safeParseFloat(data.fundsReceived) ?? 0) : null,
                achievementFamilyIncomeUnit: !isScsp ? (safeParseFloat(data.achievementFamilyIncomeUnit ?? data.outcome1_unit) ?? 0) : null,
                achievementConsumptionLevelUnit: !isScsp ? (safeParseFloat(data.achievementConsumptionLevelUnit ?? data.outcome2_unit) ?? 0) : null,
                achievementImplementsAvailabilityUnit: !isScsp ? (safeParseFloat(data.achievementImplementsAvailabilityUnit ?? data.outcome3_unit) ?? 0) : null,
                achievementFamilyIncome: !isScsp ? (safeParseFloat(data.achievementFamilyIncome ?? data.outcome1_achievement) ?? 0) : null,
                achievementConsumptionLevel: !isScsp ? (safeParseFloat(data.achievementConsumptionLevel ?? data.outcome2_achievement) ?? 0) : null,
                achievementImplementsAvailability: !isScsp ? (safeParseFloat(data.achievementImplementsAvailability ?? data.outcome3_achievement) ?? 0) : null,
                districtId: isScsp ? null : tspDistrictId,
                subDistrict: !isScsp ? (data.subDistrict || '') : null,
                numberOfVillagesCovered: !isScsp ? (safeParseInt(data.numberOfVillagesCovered ?? data.villagesCount) ?? 0) : null,
                villageNamesCovered: !isScsp ? (data.villageNamesCovered ?? data.villageNames ?? '') : null,
                stMale: !isScsp ? (safeParseInt(data.stMale ?? data.beneficiaryMale) ?? 0) : null,
                stFemale: !isScsp ? (safeParseInt(data.stFemale ?? data.beneficiaryFemale) ?? 0) : null,
                stTotal: !isScsp ? (safeParseInt(data.stTotal ?? data.beneficiaryTotal) ?? 0) : null,
            },
            include: {
                kvk: { select: { kvkName: true } },
                tspScspType: { select: { typeName: true } },
                activity: { select: { activityName: true } },
                district: { select: { districtName: true } },
            },
        });
        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }
        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                if (from) {
                    ensureNotFutureDate(from);
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                if (to) {
                    ensureNotFutureDate(to);
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }

        const results = await prisma.tspScsp.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                tspScspType: { select: { typeName: true } },
                activity: { select: { activityName: true } },
                district: { select: { districtName: true } },
            },
            orderBy: { tspScspId: 'desc' },
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.tspScsp.findUnique({
            where: { tspScspId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                tspScspType: { select: { typeName: true } },
                activity: { select: { activityName: true } },
                district: { select: { districtName: true } },
            },
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const resolvedType =
            data.type !== undefined ? normalizeTspScspType(data.type) : undefined;
        const isScsp = resolvedType === 'SCSP';
        const resolvedTypeId =
            resolvedType !== undefined ? await resolveTypeId(resolvedType) : undefined;
        const resolvedActivityId =
            (data.activityId !== undefined || data.activityName !== undefined)
                ? await resolveActivityId(data.activityId, data.activityName)
                : undefined;

        const result = await prisma.tspScsp.update({
            where: { tspScspId: parseInt(id) },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : undefined,
                type: resolvedType,
                tspScspTypeId: resolvedTypeId,
                activityId: resolvedActivityId,
                numberOfTrainingsOrDemos: data.numberOfTrainingsOrDemos !== undefined || data.noOfTrainings !== undefined
                    ? parseInt(data.numberOfTrainingsOrDemos ?? data.noOfTrainings)
                    : undefined,
                numberOfBeneficiaries: data.numberOfBeneficiaries !== undefined || data.noOfBeneficiaries !== undefined
                    ? parseInt(data.numberOfBeneficiaries ?? data.noOfBeneficiaries)
                    : undefined,
                fundsReceived: isScsp ? null : data.fundsReceived !== undefined ? safeParseFloat(data.fundsReceived) : undefined,
                achievementFamilyIncomeUnit: isScsp ? null :
                    (data.achievementFamilyIncomeUnit !== undefined || data.outcome1_unit !== undefined)
                        ? safeParseFloat(data.achievementFamilyIncomeUnit ?? data.outcome1_unit)
                    : undefined,
                achievementConsumptionLevelUnit: isScsp ? null :
                    (data.achievementConsumptionLevelUnit !== undefined || data.outcome2_unit !== undefined)
                        ? safeParseFloat(data.achievementConsumptionLevelUnit ?? data.outcome2_unit)
                    : undefined,
                achievementImplementsAvailabilityUnit: isScsp ? null :
                    (data.achievementImplementsAvailabilityUnit !== undefined || data.outcome3_unit !== undefined)
                        ? safeParseFloat(data.achievementImplementsAvailabilityUnit ?? data.outcome3_unit)
                    : undefined,
                achievementFamilyIncome: isScsp ? null :
                    (data.achievementFamilyIncome !== undefined || data.outcome1_achievement !== undefined)
                        ? safeParseFloat(data.achievementFamilyIncome ?? data.outcome1_achievement)
                    : undefined,
                achievementConsumptionLevel: isScsp ? null :
                    (data.achievementConsumptionLevel !== undefined || data.outcome2_achievement !== undefined)
                        ? safeParseFloat(data.achievementConsumptionLevel ?? data.outcome2_achievement)
                    : undefined,
                achievementImplementsAvailability: isScsp ? null :
                    (data.achievementImplementsAvailability !== undefined || data.outcome3_achievement !== undefined)
                        ? safeParseFloat(data.achievementImplementsAvailability ?? data.outcome3_achievement)
                    : undefined,
                districtId: isScsp ? null : data.districtId ? safeParseInt(data.districtId) : undefined,
                subDistrict: isScsp ? null : data.subDistrict !== undefined ? data.subDistrict : undefined,
                numberOfVillagesCovered: data.numberOfVillagesCovered !== undefined || data.villagesCount !== undefined
                    ? (isScsp ? null : (safeParseInt(data.numberOfVillagesCovered ?? data.villagesCount) ?? 0))
                    : undefined,
                villageNamesCovered: data.villageNamesCovered !== undefined || data.villageNames !== undefined
                    ? (isScsp ? null : (data.villageNamesCovered ?? data.villageNames))
                    : undefined,
                stMale: isScsp ? null :
                    data.stMale !== undefined || data.beneficiaryMale !== undefined
                        ? (safeParseInt(data.stMale ?? data.beneficiaryMale) ?? 0)
                        : undefined,
                stFemale: isScsp ? null :
                    data.stFemale !== undefined || data.beneficiaryFemale !== undefined
                        ? (safeParseInt(data.stFemale ?? data.beneficiaryFemale) ?? 0)
                        : undefined,
                stTotal: isScsp ? null :
                    data.stTotal !== undefined || data.beneficiaryTotal !== undefined
                        ? (safeParseInt(data.stTotal ?? data.beneficiaryTotal) ?? 0)
                        : undefined,
            },
            include: {
                kvk: { select: { kvkName: true } },
                tspScspType: { select: { typeName: true } },
                activity: { select: { activityName: true } },
                district: { select: { districtName: true } },
            },
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.tspScsp.delete({
            where: { tspScspId: parseInt(id) },
        });
    },
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.tspScspId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        reportingYear: r.reportingYear,
        yearName: formatReportingYear(r.reportingYear),
        type: r.type,
        typeName: r.tspScspType?.typeName ?? r.type,
        tspScspTypeId: r.tspScspTypeId,
        activityId: r.activityId,
        activityName: r.activity?.activityName,
        noOfTrainings: r.numberOfTrainingsOrDemos,
        noOfBeneficiaries: r.numberOfBeneficiaries,
        fundsReceived: r.fundsReceived,
        outcome1_unit: r.achievementFamilyIncomeUnit,
        outcome2_unit: r.achievementConsumptionLevelUnit,
        outcome3_unit: r.achievementImplementsAvailabilityUnit,
        outcome1_achievement: r.achievementFamilyIncome,
        outcome2_achievement: r.achievementConsumptionLevel,
        outcome3_achievement: r.achievementImplementsAvailability,
        districtId: r.districtId,
        districtName: r.district?.districtName,
        subDistrict: r.subDistrict,
        villagesCount: r.numberOfVillagesCovered,
        villageNames: r.villageNamesCovered,
        beneficiaryMale: r.stMale,
        beneficiaryFemale: r.stFemale,
        beneficiaryTotal: r.stTotal,
    };
}

module.exports = tspScspRepository;

