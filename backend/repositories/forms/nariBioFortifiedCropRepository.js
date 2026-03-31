const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const nariBioFortifiedCropRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkId = isKvkScoped ? parseInt(user.kvkId) : parseInt(data.kvkId);

        if (isNaN(kvkId)) throw new Error('Valid kvkId is required');

        const result = await prisma.nariBioFortifiedCrop.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                seasonId: data.seasonId ? parseInt(data.seasonId) : null,
                activityId: data.activityId ? parseInt(data.activityId) : null,
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage || '',
                cropCategoryId: data.cropCategoryId ? parseInt(data.cropCategoryId) : null,
                nameOfCrop: data.nameOfCrop || '',
                variety: data.variety || '',
                areaHa: data.areaHa ? parseFloat(data.areaHa) : 0,
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
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage !== undefined ? data.nameOfNutriSmartVillage : undefined,
                cropCategoryId: data.cropCategoryId ? parseInt(data.cropCategoryId) : undefined,
                nameOfCrop: data.nameOfCrop !== undefined ? data.nameOfCrop : undefined,
                variety: data.variety !== undefined ? data.variety : undefined,
                areaHa: data.areaHa !== undefined ? parseFloat(data.areaHa) : undefined,
                generalM: data.generalM !== undefined || data.genMale !== undefined ? parseInt(data.generalM ?? data.genMale) : undefined,
                generalF: data.generalF !== undefined || data.genFemale !== undefined ? parseInt(data.generalF ?? data.genFemale) : undefined,
                obcM: data.obcM !== undefined || data.obcMale !== undefined ? parseInt(data.obcM ?? data.obcMale) : undefined,
                obcF: data.obcF !== undefined || data.obcFemale !== undefined ? parseInt(data.obcF ?? data.obcFemale) : undefined,
                scM: data.scM !== undefined || data.scMale !== undefined ? parseInt(data.scM ?? data.scMale) : undefined,
                scF: data.scF !== undefined || data.scFemale !== undefined ? parseInt(data.scF ?? data.scFemale) : undefined,
                stM: data.stM !== undefined || data.stMale !== undefined ? parseInt(data.stM ?? data.stMale) : undefined,
                stF: data.stF !== undefined || data.stFemale !== undefined ? parseInt(data.stF ?? data.stFemale) : undefined,
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
    }
};

function _mapResponse(r) {
    if (!r) return null;
    const totalBeneficiaries = (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0);

    return {
        id: r.nariBioFortifiedCropId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        reportingYear: formatReportingYear(r.reportingYear),
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
