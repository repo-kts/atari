const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const nariBioFortifiedCropRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkId = isKvkScoped ? parseInt(user.kvkId) : parseInt(data.kvkId);

        if (isNaN(kvkId)) throw new Error('Valid kvkId is required');

        // Validation for mandatory fields
        const seasonId = parseInt(data.seasonId);
        const activityId = parseInt(data.activityId);
        const cropCategoryId = parseInt(data.cropCategoryId);
        const villageName = data.nameOfNutriSmartVillage || data.villageName || '';
        const cropName = data.nameOfCrop || data.cropName || '';

        if (isNaN(seasonId)) throw new Error('Season is required');
        if (isNaN(activityId)) throw new Error('Activity is required');
        if (isNaN(cropCategoryId)) throw new Error('Category of Crop is required');
        if (!villageName) throw new Error('Name of Nutri-Smart Village is required');
        if (!cropName) throw new Error('Name of Crop is required');
        if (!data.variety) throw new Error('Variety is required');

        const result = await prisma.nariBioFortifiedCrop.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                seasonId,
                activityId,
                nameOfNutriSmartVillage: villageName,
                cropCategoryId,
                nameOfCrop: cropName,
                variety: data.variety || '',
                areaHa: parseFloat(data.areaHa || 0),
                generalM: parseInt(data.generalM || data.genMale || 0),
                generalF: parseInt(data.generalF || data.genFemale || 0),
                obcM: parseInt(data.obcM || data.obcMale || 0),
                obcF: parseInt(data.obcF || data.obcFemale || 0),
                scM: parseInt(data.scM || data.scMale || 0),
                scF: parseInt(data.scF || data.scFemale || 0),
                stM: parseInt(data.stM || data.stMale || 0),
                stF: parseInt(data.stF || data.stFemale || 0),
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                activity: { select: { activityName: true } },
                cropCategory: { select: { name: true } },
            }
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

        const results = await prisma.nariBioFortifiedCrop.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                activity: { select: { activityName: true } },
                cropCategory: { select: { name: true } },
            },
            orderBy: { nariBioFortifiedCropId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.nariBioFortifiedCrop.findUnique({
            where: { nariBioFortifiedCropId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                activity: { select: { activityName: true } },
                cropCategory: { select: { name: true } },
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const result = await prisma.nariBioFortifiedCrop.update({
            where: { nariBioFortifiedCropId: parseInt(id) },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : undefined,
                seasonId: data.seasonId ? parseInt(data.seasonId) : undefined,
                activityId: data.activityId ? parseInt(data.activityId) : undefined,
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage || data.villageName || undefined,
                cropCategoryId: data.cropCategoryId ? parseInt(data.cropCategoryId) : undefined,
                nameOfCrop: data.nameOfCrop || data.cropName || undefined,
                variety: data.variety !== undefined ? data.variety : undefined,
                areaHa: data.areaHa !== undefined ? parseFloat(data.areaHa) : undefined,
                generalM: (data.generalM !== undefined || data.genMale !== undefined) ? (parseInt(data.generalM ?? data.genMale) || 0) : undefined,
                generalF: (data.generalF !== undefined || data.genFemale !== undefined) ? (parseInt(data.generalF ?? data.genFemale) || 0) : undefined,
                obcM: (data.obcM !== undefined || data.obcMale !== undefined) ? (parseInt(data.obcM ?? data.obcMale) || 0) : undefined,
                obcF: (data.obcF !== undefined || data.obcFemale !== undefined) ? (parseInt(data.obcF ?? data.obcFemale) || 0) : undefined,
                scM: (data.scM !== undefined || data.scMale !== undefined) ? (parseInt(data.scM ?? data.scMale) || 0) : undefined,
                scF: (data.scF !== undefined || data.scFemale !== undefined) ? (parseInt(data.scF ?? data.scFemale) || 0) : undefined,
                stM: (data.stM !== undefined || data.stMale !== undefined) ? (parseInt(data.stM ?? data.stMale) || 0) : undefined,
                stF: (data.stF !== undefined || data.stFemale !== undefined) ? (parseInt(data.stF ?? data.stFemale) || 0) : undefined,
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                activity: { select: { activityName: true } },
                cropCategory: { select: { name: true } },
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.nariBioFortifiedCrop.delete({
            where: { nariBioFortifiedCropId: parseInt(id) }
        });
    },

    // Result Methods
    getResultById: async (id) => {
        return await prisma.nariBioFortifiedCropResult.findFirst({
            where: { nariBioFortifiedCropId: parseInt(id) }
        });
    },

    createResult: async (id, data) => {
        const bioFortifiedCropId = parseInt(id);
        return await prisma.$transaction(async (tx) => {
            const result = await tx.nariBioFortifiedCropResult.create({
                data: {
                    nariBioFortifiedCropId: bioFortifiedCropId,
                    reportingYear: data.reportingYear ? new Date(data.reportingYear) : null,
                    cropName: data.cropName || '',
                    variety: data.variety || '',
                    areaHa: parseFloat(data.areaHa || 0),
                    productionKg: parseFloat(data.productionYield || data.productionKg || 0),
                    consumptionGm: parseFloat(data.consumptionGmPerDay || data.consumptionGm || 0),
                    formOfConsumption: data.formOfConsumption || '',
                    daysInYear: parseInt(data.daysOfConsumption || data.daysInYear || 0),
                }
            });

            await tx.nariBioFortifiedCrop.update({
                where: { nariBioFortifiedCropId: bioFortifiedCropId },
                data: { status: 'COMPLETED' }
            });

            return result;
        });
    },

    updateResult: async (id, data) => {
        const bioFortifiedCropId = parseInt(id);
        const existingResult = await prisma.nariBioFortifiedCropResult.findFirst({
            where: { nariBioFortifiedCropId: bioFortifiedCropId }
        });

        if (!existingResult) throw new Error('Result not found');

        return await prisma.nariBioFortifiedCropResult.update({
            where: { nariBioFortifiedCropResultId: existingResult.nariBioFortifiedCropResultId },
            data: {
                reportingYear: data.reportingYear ? new Date(data.reportingYear) : undefined,
                cropName: data.cropName !== undefined ? data.cropName : undefined,
                variety: data.variety !== undefined ? data.variety : undefined,
                areaHa: data.areaHa !== undefined ? parseFloat(data.areaHa) : undefined,
                productionKg: data.productionYield !== undefined || data.productionKg !== undefined
                    ? parseFloat(data.productionYield ?? data.productionKg) : undefined,
                consumptionGm: data.consumptionGmPerDay !== undefined || data.consumptionGm !== undefined
                    ? parseFloat(data.consumptionGmPerDay ?? data.consumptionGm) : undefined,
                formOfConsumption: data.formOfConsumption !== undefined ? data.formOfConsumption : undefined,
                daysInYear: data.daysOfConsumption !== undefined || data.daysInYear !== undefined
                    ? parseInt(data.daysOfConsumption ?? data.daysInYear) : undefined,
            }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    const totalBeneficiaries = (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0);

    return {
        id: r.nariBioFortifiedCropId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        reportingYear: r.reportingYear,
        yearName: formatReportingYear(r.reportingYear),
        seasonId: r.seasonId,
        seasonName: r.season?.seasonName,
        activityId: r.activityId,
        activityName: r.activity?.activityName,
        nameOfNutriSmartVillage: r.nameOfNutriSmartVillage,
        cropCategoryId: r.cropCategoryId,
        cropCategoryName: r.cropCategory?.name,
        nameOfCrop: r.nameOfCrop,
        variety: r.variety,
        areaHa: r.areaHa,
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        totalBeneficiaries,

        // Aliases for frontend consistency
        villageName: r.nameOfNutriSmartVillage,
        cropCategory: r.cropCategory?.name,
        cropName: r.nameOfCrop,
        genMale: r.generalM,
        genFemale: r.generalF,
        obcMale: r.obcM,
        obcFemale: r.obcF,
        scMale: r.scM,
        scFemale: r.scF,
        stMale: r.stM,
        stFemale: r.stF
    };
}

module.exports = nariBioFortifiedCropRepository;
