const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: TSP / SCSP Sub-Plan Activity — Achievements / Projects. Source:
 * atariams.org `project/sub-plan-activity` (`tsp_scsp` table). Writes tsp_scsp.
 *
 * Single flat table on both sides. The old row carries the activity as a nested
 * subplan_activity {id,name}; we resolve by NAME against TspScspActivities (a
 * miss maps to the "Other activities" master row and parks the text in
 * activity_other). The TSP/SCSP kind lives both as the `type` enum AND a
 * TspScspTypeMaster FK, both derived from old `type` ("TSP"/"SCSP").
 *
 * The old district_id comes from the OLD db's district table whose ids DO NOT
 * line up with ours (old 28 = our "Madhepura", but the KVK is Rohtas) and the
 * old row carries no district name, so districtId is left null (+warn) rather
 * than mis-pointed.
 *
 * Old → new:
 *   type                          → type (enum) + tspScspTypeId (master)
 *   subplan_activity.name         → activityId (+ activityOther on miss)
 *   subplan_other_activity        → activityOther (when present)
 *   number_of_achievments         → numberOfTrainingsOrDemos
 *   number_of_beneficieries       → numberOfBeneficiaries
 *   fund_received                 → fundsReceived
 *   family_income_unit/_income    → achievementFamilyIncomeUnit / achievementFamilyIncome
 *   consumption_level_unit/_level  → achievementConsumptionLevelUnit / achievementConsumptionLevel
 *   availability_of_agricultural_unit/_  → achievementImplementsAvailabilityUnit / achievementImplementsAvailability
 *   sub_district                  → subDistrict
 *   no_of_village                 → numberOfVillagesCovered
 *   name_of_village               → villageNamesCovered
 *   male/female/total             → stMale / stFemale / stTotal
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

/** Nullable float — old units come as "%20"/"%80"; strip the % and parse. */
function floatOrNull(v) {
    if (v === null || v === undefined) return null;
    const s = String(v).replace(/%/g, '').trim();
    if (s === '') return null;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
}

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

module.exports = {
    key: 'tsp-scsp',
    label: 'TSP / SCSP Sub-Plan Activity',
    model: 'tspScsp',
    idField: 'tspScspId',
    naturalKey: ['kvkId', 'reportingYear', 'type', 'activityId'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        tspScspTypeId: { master: 'tspScspType' },
        activityId: { master: 'tspScspActivity' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const error = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // 1. KVK match — same guard as the other project modules.
        const kvkObj = asObject(row.kvk);
        const oldKvkName = decodeEntities(cleanText(kvkObj?.kvk_name || row['kvk.kvk_name'])) || '';
        if (!oldKvkName) {
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // 2. Reporting year ← old fiscal int/string → Jan 1 of that year.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Type — enum (REQUIRED) + master FK, both from old `type`.
        const typeRaw = String(row.type ?? '').trim().toUpperCase();
        let type = null;
        if (typeRaw === 'TSP' || typeRaw === 'SCSP') type = typeRaw;
        else error('type', `Unknown type "${row.type}" — expected TSP/SCSP`);
        let tspScspTypeId = null;
        if (type) {
            const hit = await r.resolve('tspScspTypeMaster', 'typeName', 'tspScspTypeId', type);
            if (hit.matched) tspScspTypeId = hit.id;
            else warn('tspScspTypeId', `Type "${type}" not in type master — left null`);
        }

        // 4. Activity ← subplan_activity.name; miss → "Other activities" + activityOther.
        const actObj = asObject(row.subplan_activity);
        const actName = decodeEntities(cleanText(actObj?.name || row['subplan_activity.name'])) || '';
        const otherObj = asObject(row.subplan_other_activity);
        const otherName = decodeEntities(cleanText(otherObj?.name || row.subplan_other_activity)) || '';
        let activityId = null;
        let activityOther = otherName || null;
        if (actName) {
            const hit = await r.resolve('tspScspActivities', 'activityName', 'tspScspActivityId', actName);
            if (hit.matched) {
                activityId = hit.id;
            } else {
                const fallback = await r.resolve('tspScspActivities', 'activityName', 'tspScspActivityId', 'Other activities');
                activityId = fallback.matched ? fallback.id : null;
                activityOther = activityOther || actName;
                warn('activityId', `Activity "${actName}" not in master — mapped to "Other activities" with activity_other`);
            }
        } else {
            warn('activityId', 'No activity on old row — left null');
        }

        const data = {
            kvkId,
            reportingYear,
            type,
            tspScspTypeId,
            activityId,
            activityOther,
            numberOfTrainingsOrDemos: intOrZero(row.number_of_achievments),
            numberOfBeneficiaries: intOrZero(row.number_of_beneficieries),
            fundsReceived: floatOrNull(row.fund_received),
            achievementFamilyIncomeUnit: floatOrNull(row.family_income_unit),
            achievementConsumptionLevelUnit: floatOrNull(row.consumption_level_unit),
            achievementImplementsAvailabilityUnit: floatOrNull(row.availability_of_agricultural_unit),
            achievementFamilyIncome: floatOrNull(row.family_income),
            achievementConsumptionLevel: floatOrNull(row.consumption_level),
            achievementImplementsAvailability: floatOrNull(row.availability_of_agricultural),
            // Old district_id is from the old db and doesn't align with ours → null.
            districtId: null,
            subDistrict: decodeEntities(cleanText(row.sub_district)),
            numberOfVillagesCovered: row.no_of_village != null ? intOrZero(row.no_of_village) : null,
            villageNamesCovered: decodeEntities(cleanText(row.name_of_village)),
            stMale: row.male != null ? intOrZero(row.male) : null,
            stFemale: row.female != null ? intOrZero(row.female) : null,
            stTotal: row.total != null ? intOrZero(row.total) : null,
        };
        if (row.district_id != null) {
            warn('districtId', `Old district_id ${row.district_id} not mappable to our districts — left null`);
        }

        return { data, issues };
    },
};
