const prisma = require('../../config/prisma.js');

const KVK_ROLES = ['kvk_admin', 'kvk_user'];
const isKvkUser = (user) => user && (KVK_ROLES.includes(user.roleName) || user.kvkId);

// ─── Helper ─────────────────────────────────────────────────────────────────
function getKvkId(user, data) {
    const id = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
    if (!id || isNaN(id)) throw new Error('Valid kvkId is required.');
    return id;
}

const safeFloat = (val, d = 0) => { const n = parseFloat(val); return isNaN(n) ? d : n; };
const safeInt = (val, d = 0) => { const n = parseInt(val, 10); return isNaN(n) ? d : n; };
const isOtherActivityName = (value) => String(value || '').trim().toLowerCase() === 'other activity';

async function resolveNaturalFarmingActivity(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') return null;

    const parsedId = parseInt(rawValue, 10);
    if (!isNaN(parsedId)) {
        const byId = await prisma.naturalFarmingActivityMaster.findUnique({
            where: { naturalFarmingActivityId: parsedId },
            select: { naturalFarmingActivityId: true, activityName: true },
        });
        if (byId) return byId;
    }

    const name = String(rawValue).trim();
    if (!name) return null;

    const existing = await prisma.naturalFarmingActivityMaster.findFirst({
        where: { activityName: { equals: name, mode: 'insensitive' } },
        select: { naturalFarmingActivityId: true, activityName: true },
    });
    if (existing) return existing;

    return prisma.naturalFarmingActivityMaster.create({
        data: { activityName: name },
        select: { naturalFarmingActivityId: true, activityName: true },
    });
}

async function resolveNaturalFarmingSoilParameterId(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') return null;

    const parsedId = parseInt(rawValue, 10);
    if (!isNaN(parsedId)) {
        const byId = await prisma.naturalFarmingSoilParameterMaster.findUnique({
            where: { naturalFarmingSoilParameterId: parsedId },
            select: { naturalFarmingSoilParameterId: true },
        });
        if (byId) return byId.naturalFarmingSoilParameterId;
    }

    const name = String(rawValue).trim();
    if (!name) return null;

    const existing = await prisma.naturalFarmingSoilParameterMaster.findFirst({
        where: { parameterName: { equals: name, mode: 'insensitive' } },
        select: { naturalFarmingSoilParameterId: true },
    });
    if (existing) return existing.naturalFarmingSoilParameterId;

    const created = await prisma.naturalFarmingSoilParameterMaster.create({
        data: { parameterName: name },
        select: { naturalFarmingSoilParameterId: true },
    });
    return created.naturalFarmingSoilParameterId;
}

async function resolveStaffCategory(rawValue) {
    if (rawValue === undefined || rawValue === null || rawValue === '') return null;

    const parsedId = parseInt(rawValue, 10);
    if (!isNaN(parsedId)) {
        const byId = await prisma.staffCategoryMaster.findUnique({
            where: { staffCategoryId: parsedId },
            select: { staffCategoryId: true },
        });
        if (byId) return byId.staffCategoryId;
    }

    const name = String(rawValue).trim();
    if (!name) return null;

    const existing = await prisma.staffCategoryMaster.findFirst({
        where: { categoryName: { equals: name, mode: 'insensitive' } },
        select: { staffCategoryId: true },
    });
    if (existing) return existing.staffCategoryId;

    return null;
}

// ─── Geographical Info ───────────────────────────────────────────────────────
const geographicalInfoRepository = {
    create: async (data, user) => {
        const kvkId = getKvkId(user, data);
        const reportingYearId = (data.reportingYearId || data.yearId) ? safeInt(data.reportingYearId || data.yearId, null) : null;
        return await prisma.geographicalInfo.create({
            data: {
                kvkId,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                agroClimaticZone: data.agroClimaticZone || '',
                farmingSituation: data.farmingSituation || '',
                latitude: safeFloat(data.latitude, 0),
                longitude: safeFloat(data.longitude, 0),
                reportingYearId,
            }
        });
    },
    findAll: async (filters, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        else if (filters?.kvkId) where.kvkId = parseInt(filters.kvkId);
        const records = await prisma.geographicalInfo.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true,
            },
            orderBy: { geographicalInfoId: 'desc' }
        });

        return records.map(r => ({
            ...r,
            id: r.geographicalInfoId,
            kvkName: r.kvk?.kvkName,
            reportingYear: r.reportingYear?.yearName,
            reportingYearId: r.reportingYearId,
            yearId: r.reportingYearId,
            startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : null,
            endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : null,
            farmingSituationOfSelectedFarmer: r.farmingSituation,
            latitudeN: r.latitude,
            longitudeE: r.longitude,
        }));
    },
    findById: async (id, user) => {
        const where = { geographicalInfoId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const r = await prisma.geographicalInfo.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true,
            }
        });

        if (!r) return null;
        return {
            ...r,
            id: r.geographicalInfoId,
            kvkName: r.kvk?.kvkName,
            reportingYear: r.reportingYear?.yearName,
            reportingYearId: r.reportingYearId,
            yearId: r.reportingYearId,
            startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : null,
            endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : null,
            farmingSituationOfSelectedFarmer: r.farmingSituation,
            latitudeN: r.latitude,
            longitudeE: r.longitude,
        };
    },
    update: async (id, data, user) => {
        const where = { geographicalInfoId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.geographicalInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const reportingYearId = (data.reportingYearId || data.yearId) !== undefined ?
            (data.reportingYearId || data.yearId ? safeInt(data.reportingYearId || data.yearId, null) : null) :
            existing.reportingYearId;

        return await prisma.geographicalInfo.update({
            where: { geographicalInfoId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                agroClimaticZone: data.agroClimaticZone !== undefined ? data.agroClimaticZone : existing.agroClimaticZone,
                farmingSituation: data.farmingSituation !== undefined ? data.farmingSituation : existing.farmingSituation,
                latitude: data.latitude !== undefined ? safeFloat(data.latitude, 0) : existing.latitude,
                longitude: data.longitude !== undefined ? safeFloat(data.longitude, 0) : existing.longitude,
                reportingYearId,
            }
        });
    },
    delete: async (id, user) => {
        const where = { geographicalInfoId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.geographicalInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.geographicalInfo.delete({ where: { geographicalInfoId: parseInt(id) } });
    },
};

// ─── Physical Info ───────────────────────────────────────────────────────────
const physicalInfoRepository = {
    create: async (data, user) => {
        const kvkId = getKvkId(user, data);
        const resolvedActivity = await resolveNaturalFarmingActivity(data.activityId ?? data.activity ?? data.activityName);
        const isOtherActivity = isOtherActivityName(resolvedActivity?.activityName);
        return await prisma.physicalInfo.create({
            data: {
                kvkId,
                activityId: resolvedActivity?.naturalFarmingActivityId || null,
                trainingTitle: isOtherActivity ? null : (data.trainingTitle || ''),
                trainingDate: isOtherActivity ? null : (data.trainingDate ? new Date(data.trainingDate) : null),
                venue: isOtherActivity ? null : (data.venue || ''),
                generalM: isOtherActivity ? null : safeInt(data.genMale, 0),
                generalF: isOtherActivity ? null : safeInt(data.genFemale, 0),
                obcM: isOtherActivity ? null : safeInt(data.obcMale, 0),
                obcF: isOtherActivity ? null : safeInt(data.obcFemale, 0),
                scM: isOtherActivity ? null : safeInt(data.scMale, 0),
                scF: isOtherActivity ? null : safeInt(data.scFemale, 0),
                stM: isOtherActivity ? null : safeInt(data.stMale, 0),
                stF: isOtherActivity ? null : safeInt(data.stFemale, 0),
                remarks: isOtherActivity ? null : (data.remarks || ''),
                innovativeProgrammeName: isOtherActivity ? (data.innovativeProgrammeName || '') : null,
                significanceOfInnovativeProgramme: isOtherActivity ? (data.significanceOfInnovativeProgramme || '') : null,
                images: isOtherActivity ? null : (data.images || null),
            },
            include: { activityMaster: true },
        });
    },
    findAll: async (filters, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        else if (filters?.kvkId) where.kvkId = parseInt(filters.kvkId);
        const records = await prisma.physicalInfo.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                activityMaster: true,
            },
            orderBy: { physicalInfoId: 'desc' }
        });

        return records.map(r => ({
            ...r,
            id: r.physicalInfoId,
            kvkName: r.kvk?.kvkName,
            activityName: r.activityMaster?.activityName || null,
            genMale: r.generalM,
            genFemale: r.generalF,
            obcMale: r.obcM,
            obcFemale: r.obcF,
            scMale: r.scM,
            scFemale: r.scF,
            stMale: r.stM,
            stFemale: r.stF,
            trainingDate: r.trainingDate ? r.trainingDate.toISOString().split('T')[0] : null,
        }));
    },
    findById: async (id, user) => {
        const where = { physicalInfoId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const r = await prisma.physicalInfo.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                activityMaster: true,
            }
        });

        if (!r) return null;
        return {
            ...r,
            id: r.physicalInfoId,
            kvkName: r.kvk?.kvkName,
            activityName: r.activityMaster?.activityName || null,
            genMale: r.generalM,
            genFemale: r.generalF,
            obcMale: r.obcM,
            obcFemale: r.obcF,
            scMale: r.scM,
            scFemale: r.scF,
            stMale: r.stM,
            stFemale: r.stF,
            trainingDate: r.trainingDate ? r.trainingDate.toISOString().split('T')[0] : null,
        };
    },
    update: async (id, data, user) => {
        const where = { physicalInfoId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId);
        const existing = await prisma.physicalInfo.findFirst({
            where,
            include: { activityMaster: true },
        });
        if (!existing) throw new Error('Record not found or unauthorized');
        const resolvedActivity = (data.activityId !== undefined || data.activity !== undefined || data.activityName !== undefined)
            ? await resolveNaturalFarmingActivity(data.activityId ?? data.activity ?? data.activityName)
            : (existing.activityMaster ? {
                naturalFarmingActivityId: existing.activityMaster.naturalFarmingActivityId,
                activityName: existing.activityMaster.activityName,
            } : null);
        const isOtherActivity = isOtherActivityName(resolvedActivity?.activityName);

        return await prisma.physicalInfo.update({
            where: { physicalInfoId: safeInt(id, 0) },
            data: {
                activityId: resolvedActivity?.naturalFarmingActivityId ?? existing.activityId,
                trainingTitle: isOtherActivity ? null : (data.trainingTitle !== undefined ? data.trainingTitle : existing.trainingTitle),
                trainingDate: isOtherActivity ? null : (data.trainingDate ? new Date(data.trainingDate) : existing.trainingDate),
                venue: isOtherActivity ? null : (data.venue !== undefined ? data.venue : existing.venue),
                generalM: isOtherActivity ? null : (data.genMale !== undefined ? safeInt(data.genMale, 0) : existing.generalM),
                generalF: isOtherActivity ? null : (data.genFemale !== undefined ? safeInt(data.genFemale, 0) : existing.generalF),
                obcM: isOtherActivity ? null : (data.obcMale !== undefined ? safeInt(data.obcMale, 0) : existing.obcM),
                obcF: isOtherActivity ? null : (data.obcFemale !== undefined ? safeInt(data.obcFemale, 0) : existing.obcF),
                scM: isOtherActivity ? null : (data.scMale !== undefined ? safeInt(data.scMale, 0) : existing.scM),
                scF: isOtherActivity ? null : (data.scFemale !== undefined ? safeInt(data.scFemale, 0) : existing.scF),
                stM: isOtherActivity ? null : (data.stMale !== undefined ? safeInt(data.stMale, 0) : existing.stM),
                stF: isOtherActivity ? null : (data.stFemale !== undefined ? safeInt(data.stFemale, 0) : existing.stF),
                remarks: isOtherActivity ? null : (data.remarks !== undefined ? data.remarks : existing.remarks),
                innovativeProgrammeName: isOtherActivity
                    ? (data.innovativeProgrammeName !== undefined ? data.innovativeProgrammeName : existing.innovativeProgrammeName)
                    : null,
                significanceOfInnovativeProgramme: isOtherActivity
                    ? (data.significanceOfInnovativeProgramme !== undefined ? data.significanceOfInnovativeProgramme : existing.significanceOfInnovativeProgramme)
                    : null,
                images: isOtherActivity ? null : (data.images !== undefined ? String(data.images) : existing.images),
            },
            include: { activityMaster: true },
        });
    },
    delete: async (id, user) => {
        const where = { physicalInfoId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId);
        const existing = await prisma.physicalInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.physicalInfo.delete({ where: { physicalInfoId: safeInt(id, 0) } });
    },
};

// ─── Demonstration Info ──────────────────────────────────────────────────────
const demonstrationInfoRepository = {
    create: async (data, user) => {
        const kvkId = getKvkId(user, data);
        const mappedData = {
            kvkId,
            yearId: (data.yearId || data.year) ? safeInt(data.yearId || data.year, null) : null,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : new Date(),
            farmerName: data.farmerName || '',
            villageName: data.villageName || '',
            address: data.address || '',
            contactNumber: String(data.contactNumber || ''),
            staffCategoryId: await resolveStaffCategory(data.staffCategoryId || data.staffCategoryName),
            noOfIndigenousCows: (data.noOfIndigenousCows || data.noOfAnimals) ? safeInt(data.noOfIndigenousCows || data.noOfAnimals, null) : null,
            landHolding: data.landHolding ? safeFloat(data.landHolding, null) : null,
            gender: data.gender || 'MALE',
            category: data.category || 'GENERAL',
            croppingPattern: data.croppingSystem || data.cropSystem || data.croppingPattern || '',
            farmingSituation: data.farmingSituation || '',
            latitude: safeFloat(data.latitude, 0),
            longitude: safeFloat(data.longitude, 0),
            activityName: data.activityName || '',
            crop: data.crop || '',
            variety: data.variety || '',
            seasonId: data.seasonId ? safeInt(data.seasonId, null) : null,
            technologyDemonstrated: data.technologyDemonstrated || '',
            areaInHa: safeFloat(data.area || data.areaInHa, 0),
            farmerPracticeDetails: data.motivationFactors || data.farmerPracticeDetails || '',
            plantHeightWithout: (data.without_plantHeight || data.without_plantWeight || data.without_practicing_plantWeight) ? safeFloat(data.without_plantHeight || data.without_plantWeight || data.without_practicing_plantWeight, null) : null,
            plantHeightWith: (data.with_plantHeight || data.with_plantWeight || data.with_practicing_plantWeight) ? safeFloat(data.with_plantHeight || data.with_plantWeight || data.with_practicing_plantWeight, null) : null,
            otherRelevantParameterWithout: (data.without_otherParameter || data.without_practicing_otherParameter) ? safeFloat(data.without_otherParameter || data.without_practicing_otherParameter, null) : null,
            otherRelevantParameterWith: (data.with_otherParameter || data.with_practicing_otherParameter) ? safeFloat(data.with_otherParameter || data.with_practicing_otherParameter, null) : null,
            yieldWithout: (data.without_yield || data.without_practicing_yield) ? safeFloat(data.without_yield || data.without_practicing_yield, null) : null,
            yieldWith: (data.with_yield || data.with_practicing_yield) ? safeFloat(data.with_yield || data.with_practicing_yield, null) : null,
            costWithout: (data.without_costOfCultivation || data.without_practicing_costOfCultivation) ? safeFloat(data.without_costOfCultivation || data.without_practicing_costOfCultivation, null) : null,
            costWith: (data.with_costOfCultivation || data.with_practicing_costOfCultivation) ? safeFloat(data.with_costOfCultivation || data.with_practicing_costOfCultivation, null) : null,
            grossReturnWithout: (data.without_grossReturn || data.without_practicing_grossReturn) ? safeFloat(data.without_grossReturn || data.without_practicing_grossReturn, null) : null,
            grossReturnWith: (data.with_grossReturn || data.with_practicing_grossReturn) ? safeFloat(data.with_grossReturn || data.with_practicing_grossReturn, null) : null,
            netReturnWithout: (data.without_netReturn || data.without_practicing_netReturn) ? safeFloat(data.without_netReturn || data.without_practicing_netReturn, null) : null,
            netReturnWith: (data.with_netReturn || data.with_practicing_netReturn) ? safeFloat(data.with_netReturn || data.with_practicing_netReturn, null) : null,
            bcRatioWithout: (data.without_bcrRatio || data.without_practicing_bcrRatio) ? safeFloat(data.without_bcrRatio || data.without_practicing_bcrRatio, null) : null,
            bcRatioWith: (data.with_bcrRatio || data.with_practicing_bcrRatio) ? safeFloat(data.with_bcrRatio || data.with_practicing_bcrRatio, null) : null,
            soilPhWithout: (data.without_soilPh || data.without_practicing_soilPh) ? safeFloat(data.without_soilPh || data.without_practicing_soilPh, null) : null,
            soilPhWith: (data.with_soilPh || data.with_practicing_soilPh) ? safeFloat(data.with_soilPh || data.with_practicing_soilPh, null) : null,
            soilOcWithout: (data.without_soilOc || data.without_practicing_soilOc) ? safeFloat(data.without_soilOc || data.without_practicing_soilOc, null) : null,
            soilOcWith: (data.with_soilOc || data.with_practicing_soilOc) ? safeFloat(data.with_soilOc || data.with_practicing_soilOc, null) : null,
            soilEcWithout: (data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt) ? safeFloat(data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt, null) : null,
            soilEcWith: (data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt) ? safeFloat(data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt, null) : null,
            availableNWithout: (data.without_availableN || data.without_practicing_availableN) ? safeFloat(data.without_availableN || data.without_practicing_availableN, null) : null,
            availableNWith: (data.with_availableN || data.with_practicing_availableN) ? safeFloat(data.with_availableN || data.with_practicing_availableN, null) : null,
            availablePWithout: (data.without_availableP || data.without_practicing_availableP) ? safeFloat(data.without_availableP || data.without_practicing_availableP, null) : null,
            availablePWith: (data.with_availableP || data.with_practicing_availableP) ? safeFloat(data.with_availableP || data.with_practicing_availableP, null) : null,
            availableKWithout: (data.without_availableK || data.without_practicing_availableK) ? safeFloat(data.without_availableK || data.without_practicing_availableK, null) : null,
            availableKWith: (data.with_availableK || data.with_practicing_availableK) ? safeFloat(data.with_availableK || data.with_practicing_availableK, null) : null,
            soilMicrobesWithout: (data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial) ? safeFloat(data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial, null) : null,
            soilMicrobesWith: (data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial) ? safeFloat(data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial, null) : null,
            anyOtherWithout: (data.without_anyOtherSpecific || data.without_practicing_populationDensity) ? safeFloat(data.without_anyOtherSpecific || data.without_practicing_populationDensity, null) : null,
            anyOtherWith: (data.with_anyOtherSpecific || data.with_practicing_populationDensity) ? safeFloat(data.with_anyOtherSpecific || data.with_practicing_populationDensity, null) : null,
            farmerFeedback: data.farmerFeedback || data.farmersFeedback || '',
            images: data.images || data.demoImages ? String(data.images || data.demoImages) : null,
        };
        // Farmers Practicing form aliases
        mappedData.croppingPattern = data.normalCropsGrown || mappedData.croppingPattern;
        mappedData.technologyDemonstrated = data.naturalFarmingTechnologyPracticingAdopted || mappedData.technologyDemonstrated;
        mappedData.areaInHa = safeFloat(data.areaCoveredUnderNaturalFarming || data.area || data.areaInHa, 0);
        mappedData.crop = data.cropGrownUnderNaturalFarming || mappedData.crop;
        mappedData.farmerPracticeDetails = data.practicingYearOfNaturalFarming || mappedData.farmerPracticeDetails;
        mappedData.plantHeightWithout = (data.without_practicing_plantHeight || data.without_plantHeight || data.without_plantWeight || data.without_practicing_plantWeight)
            ? safeFloat(data.without_practicing_plantHeight || data.without_plantHeight || data.without_plantWeight || data.without_practicing_plantWeight, null)
            : mappedData.plantHeightWithout;
        mappedData.plantHeightWith = (data.with_practicing_plantHeight || data.with_plantHeight || data.with_plantWeight || data.with_practicing_plantWeight)
            ? safeFloat(data.with_practicing_plantHeight || data.with_plantHeight || data.with_plantWeight || data.with_practicing_plantWeight, null)
            : mappedData.plantHeightWith;
        mappedData.bcRatioWithout = (data.without_practicing_bcRatio || data.without_bcrRatio || data.without_practicing_bcrRatio)
            ? safeFloat(data.without_practicing_bcRatio || data.without_bcrRatio || data.without_practicing_bcrRatio, null)
            : mappedData.bcRatioWithout;
        mappedData.bcRatioWith = (data.with_practicing_bcRatio || data.with_bcrRatio || data.with_practicing_bcrRatio)
            ? safeFloat(data.with_practicing_bcRatio || data.with_bcrRatio || data.with_practicing_bcrRatio, null)
            : mappedData.bcRatioWith;
        mappedData.soilEcWithout = (data.without_practicing_soilEc || data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt)
            ? safeFloat(data.without_practicing_soilEc || data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt, null)
            : mappedData.soilEcWithout;
        mappedData.soilEcWith = (data.with_practicing_soilEc || data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt)
            ? safeFloat(data.with_practicing_soilEc || data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt, null)
            : mappedData.soilEcWith;
        mappedData.soilMicrobesWithout = (data.without_practicing_soilMicrobes || data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial)
            ? safeFloat(data.without_practicing_soilMicrobes || data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial, null)
            : mappedData.soilMicrobesWithout;
        mappedData.soilMicrobesWith = (data.with_practicing_soilMicrobes || data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial)
            ? safeFloat(data.with_practicing_soilMicrobes || data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial, null)
            : mappedData.soilMicrobesWith;
        mappedData.anyOtherWithout = (data.without_practicing_anyOtherSpecific || data.without_anyOtherSpecific || data.without_practicing_populationDensity)
            ? safeFloat(data.without_practicing_anyOtherSpecific || data.without_anyOtherSpecific || data.without_practicing_populationDensity, null)
            : mappedData.anyOtherWithout;
        mappedData.anyOtherWith = (data.with_practicing_anyOtherSpecific || data.with_anyOtherSpecific || data.with_practicing_populationDensity)
            ? safeFloat(data.with_practicing_anyOtherSpecific || data.with_anyOtherSpecific || data.with_practicing_populationDensity, null)
            : mappedData.anyOtherWith;
        return await prisma.demonstrationInfo.create({ data: mappedData });
    },
    findAll: async (filters, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        else if (filters?.kvkId) where.kvkId = safeInt(filters.kvkId, null);

        const records = await prisma.demonstrationInfo.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true, stateId: true } },
                season: true,
                staffCategory: { select: { categoryName: true } },
            },
            orderBy: { demonstrationInfoId: 'desc' }
        });

        return records.map(r => ({
            ...r,
            id: r.demonstrationInfoId,
            yearId: r.yearId,
            kvkName: r.kvk?.kvkName,
            stateId: r.kvk?.stateId,
            staffCategoryId: r.staffCategoryId,
            staffCategoryName: r.staffCategory?.categoryName || null,
            category: r.category === 'GENERAL' ? 'General' : r.category,
            noOfIndigenousCows: r.noOfIndigenousCows,
            noOfAnimals: r.noOfIndigenousCows,
            landHolding: r.landHolding,
            croppingSystem: r.croppingPattern,
            latitude: r.latitude,
            longitude: r.longitude,
            season: r.season?.seasonName,
            area: r.areaInHa,
            startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : null,
            endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : null,
            without_plantHeight: r.plantHeightWithout,
            with_plantHeight: r.plantHeightWith,
            without_plantWeight: r.plantHeightWithout,
            with_plantWeight: r.plantHeightWith,
            without_yield: r.yieldWithout,
            with_yield: r.yieldWith,
            without_costOfCultivation: r.costWithout,
            with_costOfCultivation: r.costWith,
            without_grossReturn: r.grossReturnWithout,
            with_grossReturn: r.grossReturnWith,
            without_netReturn: r.netReturnWithout,
            with_netReturn: r.netReturnWith,
            without_bcrRatio: r.bcRatioWithout,
            with_bcrRatio: r.bcRatioWith,
            without_soilPh: r.soilPhWithout,
            with_soilPh: r.soilPhWith,
            without_soilOc: r.soilOcWithout,
            with_soilOc: r.soilOcWith,
            without_otherParameter: r.otherRelevantParameterWithout,
            with_otherParameter: r.otherRelevantParameterWith,
            without_solubleSalt: r.soilEcWithout,
            with_solubleSalt: r.soilEcWith,
            without_soilEc: r.soilEcWithout,
            with_soilEc: r.soilEcWith,
            without_availableN: r.availableNWithout,
            with_availableN: r.availableNWith,
            without_availableP: r.availablePWithout,
            with_availableP: r.availablePWith,
            without_availableK: r.availableKWithout,
            with_availableK: r.availableKWith,
            without_soilMicrobial: r.soilMicrobesWithout,
            with_soilMicrobial: r.soilMicrobesWith,
            without_soilMicrobes: r.soilMicrobesWithout,
            with_soilMicrobes: r.soilMicrobesWith,
            without_anyOtherSpecific: r.anyOtherWithout,
            with_anyOtherSpecific: r.anyOtherWith,
            // Practicing form prefixes
            without_practicing_plantWeight: r.plantHeightWithout,
            without_practicing_plantHeight: r.plantHeightWithout,
            with_practicing_plantWeight: r.plantHeightWith,
            with_practicing_plantHeight: r.plantHeightWith,
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
            without_practicing_solubleSalt: r.soilEcWithout,
            without_practicing_soilEc: r.soilEcWithout,
            with_practicing_solubleSalt: r.soilEcWith,
            with_practicing_soilEc: r.soilEcWith,
            without_practicing_availableN: r.availableNWithout,
            with_practicing_availableN: r.availableNWith,
            without_practicing_availableP: r.availablePWithout,
            with_practicing_availableP: r.availablePWith,
            without_practicing_availableK: r.availableKWithout,
            with_practicing_availableK: r.availableKWith,
            without_practicing_soilMicrobial: r.soilMicrobesWithout,
            without_practicing_soilMicrobes: r.soilMicrobesWithout,
            with_practicing_soilMicrobial: r.soilMicrobesWith,
            with_practicing_soilMicrobes: r.soilMicrobesWith,
            without_practicing_populationDensity: r.anyOtherWithout,
            without_practicing_anyOtherSpecific: r.anyOtherWithout,
            with_practicing_populationDensity: r.anyOtherWith,
            with_practicing_anyOtherSpecific: r.anyOtherWith,
            farmersFeedback: r.farmerFeedback,
            normalCropsGrown: r.croppingPattern,
            practicingYearOfNaturalFarming: r.farmerPracticeDetails,
            areaCoveredUnderNaturalFarming: r.areaInHa,
            cropGrownUnderNaturalFarming: r.crop,
            naturalFarmingTechnologyPracticingAdopted: r.technologyDemonstrated,
            cropSystem: r.croppingPattern,
            motivationFactors: r.farmerPracticeDetails,
        }));
    },
    findById: async (id, user) => {
        const where = { demonstrationInfoId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const r = await prisma.demonstrationInfo.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true, stateId: true } },
                season: true,
                staffCategory: { select: { categoryName: true } },
            }
        });

        if (!r) return null;
        return {
            ...r,
            id: r.demonstrationInfoId,
            yearId: r.yearId,
            kvkName: r.kvk?.kvkName,
            stateId: r.kvk?.stateId,
            staffCategoryId: r.staffCategoryId,
            staffCategoryName: r.staffCategory?.categoryName || null,
            category: r.category === 'GENERAL' ? 'General' : r.category,
            noOfIndigenousCows: r.noOfIndigenousCows,
            noOfAnimals: r.noOfIndigenousCows,
            landHolding: r.landHolding,
            croppingSystem: r.croppingPattern,
            latitude: r.latitude,
            longitude: r.longitude,
            season: r.season?.seasonName,
            area: r.areaInHa,
            startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : null,
            endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : null,
            without_plantHeight: r.plantHeightWithout,
            with_plantHeight: r.plantHeightWith,
            without_plantWeight: r.plantHeightWithout,
            with_plantWeight: r.plantHeightWith,
            without_yield: r.yieldWithout,
            with_yield: r.yieldWith,
            without_costOfCultivation: r.costWithout,
            with_costOfCultivation: r.costWith,
            without_grossReturn: r.grossReturnWithout,
            with_grossReturn: r.grossReturnWith,
            without_netReturn: r.netReturnWithout,
            with_netReturn: r.netReturnWith,
            without_bcrRatio: r.bcRatioWithout,
            with_bcrRatio: r.bcRatioWith,
            without_soilPh: r.soilPhWithout,
            with_soilPh: r.soilPhWith,
            without_soilOc: r.soilOcWithout,
            with_soilOc: r.soilOcWith,
            without_otherParameter: r.otherRelevantParameterWithout,
            with_otherParameter: r.otherRelevantParameterWith,
            without_solubleSalt: r.soilEcWithout,
            with_solubleSalt: r.soilEcWith,
            without_soilEc: r.soilEcWithout,
            with_soilEc: r.soilEcWith,
            without_availableN: r.availableNWithout,
            with_availableN: r.availableNWith,
            without_availableP: r.availablePWithout,
            with_availableP: r.availablePWith,
            without_availableK: r.availableKWithout,
            with_availableK: r.availableKWith,
            without_soilMicrobial: r.soilMicrobesWithout,
            with_soilMicrobial: r.soilMicrobesWith,
            without_soilMicrobes: r.soilMicrobesWithout,
            with_soilMicrobes: r.soilMicrobesWith,
            without_anyOtherSpecific: r.anyOtherWithout,
            with_anyOtherSpecific: r.anyOtherWith,
            // Practicing form prefixes
            without_practicing_plantWeight: r.plantHeightWithout,
            without_practicing_plantHeight: r.plantHeightWithout,
            with_practicing_plantWeight: r.plantHeightWith,
            with_practicing_plantHeight: r.plantHeightWith,
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
            without_practicing_solubleSalt: r.soilEcWithout,
            without_practicing_soilEc: r.soilEcWithout,
            with_practicing_solubleSalt: r.soilEcWith,
            with_practicing_soilEc: r.soilEcWith,
            without_practicing_availableN: r.availableNWithout,
            with_practicing_availableN: r.availableNWith,
            without_practicing_availableP: r.availablePWithout,
            with_practicing_availableP: r.availablePWith,
            without_practicing_availableK: r.availableKWithout,
            with_practicing_availableK: r.availableKWith,
            without_practicing_soilMicrobial: r.soilMicrobesWithout,
            without_practicing_soilMicrobes: r.soilMicrobesWithout,
            with_practicing_soilMicrobial: r.soilMicrobesWith,
            with_practicing_soilMicrobes: r.soilMicrobesWith,
            without_practicing_populationDensity: r.anyOtherWithout,
            without_practicing_anyOtherSpecific: r.anyOtherWithout,
            with_practicing_populationDensity: r.anyOtherWith,
            with_practicing_anyOtherSpecific: r.anyOtherWith,
            farmersFeedback: r.farmerFeedback,
            normalCropsGrown: r.croppingPattern,
            practicingYearOfNaturalFarming: r.farmerPracticeDetails,
            areaCoveredUnderNaturalFarming: r.areaInHa,
            cropGrownUnderNaturalFarming: r.crop,
            naturalFarmingTechnologyPracticingAdopted: r.technologyDemonstrated,
            cropSystem: r.croppingPattern,
            motivationFactors: r.farmerPracticeDetails,
        };
    },
    update: async (id, data, user) => {
        const where = { demonstrationInfoId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId);
        const existing = await prisma.demonstrationInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.demonstrationInfo.update({
            where: { demonstrationInfoId: safeInt(id, 0) },
            data: {
                yearId: (data.yearId || data.year) !== undefined ? safeInt(data.yearId || data.year, null) : existing.yearId,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                farmerName: data.farmerName !== undefined ? data.farmerName : existing.farmerName,
                villageName: data.villageName !== undefined ? data.villageName : existing.villageName,
                address: data.address !== undefined ? data.address : existing.address,
                contactNumber: data.contactNumber !== undefined ? String(data.contactNumber) : existing.contactNumber,
                staffCategoryId: (data.staffCategoryId !== undefined || data.staffCategoryName !== undefined) ? await resolveStaffCategory(data.staffCategoryId ?? data.staffCategoryName) : existing.staffCategoryId,
                noOfIndigenousCows: (data.noOfIndigenousCows || data.noOfAnimals) !== undefined ? safeInt(data.noOfIndigenousCows || data.noOfAnimals, null) : existing.noOfIndigenousCows,
                landHolding: data.landHolding !== undefined ? safeFloat(data.landHolding, null) : existing.landHolding,
                gender: data.gender !== undefined ? data.gender : existing.gender,
                category: data.category !== undefined ? data.category : existing.category,
                croppingPattern: (data.croppingSystem || data.cropSystem || data.croppingPattern) !== undefined ? (data.croppingSystem || data.cropSystem || data.croppingPattern) : existing.croppingPattern,
                farmingSituation: data.farmingSituation !== undefined ? data.farmingSituation : existing.farmingSituation,
                latitude: (data.latitude || data.latitudeN) !== undefined ? safeFloat(data.latitude || data.latitudeN, 0) : existing.latitude,
                longitude: (data.longitude || data.longitudeE) !== undefined ? safeFloat(data.longitude || data.longitudeE, 0) : existing.longitude,
                activityName: data.activityName !== undefined ? data.activityName : existing.activityName,
                crop: data.crop !== undefined ? data.crop : existing.crop,
                variety: data.variety !== undefined ? data.variety : existing.variety,
                seasonId: data.seasonId !== undefined ? (data.seasonId ? safeInt(data.seasonId, null) : null) : existing.seasonId,
                technologyDemonstrated: (data.technologyDemonstrated || data.naturalFarmingTechnologyPracticingAdopted) !== undefined ? (data.technologyDemonstrated || data.naturalFarmingTechnologyPracticingAdopted) : existing.technologyDemonstrated,
                areaInHa: (data.areaCoveredUnderNaturalFarming || data.area || data.areaInHa) !== undefined ? safeFloat(data.areaCoveredUnderNaturalFarming || data.area || data.areaInHa, 0) : existing.areaInHa,
                farmerPracticeDetails: (data.practicingYearOfNaturalFarming || data.motivationFactors || data.farmerPracticeDetails) !== undefined ? (data.practicingYearOfNaturalFarming || data.motivationFactors || data.farmerPracticeDetails) : existing.farmerPracticeDetails,
                plantHeightWithout: (data.without_practicing_plantHeight || data.without_plantHeight || data.without_plantWeight || data.without_practicing_plantWeight) !== undefined ? safeFloat(data.without_practicing_plantHeight || data.without_plantHeight || data.without_plantWeight || data.without_practicing_plantWeight, null) : existing.plantHeightWithout,
                plantHeightWith: (data.with_practicing_plantHeight || data.with_plantHeight || data.with_plantWeight || data.with_practicing_plantWeight) !== undefined ? safeFloat(data.with_practicing_plantHeight || data.with_plantHeight || data.with_plantWeight || data.with_practicing_plantWeight, null) : existing.plantHeightWith,
                otherRelevantParameterWithout: (data.without_otherParameter || data.without_practicing_otherParameter) !== undefined ? safeFloat(data.without_otherParameter || data.without_practicing_otherParameter, null) : existing.otherRelevantParameterWithout,
                otherRelevantParameterWith: (data.with_otherParameter || data.with_practicing_otherParameter) !== undefined ? safeFloat(data.with_otherParameter || data.with_practicing_otherParameter, null) : existing.otherRelevantParameterWith,
                yieldWithout: (data.without_yield || data.without_practicing_yield) !== undefined ? safeFloat(data.without_yield || data.without_practicing_yield, null) : existing.yieldWithout,
                yieldWith: (data.with_yield || data.with_practicing_yield) !== undefined ? safeFloat(data.with_yield || data.with_practicing_yield, null) : existing.yieldWith,
                costWithout: (data.without_costOfCultivation || data.without_practicing_costOfCultivation) !== undefined ? safeFloat(data.without_costOfCultivation || data.without_practicing_costOfCultivation, null) : existing.costWithout,
                costWith: (data.with_costOfCultivation || data.with_practicing_costOfCultivation) !== undefined ? safeFloat(data.with_costOfCultivation || data.with_practicing_costOfCultivation, null) : existing.costWith,
                grossReturnWithout: (data.without_grossReturn || data.without_practicing_grossReturn) !== undefined ? safeFloat(data.without_grossReturn || data.without_practicing_grossReturn, null) : existing.grossReturnWithout,
                grossReturnWith: (data.with_grossReturn || data.with_practicing_grossReturn) !== undefined ? safeFloat(data.with_grossReturn || data.with_practicing_grossReturn, null) : existing.grossReturnWith,
                netReturnWithout: (data.without_netReturn || data.without_practicing_netReturn) !== undefined ? safeFloat(data.without_netReturn || data.without_practicing_netReturn, null) : existing.netReturnWithout,
                netReturnWith: (data.with_netReturn || data.with_practicing_netReturn) !== undefined ? safeFloat(data.with_netReturn || data.with_practicing_netReturn, null) : existing.netReturnWith,
                bcRatioWithout: (data.without_practicing_bcRatio || data.without_bcrRatio || data.without_practicing_bcrRatio) !== undefined ? safeFloat(data.without_practicing_bcRatio || data.without_bcrRatio || data.without_practicing_bcrRatio, null) : existing.bcRatioWithout,
                bcRatioWith: (data.with_practicing_bcRatio || data.with_bcrRatio || data.with_practicing_bcrRatio) !== undefined ? safeFloat(data.with_practicing_bcRatio || data.with_bcrRatio || data.with_practicing_bcrRatio, null) : existing.bcRatioWith,
                soilPhWithout: (data.without_soilPh || data.without_practicing_soilPh) !== undefined ? safeFloat(data.without_soilPh || data.without_practicing_soilPh, null) : existing.soilPhWithout,
                soilPhWith: (data.with_soilPh || data.with_practicing_soilPh) !== undefined ? safeFloat(data.with_soilPh || data.with_practicing_soilPh, null) : existing.soilPhWith,
                soilOcWithout: (data.without_soilOc || data.without_practicing_soilOc) !== undefined ? safeFloat(data.without_soilOc || data.without_practicing_soilOc, null) : existing.soilOcWithout,
                soilOcWith: (data.with_soilOc || data.with_practicing_soilOc) !== undefined ? safeFloat(data.with_soilOc || data.with_practicing_soilOc, null) : existing.soilOcWith,
                soilEcWithout: (data.without_practicing_soilEc || data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt) !== undefined ? safeFloat(data.without_practicing_soilEc || data.without_soilEc || data.without_solubleSalt || data.without_practicing_solubleSalt, null) : existing.soilEcWithout,
                soilEcWith: (data.with_practicing_soilEc || data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt) !== undefined ? safeFloat(data.with_practicing_soilEc || data.with_soilEc || data.with_solubleSalt || data.with_practicing_solubleSalt, null) : existing.soilEcWith,
                availableNWithout: (data.without_availableN || data.without_practicing_availableN) !== undefined ? safeFloat(data.without_availableN || data.without_practicing_availableN, null) : existing.availableNWithout,
                availableNWith: (data.with_availableN || data.with_practicing_availableN) !== undefined ? safeFloat(data.with_availableN || data.with_practicing_availableN, null) : existing.availableNWith,
                availablePWithout: (data.without_availableP || data.without_practicing_availableP) !== undefined ? safeFloat(data.without_availableP || data.without_practicing_availableP, null) : existing.availablePWithout,
                availablePWith: (data.with_availableP || data.with_practicing_availableP) !== undefined ? safeFloat(data.with_availableP || data.with_practicing_availableP, null) : existing.availablePWith,
                availableKWithout: (data.without_availableK || data.without_practicing_availableK) !== undefined ? safeFloat(data.without_availableK || data.without_practicing_availableK, null) : existing.availableKWithout,
                availableKWith: (data.with_availableK || data.with_practicing_availableK) !== undefined ? safeFloat(data.with_availableK || data.with_practicing_availableK, null) : existing.availableKWith,
                soilMicrobesWithout: (data.without_practicing_soilMicrobes || data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial) !== undefined ? safeFloat(data.without_practicing_soilMicrobes || data.without_soilMicrobes || data.without_soilMicrobial || data.without_practicing_soilMicrobial, null) : existing.soilMicrobesWithout,
                soilMicrobesWith: (data.with_practicing_soilMicrobes || data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial) !== undefined ? safeFloat(data.with_practicing_soilMicrobes || data.with_soilMicrobes || data.with_soilMicrobial || data.with_practicing_soilMicrobial, null) : existing.soilMicrobesWith,
                anyOtherWithout: (data.without_practicing_anyOtherSpecific || data.without_anyOtherSpecific || data.without_practicing_populationDensity) !== undefined ? safeFloat(data.without_practicing_anyOtherSpecific || data.without_anyOtherSpecific || data.without_practicing_populationDensity, null) : existing.anyOtherWithout,
                anyOtherWith: (data.with_practicing_anyOtherSpecific || data.with_anyOtherSpecific || data.with_practicing_populationDensity) !== undefined ? safeFloat(data.with_practicing_anyOtherSpecific || data.with_anyOtherSpecific || data.with_practicing_populationDensity, null) : existing.anyOtherWith,
                farmerFeedback: (data.farmerFeedback || data.farmersFeedback) !== undefined ? (data.farmerFeedback || data.farmersFeedback) : existing.farmerFeedback,
                images: (data.images || data.demoImages) !== undefined ? String(data.images || data.demoImages) : existing.images,
            }
        });
    },
    delete: async (id, user) => {
        const where = { demonstrationInfoId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId);
        const existing = await prisma.demonstrationInfo.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.demonstrationInfo.delete({ where: { demonstrationInfoId: safeInt(id, 0) } });
    },
};

// ─── Beneficiaries Details ───────────────────────────────────────────────────
const beneficiariesRepository = {
    create: async (data, user) => {
        const kvkId = getKvkId(user, data);
        return await prisma.beneficiariesDetails.create({
            data: {
                kvkId,
                year: safeInt(data.yearId || data.year || new Date().getFullYear()),
                blocksCovered: safeInt(data.noOfBlocks || data.blocksCovered, 0),
                villagesCovered: safeInt(data.noOfVillages || data.villagesCovered, 0),
                totalTrainedFarmers: safeInt(data.totalTrainedFarmers, 0),
                farmersInfluenced: safeInt(data.farmersInfluenced, 0),
                farmersEngagedAllSeason: safeInt(data.farmersEngagedAllSeason, 0),
                farmersEngagedOneSeason: safeInt(data.farmersEngagedOneSeason, 0),
                remarks: data.remarks || '',
            }
        });
    },
    findAll: async (filters, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        else if (filters?.kvkId) where.kvkId = parseInt(filters.kvkId);
        const records = await prisma.beneficiariesDetails.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: { beneficiariesDetailsId: 'desc' }
        });

        return records.map(r => ({
            ...r,
            id: r.beneficiariesDetailsId,
            kvkName: r.kvk?.kvkName,
            noOfBlocks: r.blocksCovered,
            noOfVillages: r.villagesCovered,
            yearId: r.year,
        }));
    },
    findById: async (id, user) => {
        const where = { beneficiariesDetailsId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const r = await prisma.beneficiariesDetails.findFirst({ where, include: { kvk: { select: { kvkName: true } } } });
        if (!r) return null;
        return {
            ...r,
            id: r.beneficiariesDetailsId,
            kvkName: r.kvk?.kvkName,
            noOfBlocks: r.blocksCovered,
            noOfVillages: r.villagesCovered,
            yearId: r.year,
        };
    },
    update: async (id, data, user) => {
        const where = { beneficiariesDetailsId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.beneficiariesDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.beneficiariesDetails.update({
            where: { beneficiariesDetailsId: parseInt(id) },
            data: {
                year: (data.yearId || data.year) !== undefined ? parseInt(data.yearId || data.year || 0) : existing.year,
                blocksCovered: (data.noOfBlocks || data.blocksCovered) !== undefined ? parseInt(data.noOfBlocks || data.blocksCovered || 0) : existing.blocksCovered,
                villagesCovered: (data.noOfVillages || data.villagesCovered) !== undefined ? parseInt(data.noOfVillages || data.villagesCovered || 0) : existing.villagesCovered,
                totalTrainedFarmers: data.totalTrainedFarmers !== undefined ? parseInt(data.totalTrainedFarmers || 0) : existing.totalTrainedFarmers,
                farmersInfluenced: data.farmersInfluenced !== undefined ? parseInt(data.farmersInfluenced || 0) : existing.farmersInfluenced,
                farmersEngagedAllSeason: data.farmersEngagedAllSeason !== undefined ? parseInt(data.farmersEngagedAllSeason || 0) : existing.farmersEngagedAllSeason,
                farmersEngagedOneSeason: data.farmersEngagedOneSeason !== undefined ? parseInt(data.farmersEngagedOneSeason || 0) : existing.farmersEngagedOneSeason,
                remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
            }
        });
    },
    delete: async (id, user) => {
        const where = { beneficiariesDetailsId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.beneficiariesDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.beneficiariesDetails.delete({ where: { beneficiariesDetailsId: parseInt(id) } });
    },
};

// ─── Soil Data ───────────────────────────────────────────────────────────────
const soilDataRepository = {
    create: async (data, user) => {
        const kvkId = getKvkId(user, data);
        const soilParameterId = await resolveNaturalFarmingSoilParameterId(data.soilParameterId ?? data.soilParameter ?? data.type);
        return await prisma.soilDataInformation.create({
            data: {
                kvkId,
                year: safeInt(data.yearId || data.year || new Date().getFullYear()),
                crop: data.crop || '',
                seasonId: data.seasonId ? safeInt(data.seasonId, null) : null,
                soilParameterId,
                phBefore: safeFloat(data.beforePh, 0),
                ecBefore: safeFloat(data.beforeEc, 0),
                ocBefore: safeFloat(data.beforeOc, 0),
                nBefore: safeFloat(data.beforeN, 0),
                pBefore: safeFloat(data.beforeP, 0),
                kBefore: safeFloat(data.beforeK, 0),
                soilMicrobesBefore: safeFloat(data.beforeMicrobes, 0),
                phAfter: safeFloat(data.afterPh, 0),
                ecAfter: safeFloat(data.afterEc, 0),
                ocAfter: safeFloat(data.afterOc, 0),
                nAfter: safeFloat(data.afterN, 0),
                pAfter: safeFloat(data.afterP, 0),
                kAfter: safeFloat(data.afterK, 0),
                soilMicrobesAfter: safeFloat(data.afterMicrobes, 0),
            }
        });
    },
    findAll: async (filters, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        else if (filters?.kvkId) where.kvkId = parseInt(filters.kvkId);
        const records = await prisma.soilDataInformation.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: true,
                soilParameterMaster: true,
            },
            orderBy: { soilDataInformationId: 'desc' }
        });

        return records.map(r => ({
            ...r,
            id: r.soilDataInformationId,
            kvkName: r.kvk?.kvkName,
            season: r.season?.seasonName,
            seasonId: r.seasonId,
            yearId: r.year,
            type: r.soilParameterMaster?.parameterName || null,
            soilParameter: r.soilParameterMaster?.parameterName || null,
            soilParameterId: r.soilParameterId,
            crop: r.crop,
            beforePh: r.phBefore,
            beforeEc: r.ecBefore,
            beforeOc: r.ocBefore,
            beforeN: r.nBefore,
            beforeP: r.pBefore,
            beforeK: r.kBefore,
            beforeMicrobes: r.soilMicrobesBefore,
            afterPh: r.phAfter,
            afterEc: r.ecAfter,
            afterOc: r.ocAfter,
            afterN: r.nAfter,
            afterP: r.pAfter,
            afterK: r.kAfter,
            afterMicrobes: r.soilMicrobesAfter,
        }));
    },
    findById: async (id, user) => {
        const where = { soilDataInformationId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const r = await prisma.soilDataInformation.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: true,
                soilParameterMaster: true,
            }
        });

        if (!r) return null;
        return {
            ...r,
            id: r.soilDataInformationId,
            kvkName: r.kvk?.kvkName,
            season: r.season?.seasonName,
            seasonId: r.seasonId,
            yearId: r.year,
            type: r.soilParameterMaster?.parameterName || null,
            soilParameter: r.soilParameterMaster?.parameterName || null,
            soilParameterId: r.soilParameterId,
            crop: r.crop,
            beforePh: r.phBefore,
            beforeEc: r.ecBefore,
            beforeOc: r.ocBefore,
            beforeN: r.nBefore,
            beforeP: r.pBefore,
            beforeK: r.kBefore,
            beforeMicrobes: r.soilMicrobesBefore,
            afterPh: r.phAfter,
            afterEc: r.ecAfter,
            afterOc: r.ocAfter,
            afterN: r.nAfter,
            afterP: r.pAfter,
            afterK: r.kAfter,
            afterMicrobes: r.soilMicrobesAfter,
        };
    },
    update: async (id, data, user) => {
        const where = { soilDataInformationId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.soilDataInformation.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const resolvedSoilParameterId = (data.soilParameterId !== undefined || data.soilParameter !== undefined || data.type !== undefined)
            ? await resolveNaturalFarmingSoilParameterId(data.soilParameterId ?? data.soilParameter ?? data.type)
            : existing.soilParameterId;
        return await prisma.soilDataInformation.update({
            where: { soilDataInformationId: parseInt(id) },
            data: {
                year: (data.yearId || data.year) !== undefined ? safeInt(data.yearId || data.year, existing.year) : existing.year,
                crop: data.crop !== undefined ? data.crop : existing.crop,
                seasonId: data.seasonId !== undefined ? (data.seasonId ? safeInt(data.seasonId, null) : null) : existing.seasonId,
                soilParameterId: resolvedSoilParameterId,
                phBefore: data.beforePh !== undefined ? safeFloat(data.beforePh, existing.phBefore) : existing.phBefore,
                ecBefore: data.beforeEc !== undefined ? safeFloat(data.beforeEc, existing.ecBefore) : existing.ecBefore,
                ocBefore: data.beforeOc !== undefined ? safeFloat(data.beforeOc, existing.ocBefore) : existing.ocBefore,
                nBefore: data.beforeN !== undefined ? safeFloat(data.beforeN, existing.nBefore) : existing.nBefore,
                pBefore: data.beforeP !== undefined ? safeFloat(data.beforeP, existing.pBefore) : existing.pBefore,
                kBefore: data.beforeK !== undefined ? safeFloat(data.beforeK, existing.kBefore) : existing.kBefore,
                soilMicrobesBefore: data.beforeMicrobes !== undefined ? safeFloat(data.beforeMicrobes, existing.soilMicrobesBefore) : existing.soilMicrobesBefore,
                phAfter: data.afterPh !== undefined ? safeFloat(data.afterPh, existing.phAfter) : existing.phAfter,
                ecAfter: data.afterEc !== undefined ? safeFloat(data.afterEc, existing.ecAfter) : existing.ecAfter,
                ocAfter: data.afterOc !== undefined ? safeFloat(data.afterOc, existing.ocAfter) : existing.ocAfter,
                nAfter: data.afterN !== undefined ? safeFloat(data.afterN, existing.nAfter) : existing.nAfter,
                pAfter: data.afterP !== undefined ? safeFloat(data.afterP, existing.pAfter) : existing.pAfter,
                kAfter: data.afterK !== undefined ? safeFloat(data.afterK, existing.kAfter) : existing.kAfter,
                soilMicrobesAfter: data.afterMicrobes !== undefined ? safeFloat(data.afterMicrobes, existing.soilMicrobesAfter) : existing.soilMicrobesAfter,
            }
        });
    },
    delete: async (id, user) => {
        const where = { soilDataInformationId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.soilDataInformation.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.soilDataInformation.delete({ where: { soilDataInformationId: parseInt(id) } });
    },
};

// ─── Financial Information (Budget Expenditure) ──────────────────────────────
const financialInfoRepository = {
    create: async (data, user) => {
        const kvkId = getKvkId(user, data);
        const resolvedActivity = await resolveNaturalFarmingActivity(data.activityId ?? data.activityName ?? data.activity);
        return await prisma.financialInformation.create({
            data: {
                kvkId,
                year: safeInt(data.yearId || data.year || new Date().getFullYear()),
                activityId: resolvedActivity?.naturalFarmingActivityId || null,
                numberOfActivities: safeInt(data.noOfActivities || data.numberOfActivities, 0),
                budgetSanction: safeFloat(data.budgetSanction, 0),
                budgetExpenditure: safeFloat(data.budgetExpenditure, 0),
                totalBudgetExpenditure: safeFloat(data.totalBudgetExpenditure, 0),
            },
            include: { activityMaster: true },
        });
    },
    findAll: async (filters, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        else if (filters?.kvkId) where.kvkId = parseInt(filters.kvkId);
        const records = await prisma.financialInformation.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                activityMaster: true,
            },
            orderBy: { financialInformationId: 'desc' }
        });

        return records.map(r => ({
            ...r,
            id: r.financialInformationId,
            kvkName: r.kvk?.kvkName,
            noOfActivities: r.numberOfActivities,
            activityName: r.activityMaster?.activityName || null,
            activityId: r.activityId,
        }));
    },
    findById: async (id, user) => {
        const where = { financialInformationId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const r = await prisma.financialInformation.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                activityMaster: true,
            }
        });

        if (!r) return null;
        return {
            ...r,
            id: r.financialInformationId,
            kvkName: r.kvk?.kvkName,
            noOfActivities: r.numberOfActivities,
            activityName: r.activityMaster?.activityName || null,
            activityId: r.activityId,
            yearId: r.year,
        };
    },
    update: async (id, data, user) => {
        const where = { financialInformationId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.financialInformation.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const resolvedActivity = (data.activityId !== undefined || data.activityName !== undefined || data.activity !== undefined)
            ? await resolveNaturalFarmingActivity(data.activityId ?? data.activityName ?? data.activity)
            : null;
        return await prisma.financialInformation.update({
            where: { financialInformationId: parseInt(id) },
            data: {
                year: (data.yearId || data.year) !== undefined ? safeInt(data.yearId || data.year, existing.year) : existing.year,
                activityId: resolvedActivity ? resolvedActivity.naturalFarmingActivityId : existing.activityId,
                numberOfActivities: (data.noOfActivities || data.numberOfActivities) !== undefined ? safeInt(data.noOfActivities || data.numberOfActivities, existing.numberOfActivities) : existing.numberOfActivities,
                budgetSanction: data.budgetSanction !== undefined ? safeFloat(data.budgetSanction, existing.budgetSanction) : existing.budgetSanction,
                budgetExpenditure: data.budgetExpenditure !== undefined ? safeFloat(data.budgetExpenditure, existing.budgetExpenditure) : existing.budgetExpenditure,
                totalBudgetExpenditure: data.totalBudgetExpenditure !== undefined ? safeFloat(data.totalBudgetExpenditure, existing.totalBudgetExpenditure) : existing.totalBudgetExpenditure,
            },
            include: { activityMaster: true },
        });
    },
    delete: async (id, user) => {
        const where = { financialInformationId: parseInt(id) };
        if (isKvkUser(user)) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.financialInformation.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.financialInformation.delete({ where: { financialInformationId: parseInt(id) } });
    },
};

module.exports = {
    geographicalInfoRepository,
    physicalInfoRepository,
    demonstrationInfoRepository,
    beneficiariesRepository,
    soilDataRepository,
    financialInfoRepository,
};
