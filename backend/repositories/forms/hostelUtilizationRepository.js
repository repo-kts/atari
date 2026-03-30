const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');

const hostelUtilizationRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.hostelUtilization.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                months: data.months,
                traineesStayed: parseInt(data.traineesStayed || 0),
                traineeDays: parseInt(data.traineeDays || 0),
                reasonForShortFall: data.reasonForShortFall,
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

        return await prisma.hostelUtilization.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { hostelUtilizationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.hostelUtilization.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { hostelUtilizationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.hostelUtilization.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.hostelUtilization.update({
            where: { hostelUtilizationId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                months: data.months !== undefined ? data.months : existing.months,
                traineesStayed: data.traineesStayed !== undefined ? parseInt(data.traineesStayed || 0) : existing.traineesStayed,
                traineeDays: data.traineeDays !== undefined ? parseInt(data.traineeDays || 0) : existing.traineeDays,
                reasonForShortFall: data.reasonForShortFall !== undefined ? data.reasonForShortFall : existing.reasonForShortFall,
            }
        });
    },

    delete: async (id, user) => {
        const where = { hostelUtilizationId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.hostelUtilization.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.hostelUtilization.delete({
            where: { hostelUtilizationId: id }
        });
    }
};

module.exports = hostelUtilizationRepository;
