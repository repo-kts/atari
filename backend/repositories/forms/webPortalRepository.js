const prisma = require('../../config/prisma.js');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
} = require('../../utils/repositoryHelpers');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const _mapResponse = (r) => {
    if (!r) return null;
    return { ...r, id: r.webPortalId, yearName: formatReportingYear(r.reportingYear) };
};

const webPortalRepository = {
    create: async (data, user) => {
        try {
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            await validateKvkExists(kvkId);

            const result = await prisma.webPortal.create({
                data: {
                    kvkId,
                    reportingYear: (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })(),
                    noOfFarmersRegistered: parseInteger(data.noOfFarmersRegistered || 0, 'noOfFarmersRegistered'),
                    noOfVisitors: parseInteger(data.noOfVisitors || 0, 'noOfVisitors'),
                },
                include: { kvk: { select: { kvkName: true } } }
            });
            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Failed to create Web Portal record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        } else if (filters.kvkId) {
            where.kvkId = parseInteger(filters.kvkId, 'kvkId', false);
        }

        const records = await prisma.webPortal.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: { webPortalId: 'desc' },
        });
        return records.map(_mapResponse);
    },

    findById: async (id, user) => {
        const webPortalId = parseInteger(id, 'id', false);
        const where = { webPortalId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const record = await prisma.webPortal.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } } },
        });
        if (!record) throw new RepositoryError('Web Portal record not found', 'NOT_FOUND', 404);
        return _mapResponse(record);
    },

    update: async (id, data, user) => {
        const webPortalId = parseInteger(id, 'id', false);
        const where = { webPortalId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const existing = await prisma.webPortal.findFirst({ where });
        if (!existing) throw new RepositoryError('Web Portal record not found', 'NOT_FOUND', 404);

        const result = await prisma.webPortal.update({
            where: { webPortalId },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                noOfFarmersRegistered: data.noOfFarmersRegistered !== undefined ? parseInteger(data.noOfFarmersRegistered, 'noOfFarmersRegistered') : existing.noOfFarmersRegistered,
                noOfVisitors: data.noOfVisitors !== undefined ? parseInteger(data.noOfVisitors, 'noOfVisitors') : existing.noOfVisitors,
            },
            include: { kvk: { select: { kvkName: true } } }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const webPortalId = parseInteger(id, 'id', false);
        const where = { webPortalId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }
        const existing = await prisma.webPortal.findFirst({ where });
        if (!existing) throw new RepositoryError('Web Portal record not found', 'NOT_FOUND', 404);

        await prisma.webPortal.delete({ where: { webPortalId } });
        return { success: true, message: 'Deleted successfully' };
    }
};

module.exports = webPortalRepository;
