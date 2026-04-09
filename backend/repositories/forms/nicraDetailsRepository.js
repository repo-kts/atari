const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, parsePositiveInteger } = require('../../utils/reportingYearUtils.js');

const safeParseFloat = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
};

const safeParseInt = (val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
};

const nicraDetailsRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraDetails.create({
            data: {
                kvkId,
                nicraCategoryId: parseInt(data.categoryId || data.nicraCategoryId),
                nicraSubCategoryId: parseInt(data.subCategoryId || data.nicraSubCategoryId),
                fstType: data.fstType || '',
                cropName: data.cropName || '',
                seasonId: data.seasonId ? parseInt(data.seasonId) : null,
                month: (data.month || 'JANUARY').toUpperCase(),
                technologyDemonstrated: data.technologyDemonstrated || '',
                areaOrUnit: safeParseFloat(data.areaOrUnit),
                bodyWeight: safeParseFloat(data.bodyWeight),
                yield: safeParseFloat(data.yield),
                generalM: safeParseInt(data.genMale),
                generalF: safeParseInt(data.genFemale),
                obcM: safeParseInt(data.obcMale),
                obcF: safeParseInt(data.obcFemale),
                scM: safeParseInt(data.scMale),
                scF: safeParseInt(data.scFemale),
                stM: safeParseInt(data.stMale),
                stF: safeParseInt(data.stFemale),
                grossCost: safeParseFloat(data.grossCost),
                grossReturn: safeParseFloat(data.grossReturn),
                netReturn: safeParseFloat(data.netReturn),
                bcrRatio: safeParseFloat(data.bcrRatio),
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : null,
                uploadFile: data.uploadFile || null,
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                ensureNotFutureDate(from);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                ensureNotFutureDate(to);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }

        return await prisma.nicraDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                category: true,
                subCategory: true,
                season: true
            },
            orderBy: { nicraDetailsId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraDetails.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                category: true,
                subCategory: true,
                season: true
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraDetails.update({
            where: { nicraDetailsId: parseInt(id) },
            data: {
                nicraCategoryId: data.categoryId !== undefined ? parseInt(data.categoryId) : existing.nicraCategoryId,
                nicraSubCategoryId: data.subCategoryId !== undefined ? parseInt(data.subCategoryId) : existing.nicraSubCategoryId,
                fstType: data.fstType !== undefined ? data.fstType : existing.fstType,
                cropName: data.cropName !== undefined ? data.cropName : existing.cropName,
                seasonId: data.seasonId !== undefined ? (data.seasonId ? parseInt(data.seasonId) : null) : existing.seasonId,
                month: data.month !== undefined ? data.month.toUpperCase() : existing.month,
                technologyDemonstrated: data.technologyDemonstrated !== undefined ? data.technologyDemonstrated : existing.technologyDemonstrated,
                areaOrUnit: data.areaOrUnit !== undefined ? safeParseFloat(data.areaOrUnit) : existing.areaOrUnit,
                bodyWeight: data.bodyWeight !== undefined ? safeParseFloat(data.bodyWeight) : existing.bodyWeight,
                yield: data.yield !== undefined ? safeParseFloat(data.yield) : existing.yield,
                generalM: data.genMale !== undefined ? safeParseInt(data.genMale) : (data.generalM !== undefined ? safeParseInt(data.generalM) : existing.generalM),
                generalF: data.genFemale !== undefined ? safeParseInt(data.genFemale) : (data.generalF !== undefined ? safeParseInt(data.generalF) : existing.generalF),
                obcM: data.obcMale !== undefined ? safeParseInt(data.obcMale) : (data.obcM !== undefined ? safeParseInt(data.obcM) : existing.obcM),
                obcF: data.obcFemale !== undefined ? safeParseInt(data.obcFemale) : (data.obcF !== undefined ? safeParseInt(data.obcF) : existing.obcF),
                scM: data.scMale !== undefined ? safeParseInt(data.scMale) : (data.scM !== undefined ? safeParseInt(data.scM) : existing.scM),
                scF: data.scFemale !== undefined ? safeParseInt(data.scFemale) : (data.scF !== undefined ? safeParseInt(data.scF) : existing.scF),
                stM: data.stMale !== undefined ? safeParseInt(data.stMale) : (data.stM !== undefined ? safeParseInt(data.stM) : existing.stM),
                stF: data.stFemale !== undefined ? safeParseInt(data.stFemale) : (data.stF !== undefined ? safeParseInt(data.stF) : existing.stF),
                grossCost: data.grossCost !== undefined ? safeParseFloat(data.grossCost) : existing.grossCost,
                grossReturn: data.grossReturn !== undefined ? safeParseFloat(data.grossReturn) : existing.grossReturn,
                netReturn: data.netReturn !== undefined ? safeParseFloat(data.netReturn) : existing.netReturn,
                bcrRatio: data.bcrRatio !== undefined ? safeParseFloat(data.bcrRatio) : existing.bcrRatio,
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : existing.photographs,
                uploadFile: data.uploadFile !== undefined ? data.uploadFile : existing.uploadFile,
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraDetailsId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraDetails.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraDetails.delete({
            where: { nicraDetailsId: parseInt(id) }
        });
    }
};

module.exports = nicraDetailsRepository;
