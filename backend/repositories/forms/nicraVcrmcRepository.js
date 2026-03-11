const prisma = require('../../config/prisma.js');

const nicraVcrmcRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraVcrmc.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                villageName: data.villageName,
                constitutionDate: new Date(data.constitutionDate),
                meetingsOrganized: parseInt(data.meetingsOrganized || 0),
                meetingDate: new Date(data.meetingDate),
                nameOfSecretary: data.nameOfSecretary,
                nameOfPresident: data.nameOfPresident,
                majorDecisionTaken: data.majorDecisionTaken,
                maleMembers: parseInt(data.maleMembers || 0),
                femaleMembers: parseInt(data.femaleMembers || 0),
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

        return await prisma.nicraVcrmc.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true
            },
            orderBy: { nicraVcrmcId: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { nicraVcrmcId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.nicraVcrmc.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: true
            }
        });
    },

    update: async (id, data, user) => {
        const where = { nicraVcrmcId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraVcrmc.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraVcrmc.update({
            where: { nicraVcrmcId: parseInt(id) },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                villageName: data.villageName !== undefined ? data.villageName : existing.villageName,
                constitutionDate: data.constitutionDate ? new Date(data.constitutionDate) : existing.constitutionDate,
                meetingsOrganized: data.meetingsOrganized !== undefined ? parseInt(data.meetingsOrganized) : existing.meetingsOrganized,
                meetingDate: data.meetingDate ? new Date(data.meetingDate) : existing.meetingDate,
                nameOfSecretary: data.nameOfSecretary !== undefined ? data.nameOfSecretary : existing.nameOfSecretary,
                nameOfPresident: data.nameOfPresident !== undefined ? data.nameOfPresident : existing.nameOfPresident,
                majorDecisionTaken: data.majorDecisionTaken !== undefined ? data.majorDecisionTaken : existing.majorDecisionTaken,
                maleMembers: data.maleMembers !== undefined ? parseInt(data.maleMembers) : existing.maleMembers,
                femaleMembers: data.femaleMembers !== undefined ? parseInt(data.femaleMembers) : existing.femaleMembers,
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : (existing.photographs || ''),
            }
        });
    },

    delete: async (id, user) => {
        const where = { nicraVcrmcId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraVcrmc.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraVcrmc.delete({
            where: { nicraVcrmcId: parseInt(id) }
        });
    }
};

module.exports = nicraVcrmcRepository;
