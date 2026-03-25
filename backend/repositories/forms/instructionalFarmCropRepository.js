const prisma = require('../../config/prisma.js');

const instructionalFarmCropRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.instructionalFarmCrop.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                seasonId: data.seasonId ? parseInt(data.seasonId) : null,
                cropName: data.cropName,
                area: parseFloat(data.area || 0),
                variety: data.variety,
                typeOfProduce: data.typeOfProduce,
                quantity: parseFloat(data.quantity || 0),
                costOfInputs: parseFloat(data.costOfInputs || 0),
                grossIncome: parseFloat(data.grossIncome || 0),
                remarks: data.remarks,
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.instructionalFarmCrop.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } },
                season: { select: { seasonName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { instructionalFarmCropId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.instructionalFarmCrop.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } },
                season: { select: { seasonName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { instructionalFarmCropId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.instructionalFarmCrop.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.instructionalFarmCrop.update({
            where: { instructionalFarmCropId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                seasonId: data.seasonId !== undefined ? (data.seasonId ? parseInt(data.seasonId) : null) : existing.seasonId,
                cropName: data.cropName !== undefined ? data.cropName : existing.cropName,
                area: data.area !== undefined ? parseFloat(data.area || 0) : existing.area,
                variety: data.variety !== undefined ? data.variety : existing.variety,
                typeOfProduce: data.typeOfProduce !== undefined ? data.typeOfProduce : existing.typeOfProduce,
                quantity: data.quantity !== undefined ? parseFloat(data.quantity || 0) : existing.quantity,
                costOfInputs: data.costOfInputs !== undefined ? parseFloat(data.costOfInputs || 0) : existing.costOfInputs,
                grossIncome: data.grossIncome !== undefined ? parseFloat(data.grossIncome || 0) : existing.grossIncome,
                remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
            }
        });
    },

    delete: async (id, user) => {
        const where = { instructionalFarmCropId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.instructionalFarmCrop.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.instructionalFarmCrop.delete({
            where: { instructionalFarmCropId: id }
        });
    }
};

module.exports = instructionalFarmCropRepository;
