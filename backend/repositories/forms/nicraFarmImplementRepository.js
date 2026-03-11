const prisma = require('../../config/prisma.js');

const nicraFarmImplementRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraFarmImplement.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                nameOfFarmImplement: data.nameOfFarmImplement,
                areaCovered: parseFloat(data.areaCovered || 0),
                farmImplementUsedHours: parseFloat(data.farmImplementUsedHours || 0),
                revenueGeneratedRs: parseFloat(data.revenueGeneratedRs || 0),
                expenditureIncurredRepairingRs: parseFloat(data.expenditureIncurredRepairingRs || 0),
                generalM: parseInt(data.genMale || data.generalM || 0),
                generalF: parseInt(data.genFemale || data.generalF || 0),
                obcM: parseInt(data.obcMale || data.obcM || 0),
                obcF: parseInt(data.obcFemale || data.obcF || 0),
                scM: parseInt(data.scMale || data.scM || 0),
                scF: parseInt(data.scFemale || data.scF || 0),
                stM: parseInt(data.stMale || data.stM || 0),
                stF: parseInt(data.stFemale || data.stF || 0),
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : '',
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

        return await prisma.nicraFarmImplement.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true
            },
            orderBy: { nicraFarmImplementId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraFarmImplementId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraFarmImplement.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraFarmImplementId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraFarmImplement.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraFarmImplement.update({
            where: { nicraFarmImplementId: parseInt(id) },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                nameOfFarmImplement: data.nameOfFarmImplement !== undefined ? data.nameOfFarmImplement : existing.nameOfFarmImplement,
                areaCovered: data.areaCovered !== undefined ? parseFloat(data.areaCovered) : existing.areaCovered,
                farmImplementUsedHours: data.farmImplementUsedHours !== undefined ? parseFloat(data.farmImplementUsedHours) : existing.farmImplementUsedHours,
                revenueGeneratedRs: data.revenueGeneratedRs !== undefined ? parseFloat(data.revenueGeneratedRs) : existing.revenueGeneratedRs,
                expenditureIncurredRepairingRs: data.expenditureIncurredRepairingRs !== undefined ? parseFloat(data.expenditureIncurredRepairingRs) : existing.expenditureIncurredRepairingRs,
                generalM: data.genMale !== undefined ? parseInt(data.genMale) : (data.generalM !== undefined ? parseInt(data.generalM) : existing.generalM),
                generalF: data.genFemale !== undefined ? parseInt(data.genFemale) : (data.generalF !== undefined ? parseInt(data.generalF) : existing.generalF),
                obcM: data.obcMale !== undefined ? parseInt(data.obcMale) : (data.obcM !== undefined ? parseInt(data.obcM) : existing.obcM),
                obcF: data.obcFemale !== undefined ? parseInt(data.obcFemale) : (data.obcF !== undefined ? parseInt(data.obcF) : existing.obcF),
                scM: data.scMale !== undefined ? parseInt(data.scMale) : (data.scM !== undefined ? parseInt(data.scM) : existing.scM),
                scF: data.scFemale !== undefined ? parseInt(data.scFemale) : (data.scF !== undefined ? parseInt(data.scF) : existing.scF),
                stM: data.stMale !== undefined ? parseInt(data.stMale) : (data.stM !== undefined ? parseInt(data.stM) : existing.stM),
                stF: data.stFemale !== undefined ? parseInt(data.stFemale) : (data.stF !== undefined ? parseInt(data.stF) : existing.stF),
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : (existing.photographs || ''),
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraFarmImplementId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraFarmImplement.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraFarmImplement.delete({
            where: { nicraFarmImplementId: parseInt(id) }
        });
    }
};

module.exports = nicraFarmImplementRepository;
