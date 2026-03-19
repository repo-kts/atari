const prisma = require('../../config/prisma.js');

const productionUnitRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.productionUnit.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                productName: data.productName,
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

        return await prisma.productionUnit.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { productionUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.productionUnit.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { productionUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.productionUnit.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.productionUnit.update({
            where: { productionUnitId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                productName: data.productName !== undefined ? data.productName : existing.productName,
                quantity: data.quantity !== undefined ? parseFloat(data.quantity || 0) : existing.quantity,
                costOfInputs: data.costOfInputs !== undefined ? parseFloat(data.costOfInputs || 0) : existing.costOfInputs,
                grossIncome: data.grossIncome !== undefined ? parseFloat(data.grossIncome || 0) : existing.grossIncome,
                remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
            }
        });
    },

    delete: async (id, user) => {
        const where = { productionUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.productionUnit.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.productionUnit.delete({
            where: { productionUnitId: id }
        });
    }
};

module.exports = productionUnitRepository;
