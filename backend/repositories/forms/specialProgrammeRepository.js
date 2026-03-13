const prisma = require('../../config/prisma.js');

const specialProgrammeRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.specialProgramme.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                programmeType: data.programmeType,
                programmeName: data.programmeName,
                programmePurpose: data.programmePurpose,
                initiationDate: data.initiationDate ? new Date(data.initiationDate) : null,
                fundingAgency: data.fundingAgency,
                amount: parseFloat(data.amount || 0),
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

        return await prisma.specialProgramme.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { specialProgrammeId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.specialProgramme.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { specialProgrammeId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.specialProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.specialProgramme.update({
            where: { specialProgrammeId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                programmeType: data.programmeType !== undefined ? data.programmeType : existing.programmeType,
                programmeName: data.programmeName !== undefined ? data.programmeName : existing.programmeName,
                programmePurpose: data.programmePurpose !== undefined ? data.programmePurpose : existing.programmePurpose,
                initiationDate: data.initiationDate !== undefined ? (data.initiationDate ? new Date(data.initiationDate) : null) : existing.initiationDate,
                fundingAgency: data.fundingAgency !== undefined ? data.fundingAgency : existing.fundingAgency,
                amount: data.amount !== undefined ? parseFloat(data.amount || 0) : existing.amount,
            }
        });
    },

    delete: async (id, user) => {
        const where = { specialProgrammeId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.specialProgramme.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.specialProgramme.delete({
            where: { specialProgrammeId: id }
        });
    }
};

module.exports = specialProgrammeRepository;
