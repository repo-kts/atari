const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const { buildFormListOrderBy, sortFormListRows } = require('../../utils/formListOrderBy.js');
const kvkRoles = ['kvk_admin', 'kvk_user'];
const FIXED_UNIT_BY_ACTIVITY_TYPE = {
    AWARENESS_CAMP: 'No.',
    LITERATURE_DISTRIBUTION: 'No.',
    KISAN_MELA: 'No.',
};
const OTHER_UNIT_BY_NORMALIZED_VALUE = new Map([
    ['ha', 'ha'],
    ['kg', 'kg'],
    ['lt', 'lt'],
    ['no', 'No.'],
    ['no.', 'No.'],
]);

const ACTIVITY_CONFIG = [
    { type: 'TRAINING', quantityKey: 'training_count', unitKey: 'training_count_unit', prefix: 'training_count_' },
    { type: 'FRONTLINE_DEMONSTRATION', quantityKey: 'fld_count', unitKey: 'fld_count_unit', prefix: 'fld_count_' },
    {
        type: 'AWARENESS_CAMP',
        quantityKey: 'awareness_quantity',
        specificationKey: 'awareness_count',
        unitKey: 'awareness_count_unit',
        prefix: 'awareness_count_',
    },
    { type: 'INPUT_SEEDS', quantityKey: 'seeds_qty', unitKey: 'seeds_qty_unit', prefix: 'seeds_qty_' },
    { type: 'INPUT_SMALL_EQUIPMENT', quantityKey: 'small_equip_qty', unitKey: 'small_equip_qty_unit', prefix: 'small_equip_qty_' },
    { type: 'INPUT_LARGE_EQUIPMENT', quantityKey: 'large_equip_qty', unitKey: 'large_equip_qty_unit', prefix: 'large_equip_qty_' },
    { type: 'INPUT_FERTILIZER', quantityKey: 'fertilizer_qty', unitKey: 'fertilizer_qty_unit', prefix: 'fertilizer_qty_' },
    { type: 'INPUT_PPC', quantityKey: 'pp_chemicals_qty', unitKey: 'pp_chemicals_qty_unit', prefix: 'pp_chemicals_qty_' },
    { type: 'LITERATURE_DISTRIBUTION', quantityKey: 'lecture_count', unitKey: 'lecture_count_unit', prefix: 'lecture_count_' },
    { type: 'KISAN_MELA', quantityKey: 'kisan_mela_count', unitKey: 'kisan_mela_count_unit', prefix: 'kisan_mela_count_' },
    {
        type: 'OTHER',
        quantityKey: 'any_other_quantity',
        specificationKey: 'any_other_count',
        unitKey: 'any_other_count_unit',
        prefix: 'any_other_count_',
    },
];

function toInt(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloatOrNull(value) {
    if (value === undefined || value === null || value === '') return null;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function getDemographics(data, prefix) {
    return {
        generalM: toInt(data[`${prefix}general_m`]),
        generalF: toInt(data[`${prefix}general_f`]),
        obcM: toInt(data[`${prefix}obc_m`]),
        obcF: toInt(data[`${prefix}obc_f`]),
        scM: toInt(data[`${prefix}sc_m`]),
        scF: toInt(data[`${prefix}sc_f`]),
        stM: toInt(data[`${prefix}st_m`]),
        stF: toInt(data[`${prefix}st_f`]),
    };
}

function canonicalOtherUnit(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    return OTHER_UNIT_BY_NORMALIZED_VALUE.get(raw.toLowerCase()) || null;
}

function normalizeOtherUnit(value, required = false) {
    const raw = String(value || '').trim();
    if (!raw) {
        if (required) {
            throw new Error('Any Other unit must be one of: ha, kg, lt, No.');
        }
        return null;
    }

    const normalized = canonicalOtherUnit(raw);
    if (!normalized) {
        throw new Error('Any Other unit must be one of: ha, kg, lt, No.');
    }
    return normalized;
}

function unitForComponent(data, cfg) {
    if (FIXED_UNIT_BY_ACTIVITY_TYPE[cfg.type]) {
        return FIXED_UNIT_BY_ACTIVITY_TYPE[cfg.type];
    }
    if (cfg.type === 'OTHER') {
        const hasSpecification = String(data[cfg.specificationKey] || '').trim().length > 0;
        return normalizeOtherUnit(data[cfg.unitKey], hasSpecification);
    }
    return cfg.unitKey ? (data[cfg.unitKey] || null) : null;
}

function buildComponents(data) {
    return ACTIVITY_CONFIG.map((cfg) => ({
        activityType: cfg.type,
        quantity: cfg.quantityKey ? toFloatOrNull(data[cfg.quantityKey]) : null,
        unit: unitForComponent(data, cfg),
        specification: cfg.specificationKey ? (data[cfg.specificationKey] || null) : null,
        ...getDemographics(data, cfg.prefix),
    }));
}

function componentMap(components = []) {
    return components.reduce((acc, c) => {
        acc[c.activityType] = c;
        return acc;
    }, {});
}

const drmrActivityRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? toInt(user.kvkId) : toInt(data.kvkId, null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        // Reporting year is derived from the start date (startDate === reporting year).
        const startDate = data.startDate ? new Date(data.startDate) : new Date();

        const result = await prisma.drmrActivity.create({
            data: {
                kvkId,
                reportingYear: startDate,
                startDate,
                endDate: data.endDate ? new Date(data.endDate) : new Date(),
                totalBudgetUtilized: toFloatOrNull(data.totalBudget) ?? toFloatOrNull(data.totalBudgetUtilized) ?? 0,
                components: {
                    create: buildComponents(data),
                },
            },
            include: {
                kvk: { select: { kvkName: true } },
                components: true,
            },
        });

        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && kvkRoles.includes(user.roleName)) {
            where.kvkId = toInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = toInt(filters.kvkId);
        }
        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                ensureNotFutureDate(from);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                ensureNotFutureDate(to);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }

        const results = await prisma.drmrActivity.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                components: true,
            },
            orderBy: buildFormListOrderBy(user, { reportingYear: true, kvkRelation: 'kvk', createdAt: true, tiebreak: 'drmrActivityId' }),
        });
        sortFormListRows(results, user, { tiebreak: 'drmrActivityId' });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { drmrActivityId: toInt(id) };
        if (user && kvkRoles.includes(user.roleName)) {
            where.kvkId = toInt(user.kvkId);
        }

        const result = await prisma.drmrActivity.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                components: true,
            },
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { drmrActivityId: toInt(id) };
        if (user && kvkRoles.includes(user.roleName)) {
            where.kvkId = toInt(user.kvkId);
        }

        const existing = await prisma.drmrActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        // Reporting year mirrors the start date (startDate === reporting year).
        const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;

        const result = await prisma.drmrActivity.update({
            where: { drmrActivityId: toInt(id) },
            data: {
                reportingYear: startDate,
                startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                totalBudgetUtilized: (data.totalBudget !== undefined || data.totalBudgetUtilized !== undefined)
                    ? (toFloatOrNull(data.totalBudget) ?? toFloatOrNull(data.totalBudgetUtilized) ?? 0)
                    : existing.totalBudgetUtilized,
                components: {
                    deleteMany: {},
                    create: buildComponents(data),
                },
            },
            include: {
                kvk: { select: { kvkName: true } },
                components: true,
            },
        });

        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const where = { drmrActivityId: toInt(id) };
        if (user && kvkRoles.includes(user.roleName)) {
            where.kvkId = toInt(user.kvkId);
        }
        const existing = await prisma.drmrActivity.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return prisma.drmrActivity.delete({ where: { drmrActivityId: toInt(id) } });
    },
};

function _mapDemographicAliases(base, prefix, component) {
    return {
        ...base,
        [`${prefix}general_m`]: component?.generalM ?? 0,
        [`${prefix}general_f`]: component?.generalF ?? 0,
        [`${prefix}obc_m`]: component?.obcM ?? 0,
        [`${prefix}obc_f`]: component?.obcF ?? 0,
        [`${prefix}sc_m`]: component?.scM ?? 0,
        [`${prefix}sc_f`]: component?.scF ?? 0,
        [`${prefix}st_m`]: component?.stM ?? 0,
        [`${prefix}st_f`]: component?.stF ?? 0,
    };
}

function _mapResponse(r) {
    if (!r) return null;
    const map = componentMap(r.components || []);

    let out = {
        ...r,
        id: r.drmrActivityId,
        kvkName: r.kvk?.kvkName || '',
        reportingYear: formatReportingYear(r.reportingYear),
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : '',
        endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : '',
        totalBudget: r.totalBudgetUtilized,
        totalBudgetUtilized: r.totalBudgetUtilized,

        // Table fields
        trainingProgram: map.TRAINING?.quantity ?? null,
        frontlineDemonstration: map.FRONTLINE_DEMONSTRATION?.quantity ?? null,
        awarenessCamps: map.AWARENESS_CAMP?.specification ?? map.AWARENESS_CAMP?.quantity ?? null,
        awarenessCampsQuantity: map.AWARENESS_CAMP?.quantity ?? null,
        distributionOfLiterature: map.LITERATURE_DISTRIBUTION?.quantity ?? null,
        kisanMela: map.KISAN_MELA?.quantity ?? null,
        drmrAnyOtherSpecification: map.OTHER?.specification ?? null,
        drmrAnyOtherQuantity: map.OTHER?.quantity ?? null,

        // Form aliases
        training_count: map.TRAINING?.quantity ?? '',
        training_count_unit: map.TRAINING?.unit || 'Days',
        fld_count: map.FRONTLINE_DEMONSTRATION?.quantity ?? '',
        fld_count_unit: map.FRONTLINE_DEMONSTRATION?.unit || 'Hectare',
        awareness_count: map.AWARENESS_CAMP?.specification || '',
        awareness_quantity: map.AWARENESS_CAMP?.quantity ?? '',
        awareness_count_unit: 'No.',
        seeds_qty: map.INPUT_SEEDS?.quantity ?? '',
        seeds_qty_unit: map.INPUT_SEEDS?.unit || 'Kg',
        small_equip_qty: map.INPUT_SMALL_EQUIPMENT?.quantity ?? '',
        small_equip_qty_unit: map.INPUT_SMALL_EQUIPMENT?.unit || 'Number',
        large_equip_qty: map.INPUT_LARGE_EQUIPMENT?.quantity ?? '',
        large_equip_qty_unit: map.INPUT_LARGE_EQUIPMENT?.unit || 'Number',
        fertilizer_qty: map.INPUT_FERTILIZER?.quantity ?? '',
        fertilizer_qty_unit: map.INPUT_FERTILIZER?.unit || 'Kg',
        pp_chemicals_qty: map.INPUT_PPC?.quantity ?? '',
        pp_chemicals_qty_unit: map.INPUT_PPC?.unit || 'Lit.',
        lecture_count: map.LITERATURE_DISTRIBUTION?.quantity ?? '',
        lecture_count_unit: 'No.',
        kisan_mela_count: map.KISAN_MELA?.quantity ?? '',
        kisan_mela_count_unit: 'No.',
        any_other_count: map.OTHER?.specification || '',
        any_other_quantity: map.OTHER?.quantity ?? '',
        any_other_count_unit: canonicalOtherUnit(map.OTHER?.unit) || '',
    };

    out = _mapDemographicAliases(out, 'training_count_', map.TRAINING);
    out = _mapDemographicAliases(out, 'fld_count_', map.FRONTLINE_DEMONSTRATION);
    out = _mapDemographicAliases(out, 'awareness_count_', map.AWARENESS_CAMP);
    out = _mapDemographicAliases(out, 'seeds_qty_', map.INPUT_SEEDS);
    out = _mapDemographicAliases(out, 'small_equip_qty_', map.INPUT_SMALL_EQUIPMENT);
    out = _mapDemographicAliases(out, 'large_equip_qty_', map.INPUT_LARGE_EQUIPMENT);
    out = _mapDemographicAliases(out, 'fertilizer_qty_', map.INPUT_FERTILIZER);
    out = _mapDemographicAliases(out, 'pp_chemicals_qty_', map.INPUT_PPC);
    out = _mapDemographicAliases(out, 'lecture_count_', map.LITERATURE_DISTRIBUTION);
    out = _mapDemographicAliases(out, 'kisan_mela_count_', map.KISAN_MELA);
    out = _mapDemographicAliases(out, 'any_other_count_', map.OTHER);

    return out;
}

module.exports = drmrActivityRepository;
