const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const nariNutritionalGardenRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkId = isKvkScoped ? parseInt(user.kvkId) : parseInt(data.kvkId);

        if (isNaN(kvkId)) throw new Error('Valid kvkId is required');

        // Validation for mandatory fields
        const activityId = parseInt(data.activityId);
        const typeOfNutritionalGardenId = parseInt(data.typeOfNutritionalGardenId);
        const villageName = data.nameOfNutriSmartVillage || data.villageName || '';

        if (isNaN(activityId)) throw new Error('Activity is required');
        if (!villageName) throw new Error('Name of Nutri-Smart Village is required');
        if (isNaN(typeOfNutritionalGardenId)) throw new Error('Type of Nutritional Garden is required');

        const result = await prisma.nariNutritionalGarden.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                activityId: parseInt(data.activityId),
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage,
                typeOfNutritionalGardenId: parseInt(data.typeOfNutritionalGardenId),
                number: parseInt(data.number || 0),
                areaSqm: parseFloat(data.areaSqm || 0),
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
                kvk: { select: { kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
                activity: { select: { activityName: true } },
                typeOfNutritionalGarden: { select: { name: true } },
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

        const results = await prisma.nariNutritionalGarden.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
                activity: { select: { activityName: true } },
                typeOfNutritionalGarden: { select: { name: true } },
                results: { orderBy: { nariNutritionalGardenResultId: 'asc' } },
            },
            orderBy: { nariNutritionalGardenId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.nariNutritionalGarden.findUnique({
            where: { nariNutritionalGardenId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
                activity: { select: { activityName: true } },
                typeOfNutritionalGarden: { select: { name: true } },
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const result = await prisma.nariNutritionalGarden.update({
            where: { nariNutritionalGardenId: parseInt(id) },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : undefined,
                activityId: data.activityId ? parseInt(data.activityId) : undefined,
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage || data.villageName || undefined,
                typeOfNutritionalGardenId: data.typeOfNutritionalGardenId ? parseInt(data.typeOfNutritionalGardenId) : undefined,
                number: data.number !== undefined ? (parseInt(data.number) || 0) : undefined,
                areaSqm: data.areaSqm !== undefined ? (parseFloat(data.areaSqm) || 0) : undefined,
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
                kvk: { select: { kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } },
                activity: { select: { activityName: true } },
                typeOfNutritionalGarden: { select: { name: true } },
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.nariNutritionalGarden.delete({
            where: { nariNutritionalGardenId: parseInt(id) }
        });
    },

    // Result Methods
    getResultById: async (id) => {
        return await prisma.nariNutritionalGardenResult.findFirst({
            where: { nariNutritionalGardenId: parseInt(id) }
        });
    },

    createResult: async (id, data) => {
        const nutritionalGardenId = parseInt(id);
        return await prisma.$transaction(async (tx) => {
            const result = await tx.nariNutritionalGardenResult.create({
                data: {
                    nariNutritionalGardenId: nutritionalGardenId,
                    reportingYear: data.reportingYear ? new Date(data.reportingYear) : null,
                    cropName: data.cropName || '',
                    variety: data.variety || '',
                    areaSqm: parseFloat(data.areaSqm || 0),
                    productionKg: parseFloat(data.productionKg || 0),
                    consumptionKg: parseFloat(data.consumptionKg || 0),
                    sellKg: parseFloat(data.sellKg || 0),
                    income: parseFloat(data.income || 0),
                }
            });

            await tx.nariNutritionalGarden.update({
                where: { nariNutritionalGardenId: nutritionalGardenId },
                data: { status: 'COMPLETED' }
            });

            return result;
        });
    },

    updateResult: async (id, data) => {
        const nutritionalGardenId = parseInt(id);
        const existingResult = await prisma.nariNutritionalGardenResult.findFirst({
            where: { nariNutritionalGardenId: nutritionalGardenId }
        });

        if (!existingResult) throw new Error('Result not found');

        return await prisma.nariNutritionalGardenResult.update({
            where: { nariNutritionalGardenResultId: existingResult.nariNutritionalGardenResultId },
            data: {
                reportingYear: data.reportingYear ? new Date(data.reportingYear) : undefined,
                cropName: data.cropName !== undefined ? data.cropName : undefined,
                variety: data.variety !== undefined ? data.variety : undefined,
                areaSqm: data.areaSqm !== undefined ? parseFloat(data.areaSqm) : undefined,
                productionKg: data.productionKg !== undefined ? parseFloat(data.productionKg) : undefined,
                consumptionKg: data.consumptionKg !== undefined ? parseFloat(data.consumptionKg) : undefined,
                sellKg: data.sellKg !== undefined ? parseFloat(data.sellKg) : undefined,
                income: data.income !== undefined ? parseFloat(data.income) : undefined,
            }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    const totalBeneficiaries = (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0);

    return {
        id: r.nariNutritionalGardenId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        stateName: r.kvk?.state?.stateName || '',
        districtName: r.kvk?.district?.districtName || '',
        reportingYear: r.reportingYear,
        yearName: formatReportingYear(r.reportingYear),
        activityId: r.activityId,
        activityName: r.activity?.activityName,
        nameOfNutriSmartVillage: r.nameOfNutriSmartVillage,
        typeOfNutritionalGardenId: r.typeOfNutritionalGardenId,
        typeOfNutritionalGarden: r.typeOfNutritionalGarden?.name,
        number: r.number,
        areaSqm: r.areaSqm,
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        totalBeneficiaries,
        status: r.status,

        // Aliases for frontend consistency
        villageName: r.nameOfNutriSmartVillage,
        gardenType: r.typeOfNutritionalGarden?.name,
        genMale: r.generalM,
        genFemale: r.generalF,
        obcMale: r.obcM,
        obcFemale: r.obcF,
        scMale: r.scM,
        scFemale: r.scF,
        stMale: r.stM,
        stFemale: r.stF,

        results: Array.isArray(r.results)
            ? r.results.map((row) => ({
                  nariNutritionalGardenResultId: row.nariNutritionalGardenResultId,
                  reportingYear: row.reportingYear,
                  cropName: row.cropName,
                  variety: row.variety,
                  areaSqm: row.areaSqm,
                  productionKg: row.productionKg,
                  consumptionKg: row.consumptionKg,
                  sellKg: row.sellKg,
                  income: row.income,
              }))
            : [],
        resultCount: Array.isArray(r.results) ? r.results.length : 0,
    };
}

module.exports = nariNutritionalGardenRepository;
