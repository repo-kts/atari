const prisma = require('../../config/prisma.js');

const demonstrationUnitRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.demonstrationUnit.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                demoUnitName: data.demoUnitName,
                yearOfEstablishment: parseInt(data.yearOfEstablishment || 0),
                area: parseFloat(data.area || 0),
                varietyBreed: data.varietyBreed,
                produce: data.produce,
                quantity: parseFloat(data.quantity || 0),
                costOfInputs: parseFloat(data.costOfInputs || 0),
                grossIncome: parseFloat(data.grossIncome || 0),
                remarks: data.remarks,
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

        return await prisma.demonstrationUnit.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { demonstrationUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.demonstrationUnit.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { demonstrationUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.demonstrationUnit.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.demonstrationUnit.update({
            where: { demonstrationUnitId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                demoUnitName: data.demoUnitName !== undefined ? data.demoUnitName : existing.demoUnitName,
                yearOfEstablishment: data.yearOfEstablishment !== undefined ? parseInt(data.yearOfEstablishment || 0) : existing.yearOfEstablishment,
                area: data.area !== undefined ? parseFloat(data.area || 0) : existing.area,
                varietyBreed: data.varietyBreed !== undefined ? data.varietyBreed : existing.varietyBreed,
                produce: data.produce !== undefined ? data.produce : existing.produce,
                quantity: data.quantity !== undefined ? parseFloat(data.quantity || 0) : existing.quantity,
                costOfInputs: data.costOfInputs !== undefined ? parseFloat(data.costOfInputs || 0) : existing.costOfInputs,
                grossIncome: data.grossIncome !== undefined ? parseFloat(data.grossIncome || 0) : existing.grossIncome,
                remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
            }
        });
    },

    delete: async (id, user) => {
        const where = { demonstrationUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.demonstrationUnit.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.demonstrationUnit.delete({
            where: { demonstrationUnitId: id }
        });
    }
};

module.exports = demonstrationUnitRepository;
