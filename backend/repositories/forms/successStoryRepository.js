const prisma = require('../../config/prisma.js');

const successStoryRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.successStory.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                farmerName: data.farmerName,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                education: data.education,
                experience: data.experience,
                contact: data.contact,
                fullAddress: data.fullAddress,
                professionalMembership: data.professionalMembership,
                awardsReceived: data.awardsReceived,
                majorAchievement: data.majorAchievement,
                storyTitle: data.storyTitle,
                problemStatement: data.problemStatement,
                kvkIntervention: data.kvkIntervention,
                practicesFollowed: data.practicesFollowed,
                results: data.results,
                impact: data.impact,
                futurePlans: data.futurePlans,
                supportingImages: data.supportingImages,
                enterprise: data.enterprise,
                grossIncome: parseFloat(data.grossIncome || 0),
                netIncome: parseFloat(data.netIncome || 0),
                costBenefitRatio: parseFloat(data.costBenefitRatio || 0),
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

        return await prisma.successStory.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { successStoryId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.successStory.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { successStoryId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.successStory.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.successStory.update({
            where: { successStoryId: id },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? (data.reportingYearId ? parseInt(data.reportingYearId) : null) : existing.reportingYearId,
                farmerName: data.farmerName !== undefined ? data.farmerName : existing.farmerName,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existing.dateOfBirth,
                education: data.education !== undefined ? data.education : existing.education,
                experience: data.experience !== undefined ? data.experience : existing.experience,
                contact: data.contact !== undefined ? data.contact : existing.contact,
                fullAddress: data.fullAddress !== undefined ? data.fullAddress : existing.fullAddress,
                professionalMembership: data.professionalMembership !== undefined ? data.professionalMembership : existing.professionalMembership,
                awardsReceived: data.awardsReceived !== undefined ? data.awardsReceived : existing.awardsReceived,
                majorAchievement: data.majorAchievement !== undefined ? data.majorAchievement : existing.majorAchievement,
                storyTitle: data.storyTitle !== undefined ? data.storyTitle : existing.storyTitle,
                problemStatement: data.problemStatement !== undefined ? data.problemStatement : existing.problemStatement,
                kvkIntervention: data.kvkIntervention !== undefined ? data.kvkIntervention : existing.kvkIntervention,
                practicesFollowed: data.practicesFollowed !== undefined ? data.practicesFollowed : existing.practicesFollowed,
                results: data.results !== undefined ? data.results : existing.results,
                impact: data.impact !== undefined ? data.impact : existing.impact,
                futurePlans: data.futurePlans !== undefined ? data.futurePlans : existing.futurePlans,
                supportingImages: data.supportingImages !== undefined ? data.supportingImages : existing.supportingImages,
                enterprise: data.enterprise !== undefined ? data.enterprise : existing.enterprise,
                grossIncome: data.grossIncome !== undefined ? parseFloat(data.grossIncome || 0) : existing.grossIncome,
                netIncome: data.netIncome !== undefined ? parseFloat(data.netIncome || 0) : existing.netIncome,
                costBenefitRatio: data.costBenefitRatio !== undefined ? parseFloat(data.costBenefitRatio || 0) : existing.costBenefitRatio,
            }
        });
    },

    delete: async (id, user) => {
        const where = { successStoryId: id };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.successStory.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.successStory.delete({
            where: { successStoryId: id }
        });
    }
};

module.exports = successStoryRepository;
