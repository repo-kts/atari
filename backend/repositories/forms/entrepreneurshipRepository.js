const prisma = require('../../config/prisma.js');

const entrepreneurshipRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.entrepreneurship.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                entrepreneurName: data.entrepreneurName,
                registeredAddress: data.registeredAddress,
                yearOfEstablishment: parseInt(data.yearOfEstablishment || 0),
                enterpriseType: data.enterpriseType,
                membersAssociated: parseInt(data.membersAssociated || 0),
                registrationDetails: data.registrationDetails,
                technicalComponents: data.technicalComponents,
                kvkRole: data.kvkRole,
                annualIncome: parseFloat(data.annualIncome || 0),
                developmentTimeline: data.developmentTimeline,
                statusBeforeAfter: data.statusBeforeAfter,
                presentWorkingCondition: data.presentWorkingCondition,
                majorAchievements: data.majorAchievements,
                majorConstraints: data.majorConstraints,
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

        return await prisma.entrepreneurship.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { entrepreneurshipId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.entrepreneurship.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { entrepreneurshipId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.entrepreneurship.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.entrepreneurship.update({
            where: { entrepreneurshipId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                entrepreneurName: data.entrepreneurName !== undefined ? data.entrepreneurName : existing.entrepreneurName,
                registeredAddress: data.registeredAddress !== undefined ? data.registeredAddress : existing.registeredAddress,
                yearOfEstablishment: data.yearOfEstablishment !== undefined ? parseInt(data.yearOfEstablishment || 0) : existing.yearOfEstablishment,
                enterpriseType: data.enterpriseType !== undefined ? data.enterpriseType : existing.enterpriseType,
                membersAssociated: data.membersAssociated !== undefined ? parseInt(data.membersAssociated || 0) : existing.membersAssociated,
                registrationDetails: data.registrationDetails !== undefined ? data.registrationDetails : existing.registrationDetails,
                technicalComponents: data.technicalComponents !== undefined ? data.technicalComponents : existing.technicalComponents,
                kvkRole: data.kvkRole !== undefined ? data.kvkRole : existing.kvkRole,
                annualIncome: data.annualIncome !== undefined ? parseFloat(data.annualIncome || 0) : existing.annualIncome,
                developmentTimeline: data.developmentTimeline !== undefined ? data.developmentTimeline : existing.developmentTimeline,
                statusBeforeAfter: data.statusBeforeAfter !== undefined ? data.statusBeforeAfter : existing.statusBeforeAfter,
                presentWorkingCondition: data.presentWorkingCondition !== undefined ? data.presentWorkingCondition : existing.presentWorkingCondition,
                majorAchievements: data.majorAchievements !== undefined ? data.majorAchievements : existing.majorAchievements,
                majorConstraints: data.majorConstraints !== undefined ? data.majorConstraints : existing.majorConstraints,
            }
        });
    },

    delete: async (id, user) => {
        const where = { entrepreneurshipId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.entrepreneurship.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.entrepreneurship.delete({
            where: { entrepreneurshipId: id }
        });
    }
};

module.exports = entrepreneurshipRepository;
