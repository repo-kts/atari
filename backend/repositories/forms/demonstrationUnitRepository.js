const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const { parseYearOfEstablishment } = require('../../utils/formIntValidation.js');
const { ValidationError } = require('../../utils/errorHandler.js');

const { buildFormListOrderBy, sortFormListRows } = require('../../utils/formListOrderBy.js');

const DEMO_UNIT_STATUSES = new Map([
    ['functional', 'Functional'],
    ['non-functional', 'Non-Functional'],
    ['non functional', 'Non-Functional'],
]);

async function resolveDemoUnitName(value) {
    const demoUnitName = String(value || '').trim();
    if (!demoUnitName) {
        throw new ValidationError('Name of Demo Unit is required', 'demoUnitName');
    }

    const master = await prisma.demoUnitNameMaster.findUnique({
        where: { demoUnitName },
        select: { demoUnitName: true },
    });
    if (!master) {
        throw new ValidationError('Select a valid Name of Demo Unit from the master', 'demoUnitName');
    }
    return master.demoUnitName;
}

function resolveDemoUnitStatus(value) {
    const normalized = String(value || 'Functional').trim().toLowerCase();
    const status = DEMO_UNIT_STATUSES.get(normalized);
    if (!status) {
        throw new ValidationError('Status must be Functional or Non-Functional', 'status');
    }
    return status;
}

const demonstrationUnitRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');
        const demoUnitName = await resolveDemoUnitName(data.demoUnitName);

        return await prisma.demonstrationUnit.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                demoUnitName,
                yearOfEstablishment: parseYearOfEstablishment(data.yearOfEstablishment, 'Year of establishment'),
                area: parseFloat(data.area || 0),
                status: resolveDemoUnitStatus(data.status),
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

        const _sortRows = await prisma.demonstrationUnit.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: buildFormListOrderBy(user, { reportingYear: true, kvkRelation: 'kvk', createdAt: true, tiebreak: 'demonstrationUnitId' })
        });
        return sortFormListRows(_sortRows, user, { tiebreak: 'demonstrationUnitId' });
    },

    findById: async (id, user) => {
        const where = { demonstrationUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        return await prisma.demonstrationUnit.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
    },

    update: async (id, data, user) => {
        const where = { demonstrationUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.demonstrationUnit.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        const demoUnitName = data.demoUnitName !== undefined
            ? await resolveDemoUnitName(data.demoUnitName)
            : existing.demoUnitName;

        return await prisma.demonstrationUnit.update({
            where: { demonstrationUnitId: id },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                demoUnitName,
                yearOfEstablishment: data.yearOfEstablishment !== undefined
                    ? parseYearOfEstablishment(data.yearOfEstablishment, 'Year of establishment')
                    : existing.yearOfEstablishment,
                area: data.area !== undefined ? parseFloat(data.area || 0) : existing.area,
                status: data.status !== undefined
                    ? resolveDemoUnitStatus(data.status)
                    : existing.status,
            }
        });
    },

    delete: async (id, user) => {
        const where = { demonstrationUnitId: id };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.demonstrationUnit.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.demonstrationUnit.delete({
            where: { demonstrationUnitId: id }
        });
    }
};

module.exports = demonstrationUnitRepository;
