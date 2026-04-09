const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

const revolvingFundRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        const created = await prisma.revolvingFund.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                openingBalance: parseFloat(data.openingBalance || 0),
                incomeDuringYear: parseFloat(data.incomeDuringYear || 0),
                expenditureDuringYear: parseFloat(data.expenditureDuringYear || 0),
                kind: data.kind || null,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('revolvingFund', kvkId);
        return created;
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        return await prisma.revolvingFund.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { revolvingFundId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.revolvingFund.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { revolvingFundId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.revolvingFund.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.revolvingFund.update({
            where: { revolvingFundId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                openingBalance: data.openingBalance !== undefined ? parseFloat(data.openingBalance) : existing.openingBalance,
                incomeDuringYear: data.incomeDuringYear !== undefined ? parseFloat(data.incomeDuringYear) : existing.incomeDuringYear,
                expenditureDuringYear: data.expenditureDuringYear !== undefined ? parseFloat(data.expenditureDuringYear) : existing.expenditureDuringYear,
                kind: data.kind !== undefined ? data.kind : existing.kind,
            }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('revolvingFund', existing.kvkId);
        return updated;
    },

    delete: async (id, user) => {
        const where = { revolvingFundId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.revolvingFund.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const removed = await prisma.revolvingFund.delete({
            where: { revolvingFundId: id }
        });
        await reportCacheInvalidationService.invalidateDataSourceForKvk('revolvingFund', existing.kvkId);
        return removed;
    }
};

module.exports = revolvingFundRepository;
