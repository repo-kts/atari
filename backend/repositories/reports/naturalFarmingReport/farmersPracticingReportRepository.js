const prisma = require('../../../config/prisma.js');
const { formatReportingYear } = require('../../../utils/reportingYearUtils.js');

const FARMERS_PRACTICING_ACTIVITY_LABEL = 'Farmers already practicing Natural Farming';

function applyFarmersPracticingFilters(where, filters = {}) {
    if (filters.year && !filters.startDate && !filters.endDate) {
        const y = Number(filters.year);
        if (Number.isFinite(y)) {
            where.reportingYear = {
                gte: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
                lte: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
            };
        }
    } else if (filters.startDate || filters.endDate) {
        const g = {};
        if (filters.startDate) {
            const d = new Date(filters.startDate);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(0, 0, 0, 0);
                g.gte = d;
            }
        }
        if (filters.endDate) {
            const d = new Date(filters.endDate);
            if (!Number.isNaN(d.getTime())) {
                d.setHours(23, 59, 59, 999);
                g.lte = d;
            }
        }
        if (Object.keys(g).length > 0) {
            where.reportingYear = g;
        }
    }
}

function formatKvkFarmerLabel(r) {
    const kvk = r.kvk?.kvkName || '';
    const farmer = r.farmerName || '';
    const village = r.villageName || '';
    const parts = [];
    if (kvk) parts.push(kvk);
    if (farmer || village) {
        parts.push([farmer, village].filter(Boolean).join(', '));
    }
    return parts.join(' — ') || farmer || kvk || '—';
}

function formatAddressContact(address, contact) {
    const a = (address || '').trim();
    const c = (contact || '').trim();
    if (a && c) return `${a} | Contact: ${c}`;
    return a || c || '—';
}

/**
 * Map DB row to the same report shape as demonstration rows (for shared NF template / export).
 */
function mapFarmersPracticingRecord(r) {
    return {
        farmersPracticingId: r.farmersPracticingId,
        demonstrationInfoId: r.farmersPracticingId,
        reportingYear: formatReportingYear(r.reportingYear),
        startDate: '',
        endDate: '',
        stateName: r.kvk?.state?.stateName || '',
        districtName: r.kvk?.district?.districtName || '',
        kvkName: r.kvk?.kvkName || '',
        farmerName: r.farmerName || '',
        villageName: r.villageName || '',
        kvkFarmerLabel: formatKvkFarmerLabel(r),
        addressWithContact: formatAddressContact(r.address, r.contactNumber),
        farmingSituation: '',
        agroClimaticZone: '',
        croppingPattern: r.normalCropsGrown != null ? String(r.normalCropsGrown) : '',
        latitude: null,
        longitude: null,
        activityName: FARMERS_PRACTICING_ACTIVITY_LABEL,
        crop: r.cropGrownUnderNaturalFarming || '',
        variety: '',
        seasonName: '',
        naturalFarmingTechnology: r.naturalFarmingTechnologyPracticingAdopted || '',
        areaInHa: r.areaCoveredUnderNaturalFarming,
        farmerPracticeDetails: r.practicingYearsOfNaturalFarming || '',
        staffCategoryName: '',

        plantHeightWithout: r.plantHeightWithout,
        plantHeightWith: r.plantHeightWith,
        otherRelevantParameterWithout: r.otherRelevantParameterWithout,
        otherRelevantParameterWith: r.otherRelevantParameterWith,
        yieldWithout: r.yieldWithout,
        yieldWith: r.yieldWith,
        costWithout: r.costWithout,
        costWith: r.costWith,
        grossReturnWithout: r.grossReturnWithout,
        grossReturnWith: r.grossReturnWith,
        netReturnWithout: r.netReturnWithout,
        netReturnWith: r.netReturnWith,
        bcRatioWithout: r.bcRatioWithout,
        bcRatioWith: r.bcRatioWith,
        soilPhWithout: r.soilPhWithout,
        soilPhWith: r.soilPhWith,
        soilOcWithout: r.soilOcWithout,
        soilOcWith: r.soilOcWith,
        soilEcWithout: r.soilEcWithout,
        soilEcWith: r.soilEcWith,
        availableNWithout: r.availableNWithout,
        availableNWith: r.availableNWith,
        availablePWithout: r.availablePWithout,
        availablePWith: r.availablePWith,
        availableKWithout: r.availableKWithout,
        availableKWith: r.availableKWith,
        soilMicrobesWithout: r.soilMicrobesWithout,
        soilMicrobesWith: r.soilMicrobesWith,
        anyOtherWithout: r.anyOtherWithout,
        anyOtherWith: r.anyOtherWith,
        farmerFeedback: r.farmerFeedback || '',
    };
}

async function getNaturalFarmingFarmersPracticingData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) {
        where.kvkId = kvkId;
    }
    applyFarmersPracticingFilters(where, filters);

    const rows = await prisma.farmersPracticingNaturalFarming.findMany({
        where,
        include: {
            kvk: {
                include: {
                    state: true,
                    district: true,
                },
            },
        },
        orderBy: [{ reportingYear: 'desc' }, { farmersPracticingId: 'desc' }],
    });

    return rows.map(mapFarmersPracticingRecord);
}

/**
 * Normalize form/API row to the same canonical keys as mapFarmersPracticingRecord.
 */
function normalizeFarmersPracticingExportRow(r) {
    if (!r) return null;
    if (r.kvkFarmerLabel && r.farmersPracticingId != null && r.naturalFarmingTechnology !== undefined) {
        const out = { ...r };
        if (!out.activityName) out.activityName = FARMERS_PRACTICING_ACTIVITY_LABEL;
        return out;
    }

    const kvkName = r.kvkName ?? r.kvk?.kvkName ?? '';
    const farmerName = r.farmerName ?? '';
    const villageName = r.villageName ?? '';
    const kvkFarmerLabel = [kvkName, [farmerName, villageName].filter(Boolean).join(', ')].filter(Boolean).join(' — ') || farmerName || kvkName || '—';

    const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');

    const pick = (direct, ...alts) => {
        for (const k of [direct, ...alts]) {
            if (k === undefined || k === null) continue;
            const v = r[k];
            if (!isEmpty(v)) return v;
        }
        return null;
    };

    return {
        farmersPracticingId: r.farmersPracticingId ?? r.id,
        demonstrationInfoId: r.farmersPracticingId ?? r.id,
        reportingYear: r.reportingYear ?? '',
        startDate: '',
        endDate: '',
        stateName: r.stateName ?? r.state?.stateName ?? '',
        districtName: r.districtName ?? r.district?.districtName ?? '',
        kvkName,
        farmerName,
        villageName,
        kvkFarmerLabel,
        addressWithContact: formatAddressContact(r.address, r.contactNumber ?? r.contact),
        farmingSituation: '',
        agroClimaticZone: '',
        croppingPattern: (() => {
            const v = pick('croppingPattern', 'normalCropsGrown');
            return v != null && v !== '' ? String(v) : '';
        })(),
        latitude: null,
        longitude: null,
        activityName: FARMERS_PRACTICING_ACTIVITY_LABEL,
        crop: pick('crop', 'cropGrownUnderNaturalFarming') ?? '',
        variety: '',
        seasonName: '',
        naturalFarmingTechnology: pick('naturalFarmingTechnology', 'naturalFarmingTechnologyPracticingAdopted') ?? '',
        areaInHa: pick('areaInHa', 'area', 'areaCoveredUnderNaturalFarming') ?? null,
        farmerPracticeDetails: pick('farmerPracticeDetails', 'practicingYearsOfNaturalFarming', 'practicingYearOfNaturalFarming') ?? '',
        staffCategoryName: '',

        plantHeightWithout: pick('plantHeightWithout', 'without_plantHeight', 'without_plantWeight', 'without_practicing_plantHeight', 'without_practicing_plantWeight'),
        plantHeightWith: pick('plantHeightWith', 'with_plantHeight', 'with_plantWeight', 'with_practicing_plantHeight', 'with_practicing_plantWeight'),
        otherRelevantParameterWithout: pick('otherRelevantParameterWithout', 'without_otherParameter', 'without_practicing_otherParameter'),
        otherRelevantParameterWith: pick('otherRelevantParameterWith', 'with_otherParameter', 'with_practicing_otherParameter'),
        yieldWithout: pick('yieldWithout', 'without_yield', 'without_practicing_yield'),
        yieldWith: pick('yieldWith', 'with_yield', 'with_practicing_yield'),
        costWithout: pick('costWithout', 'without_costOfCultivation', 'without_practicing_costOfCultivation'),
        costWith: pick('costWith', 'with_costOfCultivation', 'with_practicing_costOfCultivation'),
        grossReturnWithout: pick('grossReturnWithout', 'without_grossReturn', 'without_practicing_grossReturn'),
        grossReturnWith: pick('grossReturnWith', 'with_grossReturn', 'with_practicing_grossReturn'),
        netReturnWithout: pick('netReturnWithout', 'without_netReturn', 'without_practicing_netReturn'),
        netReturnWith: pick('netReturnWith', 'with_netReturn', 'with_practicing_netReturn'),
        bcRatioWithout: pick('bcRatioWithout', 'without_bcrRatio', 'without_practicing_bcrRatio', 'without_practicing_bcRatio'),
        bcRatioWith: pick('bcRatioWith', 'with_bcrRatio', 'with_practicing_bcrRatio', 'with_practicing_bcRatio'),
        soilPhWithout: pick('soilPhWithout', 'without_soilPh', 'without_practicing_soilPh'),
        soilPhWith: pick('soilPhWith', 'with_soilPh', 'with_practicing_soilPh'),
        soilOcWithout: pick('soilOcWithout', 'without_soilOc', 'without_practicing_soilOc'),
        soilOcWith: pick('soilOcWith', 'with_soilOc', 'with_practicing_soilOc'),
        soilEcWithout: pick('soilEcWithout', 'without_soilEc', 'without_solubleSalt', 'without_practicing_soilEc', 'without_practicing_solubleSalt'),
        soilEcWith: pick('soilEcWith', 'with_soilEc', 'with_solubleSalt', 'with_practicing_soilEc', 'with_practicing_solubleSalt'),
        availableNWithout: pick('availableNWithout', 'without_availableN', 'without_practicing_availableN'),
        availableNWith: pick('availableNWith', 'with_availableN', 'with_practicing_availableN'),
        availablePWithout: pick('availablePWithout', 'without_availableP', 'without_practicing_availableP'),
        availablePWith: pick('availablePWith', 'with_availableP', 'with_practicing_availableP'),
        availableKWithout: pick('availableKWithout', 'without_availableK', 'without_practicing_availableK'),
        availableKWith: pick('availableKWith', 'with_availableK', 'with_practicing_availableK'),
        soilMicrobesWithout: pick('soilMicrobesWithout', 'without_soilMicrobes', 'without_soilMicrobial', 'without_practicing_soilMicrobes', 'without_practicing_soilMicrobial'),
        soilMicrobesWith: pick('soilMicrobesWith', 'with_soilMicrobes', 'with_soilMicrobial', 'with_practicing_soilMicrobes', 'with_practicing_soilMicrobial'),
        anyOtherWithout: pick('anyOtherWithout', 'without_anyOtherSpecific', 'without_practicing_anyOtherSpecific', 'without_practicing_populationDensity'),
        anyOtherWith: pick('anyOtherWith', 'with_anyOtherSpecific', 'with_practicing_anyOtherSpecific', 'with_practicing_populationDensity'),
        farmerFeedback: pick('farmerFeedback', 'farmersFeedback') ?? '',
    };
}

module.exports = {
    getNaturalFarmingFarmersPracticingData,
    mapFarmersPracticingRecord,
    applyFarmersPracticingFilters,
    normalizeFarmersPracticingExportRow,
    FARMERS_PRACTICING_ACTIVITY_LABEL,
};
