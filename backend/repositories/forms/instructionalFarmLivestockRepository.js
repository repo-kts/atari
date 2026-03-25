const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');

const instructionalFarmLivestockRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.instructionalFarmLivestock.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                animalName: data.animalName,
                speciesBreed: data.speciesBreed,
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

        return await prisma.instructionalFarmLivestock.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { instructionalFarmLivestockId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.instructionalFarmLivestock.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { instructionalFarmLivestockId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.instructionalFarmLivestock.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.instructionalFarmLivestock.update({
            where: { instructionalFarmLivestockId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                animalName: data.animalName !== undefined ? data.animalName : existing.animalName,
                speciesBreed: data.speciesBreed !== undefined ? data.speciesBreed : existing.speciesBreed,
                typeOfProduce: data.typeOfProduce !== undefined ? data.typeOfProduce : existing.typeOfProduce,
                quantity: data.quantity !== undefined ? parseFloat(data.quantity || 0) : existing.quantity,
                costOfInputs: data.costOfInputs !== undefined ? parseFloat(data.costOfInputs || 0) : existing.costOfInputs,
                grossIncome: data.grossIncome !== undefined ? parseFloat(data.grossIncome || 0) : existing.grossIncome,
                remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
            }
        });
    },

    delete: async (id, user) => {
        const where = { instructionalFarmLivestockId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.instructionalFarmLivestock.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.instructionalFarmLivestock.delete({
            where: { instructionalFarmLivestockId: id }
        });
    }
};

module.exports = instructionalFarmLivestockRepository;
