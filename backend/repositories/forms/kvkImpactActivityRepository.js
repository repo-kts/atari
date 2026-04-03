const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');

const kvkImpactActivityRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.kvkImpactActivity.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                specificArea: data.specificArea,
                briefDetails: data.briefDetails,
                farmersBenefitted: parseInt(data.farmersBenefitted || 0),
                horizontalSpread: data.horizontalSpread,
                adoptionPercentage: parseFloat(data.adoptionPercentage || 0),
                qualitativeImpact: data.qualitativeImpact,
                quantitativeImpact: data.quantitativeImpact,
                incomeBefore: parseFloat(data.incomeBefore || 0),
                incomeAfter: parseFloat(data.incomeAfter || 0),
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

        return await prisma.kvkImpactActivity.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { impactActivityId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.kvkImpactActivity.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { impactActivityId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.kvkImpactActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.kvkImpactActivity.update({
            where: { impactActivityId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                specificArea: data.specificArea !== undefined ? data.specificArea : existing.specificArea,
                briefDetails: data.briefDetails !== undefined ? data.briefDetails : existing.briefDetails,
                farmersBenefitted: data.farmersBenefitted !== undefined ? parseInt(data.farmersBenefitted || 0) : existing.farmersBenefitted,
                horizontalSpread: data.horizontalSpread !== undefined ? data.horizontalSpread : existing.horizontalSpread,
                adoptionPercentage: data.adoptionPercentage !== undefined ? parseFloat(data.adoptionPercentage || 0) : existing.adoptionPercentage,
                qualitativeImpact: data.qualitativeImpact !== undefined ? data.qualitativeImpact : existing.qualitativeImpact,
                quantitativeImpact: data.quantitativeImpact !== undefined ? data.quantitativeImpact : existing.quantitativeImpact,
                incomeBefore: data.incomeBefore !== undefined ? parseFloat(data.incomeBefore || 0) : existing.incomeBefore,
                incomeAfter: data.incomeAfter !== undefined ? parseFloat(data.incomeAfter || 0) : existing.incomeAfter,
            }
        });
    },

    delete: async (id, user) => {
        const where = { impactActivityId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.kvkImpactActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.kvkImpactActivity.delete({
            where: { impactActivityId: id }
        });
    }
};

module.exports = kvkImpactActivityRepository;
