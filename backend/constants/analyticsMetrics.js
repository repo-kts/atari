/**
 * Registry driving /api/admin/dashboard/analytics.
 *
 * Everything here is trusted SQL identifier text — it is interpolated raw into
 * the generated statement. Nothing from the request may ever reach these
 * fields; the request only selects *which* entry to use, by exact key match.
 *
 * Column names are inconsistent by design (the Prisma schema maps some fields
 * and leaves others camelCase), so each one is spelled out rather than derived.
 */

/** Fiscal year runs 1 Apr .. 31 Mar, matching utils/dashboardScope.js. */
const FISCAL_START_MONTH = 3; // 0-indexed March => April

/**
 * Geography dimensions. `kvkFk` is the column on "kvk" pointing at the
 * dimension's primary key. Grouping by "kvk" self-joins, which is free at 65
 * rows and keeps one code path.
 */
const GEO_DIMENSIONS = {
    zone: { table: 'zone', idCol: 'zone_id', nameCol: 'zone_name', kvkFk: 'zoneId' },
    state: { table: 'stateMaster', idCol: 'state_id', nameCol: 'state_name', kvkFk: 'stateId' },
    district: { table: 'districtMaster', idCol: 'district_id', nameCol: 'district_name', kvkFk: 'districtId' },
    // Surfaced as "Institute" in the UI; the schema calls it orgMaster.
    org: { table: 'orgMaster', idCol: 'org_id', nameCol: 'org_name', kvkFk: 'org_id' },
    kvk: { table: 'kvk', idCol: 'kvk_id', nameCol: 'kvk_name', kvkFk: 'kvk_id' },
};

/** Scope filters accepted on the query string -> column on "kvk". */
const KVK_FILTERS = {
    zoneId: 'zoneId',
    stateId: 'stateId',
    districtId: 'districtId',
    orgId: 'org_id',
    kvkId: 'kvk_id',
};

/** SUM over a set of integer columns, never NULL. */
function sumCols(cols) {
    return `COALESCE(SUM(${cols.map((c) => `m."${c}"`).join(' + ')}), 0)::int`;
}

function sumCol(col) {
    return `COALESCE(SUM(m."${col}"), 0)::float`;
}

function countAll(pk) {
    return `COUNT(m."${pk}")::int`;
}

function countWhere(pk, predicate) {
    return `COUNT(m."${pk}") FILTER (WHERE ${predicate})::int`;
}

/**
 * Beneficiary columns follow one of two prefixes across the four tables.
 * Returns the standard gender/social-category measure block.
 */
function beneficiaryMeasures(prefix) {
    const col = (c, g) => `${prefix}${c}_${g}`;
    const cats = ['general', 'obc', 'sc', 'st'];
    return {
        male: sumCols(cats.map((c) => col(c, 'm'))),
        female: sumCols(cats.map((c) => col(c, 'f'))),
        general: sumCols([col('general', 'm'), col('general', 'f')]),
        obc: sumCols([col('obc', 'm'), col('obc', 'f')]),
        sc: sumCols([col('sc', 'm'), col('sc', 'f')]),
        st: sumCols([col('st', 'm'), col('st', 'f')]),
        beneficiaries: sumCols(cats.flatMap((c) => [col(c, 'm'), col(c, 'f')])),
    };
}

/** Breakdown = a named set of measure keys the chart can stack. */
const GENDER_BREAKDOWN = { key: 'gender', label: 'Gender', keys: ['male', 'female'] };
const SOCIAL_BREAKDOWN = {
    key: 'social',
    label: 'Social category',
    keys: ['general', 'obc', 'sc', 'st'],
};
const STATUS_BREAKDOWN = {
    key: 'status',
    label: 'Status',
    keys: ['ongoing', 'completed', 'notStarted'],
};

/**
 * `dateWindow(startParam, endParam)` returns the SQL predicate restricting the
 * metric to one fiscal year. OFT/FLD prefer the completion date and fall back
 * to the start date, exactly as the existing dashboard counts them — changing
 * this would silently move records between years.
 */
const METRICS = {
    oft: {
        label: 'OFT',
        table: 'kvk_oft',
        pk: 'kvk_oft_id',
        kvkFk: 'kvkId',
        // Transfer-to-next-year clones the row; the stale source would
        // double-count the same trial.
        basePredicate: `m."ongoing_completed" <> 'TRANSFERRED_TO_NEXT_YEAR'`,
        dateWindow: (s, e) =>
            `((m."expected_completion_date" >= ${s} AND m."expected_completion_date" < ${e})` +
            ` OR (m."expected_completion_date" IS NULL AND m."oft_start_date" >= ${s} AND m."oft_start_date" < ${e}))`,
        measures: {
            records: countAll('kvk_oft_id'),
            ongoing: countWhere('kvk_oft_id', `m."ongoing_completed" = 'ONGOING'`),
            completed: countWhere('kvk_oft_id', `m."ongoing_completed" = 'COMPLETED'`),
            ...beneficiaryMeasures('farmers_'),
            locations: sumCol('number_of_location'),
            replications: sumCol('number_of_trial_replication'),
            cost: sumCol('cost_of_oft'),
            quantity: sumCol('quantity'),
        },
        measureMeta: [
            { key: 'records', label: 'Trials', unit: 'trials', isDefault: true },
            { key: 'beneficiaries', label: 'Farmers covered', unit: 'farmers' },
            { key: 'locations', label: 'Locations', unit: 'locations' },
            { key: 'replications', label: 'Replications', unit: 'replications' },
            { key: 'cost', label: 'Cost of OFT', unit: '₹' },
            { key: 'quantity', label: 'Quantity', unit: '' },
        ],
        breakdowns: [STATUS_BREAKDOWN, GENDER_BREAKDOWN, SOCIAL_BREAKDOWN],
        dimensions: {
            thematicArea: {
                table: 'oft_thematic_area',
                idCol: 'oft_thematic_area_id',
                nameCol: 'oft_thematic_area_name',
                metricFk: 'oftThematicAreaId',
                label: 'Thematic area',
            },
            subject: {
                table: 'oft_subject',
                idCol: 'oft_subject_id',
                nameCol: 'oft_subject_name',
                metricFk: 'oftSubjectId',
                label: 'Subject',
            },
            discipline: {
                table: 'discipline',
                idCol: 'discipline_id',
                nameCol: 'discipline_name',
                metricFk: 'disciplineId',
                label: 'Discipline',
            },
            season: {
                table: 'season',
                idCol: 'season_id',
                nameCol: 'season_name',
                metricFk: 'seasonId',
                label: 'Season',
            },
            funding: {
                table: 'funding_source_master',
                idCol: 'funding_source_id',
                nameCol: 'name',
                metricFk: 'source_of_funding_id',
                label: 'Source of funding',
            },
        },
    },

    fld: {
        label: 'FLD',
        table: 'kvk_fld_introduction',
        pk: 'kvk_fld_id',
        kvkFk: 'kvkId',
        basePredicate: `m."ongoing_completed" <> 'TRANSFERRED_TO_NEXT_YEAR'`,
        dateWindow: (s, e) =>
            `((m."expected_completion_date" >= ${s} AND m."expected_completion_date" < ${e})` +
            ` OR (m."expected_completion_date" IS NULL AND m."start_date" >= ${s} AND m."start_date" < ${e}))`,
        measures: {
            records: countAll('kvk_fld_id'),
            ongoing: countWhere('kvk_fld_id', `m."ongoing_completed" = 'ONGOING'`),
            completed: countWhere('kvk_fld_id', `m."ongoing_completed" = 'COMPLETED'`),
            ...beneficiaryMeasures(''),
            demonstrations: sumCol('no_of_demonstration'),
            quantity: sumCol('quantity'),
        },
        measureMeta: [
            { key: 'records', label: 'FLDs', unit: 'FLDs', isDefault: true },
            { key: 'demonstrations', label: 'Demonstrations', unit: 'demos' },
            { key: 'beneficiaries', label: 'Farmers covered', unit: 'farmers' },
            { key: 'quantity', label: 'Quantity', unit: '' },
        ],
        breakdowns: [STATUS_BREAKDOWN, GENDER_BREAKDOWN, SOCIAL_BREAKDOWN],
        dimensions: {
            sector: {
                table: 'sector',
                idCol: 'sector_id',
                nameCol: 'sector_name',
                metricFk: 'sectorId',
                label: 'Sector',
            },
            thematicArea: {
                table: 'thematic_area',
                idCol: 'thematic_area_id',
                nameCol: 'thematic_area_name',
                metricFk: 'thematicAreaId',
                label: 'Thematic area',
            },
            category: {
                table: 'category',
                idCol: 'category_id',
                nameCol: 'category_name',
                metricFk: 'categoryId',
                label: 'Category',
            },
            crop: {
                table: 'crop',
                idCol: 'crop_id',
                nameCol: 'crop_name',
                metricFk: 'cropId',
                label: 'Crop',
            },
            season: {
                table: 'season',
                idCol: 'season_id',
                nameCol: 'season_name',
                metricFk: 'seasonId',
                label: 'Season',
            },
        },
    },

    training: {
        label: 'Training',
        table: 'training_achievement',
        pk: 'training_achievement_id',
        kvkFk: 'kvkId',
        basePredicate: null,
        dateWindow: (s, e) => `(m."start_date" >= ${s} AND m."start_date" < ${e})`,
        // No status column: a course is "completed" once its end date passed.
        // Mirrors the existing dashboard's endDate < now() grouping.
        measures: {
            records: countAll('training_achievement_id'),
            completed: countWhere('training_achievement_id', `m."end_date" < NOW()`),
            ongoing: countWhere('training_achievement_id', `m."end_date" >= NOW()`),
            ...beneficiaryMeasures(''),
            onCampus: countWhere('training_achievement_id', `m."campus_type" = 'ON_CAMPUS'`),
            offCampus: countWhere('training_achievement_id', `m."campus_type" = 'OFF_CAMPUS'`),
        },
        measureMeta: [
            { key: 'records', label: 'Courses', unit: 'courses', isDefault: true },
            { key: 'beneficiaries', label: 'Participants', unit: 'participants' },
        ],
        breakdowns: [
            STATUS_BREAKDOWN,
            GENDER_BREAKDOWN,
            SOCIAL_BREAKDOWN,
            { key: 'campus', label: 'Campus', keys: ['onCampus', 'offCampus'] },
        ],
        dimensions: {
            trainingType: {
                table: 'training_type',
                idCol: 'training_type_id',
                nameCol: 'training_type_name',
                metricFk: 'trainingTypeId',
                label: 'Training type',
            },
            trainingArea: {
                table: 'training_area',
                idCol: 'training_area_id',
                nameCol: 'training_area_name',
                metricFk: 'trainingAreaId',
                label: 'Training area',
            },
            thematicArea: {
                table: 'training_thematic_area',
                idCol: 'training_thematic_area_id',
                nameCol: 'training_thematic_area_name',
                metricFk: 'thematicAreaId',
                label: 'Thematic area',
            },
            clientele: {
                table: 'clientele_master',
                idCol: 'clientele_id',
                nameCol: 'name',
                metricFk: 'clienteleId',
                label: 'Clientele',
            },
            funding: {
                table: 'funding_source_master',
                idCol: 'funding_source_id',
                nameCol: 'name',
                metricFk: 'fundingSourceId',
                label: 'Source of funding',
            },
            campusType: {
                enumCol: 'campus_type',
                label: 'Campus type',
            },
        },
    },

    extension: {
        label: 'Extension activity',
        table: 'kvk_extension_activity',
        pk: 'kvk_extension_activity_id',
        kvkFk: 'kvkId',
        basePredicate: null,
        dateWindow: (s, e) => `(m."start_date" >= ${s} AND m."start_date" < ${e})`,
        measures: {
            records: countAll('kvk_extension_activity_id'),
            completed: countWhere('kvk_extension_activity_id', `m."end_date" < NOW()`),
            ongoing: countWhere('kvk_extension_activity_id', `m."end_date" >= NOW()`),
            ...beneficiaryMeasures('farmers_'),
            activities: sumCol('number_of_activities'),
            officials: sumCols([
                'officials_general_m',
                'officials_general_f',
                'officials_obc_m',
                'officials_obc_f',
                'officials_sc_m',
                'officials_sc_f',
                'officials_st_m',
                'officials_st_f',
            ]),
            officialsMale: sumCols([
                'officials_general_m',
                'officials_obc_m',
                'officials_sc_m',
                'officials_st_m',
            ]),
            officialsFemale: sumCols([
                'officials_general_f',
                'officials_obc_f',
                'officials_sc_f',
                'officials_st_f',
            ]),
        },
        measureMeta: [
            { key: 'records', label: 'Entries', unit: 'entries', isDefault: true },
            { key: 'activities', label: 'Activities held', unit: 'activities' },
            { key: 'beneficiaries', label: 'Farmers reached', unit: 'farmers' },
            { key: 'officials', label: 'Officials reached', unit: 'officials' },
        ],
        breakdowns: [
            STATUS_BREAKDOWN,
            GENDER_BREAKDOWN,
            SOCIAL_BREAKDOWN,
            { key: 'audience', label: 'Audience', keys: ['beneficiaries', 'officials'] },
        ],
        dimensions: {
            activity: {
                table: 'fld_activity',
                idCol: 'activity_id',
                nameCol: 'activity_name',
                metricFk: 'activityId',
                label: 'Activity',
            },
        },
    },
};

/** Every measure key a metric can return, for validating ?measure=. */
function measureKeys(metric) {
    return Object.keys(METRICS[metric].measures);
}

/** Every valid ?groupBy= value for a metric: geography + its own dimensions. */
function groupByKeys(metric) {
    return [...Object.keys(GEO_DIMENSIONS), ...Object.keys(METRICS[metric].dimensions)];
}

module.exports = {
    FISCAL_START_MONTH,
    GEO_DIMENSIONS,
    KVK_FILTERS,
    METRICS,
    measureKeys,
    groupByKeys,
};
