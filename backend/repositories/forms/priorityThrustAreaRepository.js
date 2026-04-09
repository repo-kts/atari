const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const priorityThrustAreaRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const created = await prisma.priorityThrustArea.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                thrustArea: data.thrustArea,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('priorityThrustArea', kvkId);
        return created;
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.priorityThrustArea.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { priorityThrustAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.priorityThrustArea.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { priorityThrustAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.priorityThrustArea.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.priorityThrustArea.update({
            where: { priorityThrustAreaId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                thrustArea: data.thrustArea !== undefined ? data.thrustArea : existing.thrustArea,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('priorityThrustArea', existing.kvkId);
        return updated;
    },

    delete: async (id, user) => {
        const where = { priorityThrustAreaId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.priorityThrustArea.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const removed = await prisma.priorityThrustArea.delete({
            where: { priorityThrustAreaId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('priorityThrustArea', existing.kvkId);
        return removed;
    }
};

module.exports = priorityThrustAreaRepository;
