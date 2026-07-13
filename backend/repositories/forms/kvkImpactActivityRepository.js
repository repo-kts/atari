const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const { assertOtherFieldsValid } = require('../../utils/formRepositoryHelpers.js');

const KVK_IMPACT_ACTIVITY_OTHER_RULES = [
    { idField: 'specificArea', otherField: 'specificAreaOther', model: 'impactSpecificAreaMaster', idKey: 'specificAreaName', label: 'Specific area', stringId: true },
];

const { buildFormListOrderBy, sortFormListRows } = require('../../utils/formListOrderBy.js');
const kvkImpactActivityRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');
        await assertOtherFieldsValid(KVK_IMPACT_ACTIVITY_OTHER_RULES, data);

        return await prisma.kvkImpactActivity.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                specificArea: data.specificArea,
                specificAreaOther: (data.specificAreaOther && String(data.specificAreaOther).trim()) || null,
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

        const _sortRows = await prisma.kvkImpactActivity.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: buildFormListOrderBy(user, { reportingYear: true, kvkRelation: 'kvk', createdAt: true, tiebreak: 'impactActivityId' })
        });
        return sortFormListRows(_sortRows, user, { tiebreak: 'impactActivityId' });
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
        await assertOtherFieldsValid(KVK_IMPACT_ACTIVITY_OTHER_RULES, {
            specificArea: data.specificArea !== undefined ? data.specificArea : existing.specificArea,
            specificAreaOther: data.specificAreaOther !== undefined ? data.specificAreaOther : existing.specificAreaOther,
        });

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
                specificAreaOther: data.specificAreaOther !== undefined ? ((String(data.specificAreaOther).trim()) || null) : existing.specificAreaOther,
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
