const prisma = require('../../config/prisma.js');

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
                areaOrUnit: parseFloat(data.areaOrUnit || 0),
                bodyWeight: parseFloat(data.bodyWeight || 0),
                yield: parseFloat(data.yield || 0),
                generalM: parseInt(data.genMale || 0),
                generalF: parseInt(data.genFemale || 0),
                obcM: parseInt(data.obcMale || 0),
                obcF: parseInt(data.obcFemale || 0),
                scM: parseInt(data.scMale || 0),
                scF: parseInt(data.scFemale || 0),
                stM: parseInt(data.stMale || 0),
                stF: parseInt(data.stFemale || 0),
                grossCost: parseFloat(data.grossCost || 0),
                grossReturn: parseFloat(data.grossReturn || 0),
                netReturn: parseFloat(data.netReturn || 0),
                bcrRatio: parseFloat(data.bcrRatio || 0),
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
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

        if (filters.reportingYearId) {
            where.reportingYearId = parseInt(filters.reportingYearId);
        }

        return await prisma.nicraDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                category: true,
                subCategory: true,
                reportingYear: true,
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
                reportingYear: true,
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
                areaOrUnit: data.areaOrUnit !== undefined ? parseFloat(data.areaOrUnit || 0) : existing.areaOrUnit,
                bodyWeight: data.bodyWeight !== undefined ? parseFloat(data.bodyWeight || 0) : existing.bodyWeight,
                yield: data.yield !== undefined ? parseFloat(data.yield || 0) : existing.yield,
                generalM: data.genMale !== undefined ? parseInt(data.genMale || 0) : (data.generalM !== undefined ? parseInt(data.generalM || 0) : existing.generalM),
                generalF: data.genFemale !== undefined ? parseInt(data.genFemale || 0) : (data.generalF !== undefined ? parseInt(data.generalF || 0) : existing.generalF),
                obcM: data.obcMale !== undefined ? parseInt(data.obcMale || 0) : (data.obcM !== undefined ? parseInt(data.obcM || 0) : existing.obcM),
                obcF: data.obcFemale !== undefined ? parseInt(data.obcFemale || 0) : (data.obcF !== undefined ? parseInt(data.obcF || 0) : existing.obcF),
                scM: data.scMale !== undefined ? parseInt(data.scMale || 0) : (data.scM !== undefined ? parseInt(data.scM || 0) : existing.scM),
                scF: data.scFemale !== undefined ? parseInt(data.scFemale || 0) : (data.scF !== undefined ? parseInt(data.scF || 0) : existing.scF),
                stM: data.stMale !== undefined ? parseInt(data.stMale || 0) : (data.stM !== undefined ? parseInt(data.stM || 0) : existing.stM),
                stF: data.stFemale !== undefined ? parseInt(data.stFemale || 0) : (data.stF !== undefined ? parseInt(data.stF || 0) : existing.stF),
                grossCost: data.grossCost !== undefined ? parseFloat(data.grossCost) : existing.grossCost,
                grossReturn: data.grossReturn !== undefined ? parseFloat(data.grossReturn) : existing.grossReturn,
                netReturn: data.netReturn !== undefined ? parseFloat(data.netReturn) : existing.netReturn,
                bcrRatio: data.bcrRatio !== undefined ? parseFloat(data.bcrRatio) : existing.bcrRatio,
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
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
