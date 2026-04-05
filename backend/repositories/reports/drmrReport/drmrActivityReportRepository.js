const prisma = require('../../../config/prisma.js');

const DRMR_ACTIVITY_ROWS = [
    {
        activityType: 'TRAINING',
        group: null,
        itemLabel: 'Training (Capacity building / skill development etc)',
        unitFallback: 'Days',
        quantityKey: 'training_count',
        specificationKey: null,
        prefix: 'training_count_',
    },
    {
        activityType: 'FRONTLINE_DEMONSTRATION',
        group: 'Frontline demonstrations (FLDs) and other demonstrations',
        itemLabel: 'Area under FLDs',
        unitFallback: 'Hectare',
        quantityKey: 'fld_count',
        specificationKey: null,
        prefix: 'fld_count_',
    },
    {
        activityType: 'AWARENESS_CAMP',
        group: null,
        itemLabel: 'Awareness camps, exposure visit etc',
        unitFallback: 'N/A',
        quantityKey: null,
        specificationKey: 'awareness_count',
        prefix: 'awareness_count_',
    },
    {
        activityType: 'INPUT_SEEDS',
        group: 'Input Distribution',
        itemLabel: 'Seeds (Field Crops)',
        unitFallback: 'Kg',
        quantityKey: 'seeds_qty',
        specificationKey: null,
        prefix: 'seeds_qty_',
    },
    {
        activityType: 'INPUT_SMALL_EQUIPMENT',
        group: null,
        itemLabel: 'Small equipments (Upto Rs.2000)',
        unitFallback: 'Number',
        quantityKey: 'small_equip_qty',
        specificationKey: null,
        prefix: 'small_equip_qty_',
    },
    {
        activityType: 'INPUT_LARGE_EQUIPMENT',
        group: null,
        itemLabel: 'Large equipments (more than Rs.2000)',
        unitFallback: 'Number',
        quantityKey: 'large_equip_qty',
        specificationKey: null,
        prefix: 'large_equip_qty_',
    },
    {
        activityType: 'INPUT_FERTILIZER',
        group: null,
        itemLabel: 'Fertilizers (NPK)/ Secondary/ Micro Fertilizers',
        unitFallback: 'Kg',
        quantityKey: 'fertilizer_qty',
        specificationKey: null,
        prefix: 'fertilizer_qty_',
    },
    {
        activityType: 'INPUT_PPC',
        group: null,
        itemLabel: 'Plant Protection chemicals',
        unitFallback: 'Lit.',
        quantityKey: 'pp_chemicals_qty',
        specificationKey: null,
        prefix: 'pp_chemicals_qty_',
    },
    {
        activityType: 'LITERATURE_DISTRIBUTION',
        group: null,
        itemLabel: 'Distribution of Literature',
        unitFallback: 'N/A',
        quantityKey: 'lecture_count',
        specificationKey: null,
        prefix: 'lecture_count_',
    },
    {
        activityType: 'KISAN_MELA',
        group: null,
        itemLabel: 'Kisan Mela',
        unitFallback: 'N/A',
        quantityKey: 'kisan_mela_count',
        specificationKey: null,
        prefix: 'kisan_mela_count_',
    },
    {
        activityType: 'OTHER',
        group: null,
        itemLabel: 'Any other (specify)',
        unitFallback: 'N/A',
        quantityKey: null,
        specificationKey: 'any_other_count',
        prefix: 'any_other_count_',
    },
];

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function pickFirstValue(record, keys = []) {
    for (const key of keys) {
        if (!key) {
            continue;
        }
        const value = record?.[key];
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return null;
}

function buildDateRangeForYear(year) {
    const y = Number(year);
    if (!Number.isFinite(y) || y < 1900 || y > 9999) {
        return null;
    }
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId: Number(kvkId) };

    const hasDateRange = filters.startDate || filters.endDate;
    if (hasDateRange) {
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;
        const dateOr = [];

        if (start || end) {
            const reportingYear = {};
            const startDate = {};
            const endDate = {};

            if (start) {
                reportingYear.gte = start;
                startDate.gte = start;
                endDate.gte = start;
            }
            if (end) {
                reportingYear.lte = end;
                startDate.lte = end;
                endDate.lte = end;
            }

            dateOr.push({ reportingYear });
            dateOr.push({ startDate });
            dateOr.push({ endDate });
        }

        if (dateOr.length > 0) {
            where.AND = [{ OR: dateOr }];
        }
    }

    if (filters.year) {
        const range = buildDateRangeForYear(filters.year);
        if (range) {
            where.reportingYear = {
                gte: range.start,
                lte: range.end,
            };
        }
    }

    return where;
}

function buildComponentMap(components = []) {
    return components.reduce((acc, component) => {
        acc[component.activityType] = component;
        return acc;
    }, {});
}

function mapActivityRow(config, componentMap) {
    const component = componentMap[config.activityType] || {};

    const generalM = toNumber(component.generalM);
    const generalF = toNumber(component.generalF);
    const obcM = toNumber(component.obcM);
    const obcF = toNumber(component.obcF);
    const scM = toNumber(component.scM);
    const scF = toNumber(component.scF);
    const stM = toNumber(component.stM);
    const stF = toNumber(component.stF);

    const generalT = generalM + generalF;
    const obcT = obcM + obcF;
    const scT = scM + scF;
    const stT = stM + stF;
    const grandTotalM = generalM + obcM + scM + stM;
    const grandTotalF = generalF + obcF + scF + stF;
    const grandTotalT = grandTotalM + grandTotalF;

    const quantity = component.quantity !== undefined && component.quantity !== null ? Number(component.quantity) : null;
    const specification = component.specification || null;
    const unit = component.unit || config.unitFallback;
    const quantityOrSpecification = specification || (quantity !== null ? quantity : null);

    return {
        activityType: config.activityType,
        group: config.group,
        itemLabel: config.itemLabel,
        unit,
        quantity,
        specification,
        quantityOrSpecification,
        generalM,
        generalF,
        generalT,
        obcM,
        obcF,
        obcT,
        scM,
        scF,
        scT,
        stM,
        stF,
        stT,
        grandTotalM,
        grandTotalF,
        grandTotalT,
    };
}

function mapRecord(record) {
    const mapped = {
        drmrActivityId: record.drmrActivityId,
        kvkId: record.kvkId,
        kvkName: record.kvk?.kvkName || '',
        stateName: record.kvk?.state?.stateName || '',
        districtName: record.kvk?.district?.districtName || '',
        reportingYear: record.reportingYear || null,
        startDate: record.startDate || null,
        endDate: record.endDate || null,
        totalBudgetUtilized: toNumber(record.totalBudgetUtilized),
    };

    const componentMap = buildComponentMap(record.components || []);
    const activityRows = DRMR_ACTIVITY_ROWS.map(config => mapActivityRow(config, componentMap));
    mapped.activities = activityRows;

    // Flat aliases keep compatibility with module export payload and form field names.
    DRMR_ACTIVITY_ROWS.forEach(config => {
        const row = activityRows.find(item => item.activityType === config.activityType);
        const quantityValue = row ? (row.quantity !== null ? row.quantity : '') : '';
        const specificationValue = row?.specification || '';
        mapped[`${config.quantityKey || config.specificationKey}`] = config.specificationKey ? specificationValue : quantityValue;
        mapped[`${config.quantityKey || config.specificationKey}_unit`] = row?.unit || config.unitFallback;

        const demographics = {
            general_m: row?.generalM ?? 0,
            general_f: row?.generalF ?? 0,
            obc_m: row?.obcM ?? 0,
            obc_f: row?.obcF ?? 0,
            sc_m: row?.scM ?? 0,
            sc_f: row?.scF ?? 0,
            st_m: row?.stM ?? 0,
            st_f: row?.stF ?? 0,
        };
        Object.entries(demographics).forEach(([suffix, value]) => {
            mapped[`${config.prefix}${suffix}`] = value;
        });
    });

    // Normalized summary values that frontend grid already expects.
    mapped.trainingProgram = pickFirstValue(mapped, ['training_count']) ?? '';
    mapped.frontlineDemonstration = pickFirstValue(mapped, ['fld_count']) ?? '';
    mapped.awarenessCamps = pickFirstValue(mapped, ['awareness_count']) ?? '';
    mapped.distributionOfLiterature = pickFirstValue(mapped, ['lecture_count']) ?? '';
    mapped.kisanMela = pickFirstValue(mapped, ['kisan_mela_count']) ?? '';

    return mapped;
}

async function getDrmrActivityData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.drmrActivity.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
            components: true,
        },
        orderBy: [{ reportingYear: 'asc' }, { drmrActivityId: 'asc' }],
    });

    return rows.map(mapRecord);
}

module.exports = {
    getDrmrActivityData,
    DRMR_ACTIVITY_ROWS,
};
