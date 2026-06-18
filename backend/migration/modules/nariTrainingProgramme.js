const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: NARI — Training Programmes in Nutri-Smart Village.
 * Source: atariams.org `project/nari/training-programm/view`
 * (`nari_training_programmes` table). Writes nari_training_programme.
 *
 * Every field lives on the DataTables list row (nested kvk + flat
 * activity/area/title/days/courses/venue/demographics) — no per-row edit fetch.
 *
 * activity → NariActivity.activityName (find-or-create, @unique). campusType is
 * a REQUIRED CampusType enum (ON_CAMPUS|OFF_CAMPUS); the old `campus_type` is
 * frequently null, so it defaults to ON_CAMPUS with a warning. `venue` is a
 * REQUIRED String, defaults to '' when null. Old `*_t` / total columns dropped.
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

/** Old campus_type ("On Campus"/"Off Campus"/1/2/null) → CampusType enum. */
function toCampusType(value) {
    const s = normalize(value);
    if (!s) return null;
    if (s.includes('off') || s === '2') return 'OFF_CAMPUS';
    if (s.includes('on') || s === '1') return 'ON_CAMPUS';
    return null;
}

module.exports = {
    key: 'nari-training-programme',
    label: 'NARI Training Programme (Nutri-Smart village)',
    model: 'nariTrainingProgramme',
    idField: 'nariTrainingProgrammeId',
    naturalKey: ['kvkId', 'reportingYear', 'nameOfNutriSmartVillage', 'titleOfTraining'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'nariActivity', otherField: 'activityOther' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const error = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

        // 1. KVK match — same guard as the other modules.
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

        // 2. Reporting year ← old fiscal int → Jan 1 of that year (UTC).
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Activity ← activity string → NariActivity master (find-or-create).
        let activityId = null;
        const activityName = decodeEntities(cleanText(asObject(row.activity)?.activity_name || row.activity)) || '';
        if (activityName) {
            const a = await r.findOrCreate('nariActivity', 'activityName', 'nariActivityId', activityName);
            activityId = a.id;
            if (a.created) warn('activityId', `Activity "${activityName}" not in master — created`);
        } else {
            error('activityId', 'No activity on old row — required');
        }

        // 4. Campus type (REQUIRED enum). Old value often null → default ON_CAMPUS.
        let campusType = toCampusType(row.campus_type);
        if (!campusType) {
            campusType = 'ON_CAMPUS';
            warn('campusType', 'No campus_type on old row — defaulted to ON_CAMPUS');
        }

        // 5. Required strings.
        const nameOfNutriSmartVillage = decodeEntities(cleanText(row.village_name)) || '';
        if (!nameOfNutriSmartVillage) warn('nameOfNutriSmartVillage', 'No village_name on old row');
        const areaOfTraining = decodeEntities(cleanText(row.area)) || '';
        const titleOfTraining = decodeEntities(cleanText(row.training_tiltle)) || '';
        if (!titleOfTraining) warn('titleOfTraining', 'No training_tiltle on old row');
        let venue = decodeEntities(cleanText(row.venue)) || '';
        if (!venue) warn('venue', 'No venue on old row — left blank');

        const data = {
            kvkId,
            reportingYear,
            activityId,
            campusType,
            nameOfNutriSmartVillage,
            areaOfTraining,
            titleOfTraining,
            noOfDays: intOrZero(row.no_of_days),
            noOfCourses: intOrZero(row.no_of_courses),
            venue,
            // Demographics — *_t / total dropped (UI recomputes).
            generalM: intOrZero(row.general_m),
            generalF: intOrZero(row.general_f),
            obcM: intOrZero(row.obc_m),
            obcF: intOrZero(row.obc_f),
            scM: intOrZero(row.sc_m),
            scF: intOrZero(row.sc_f),
            stM: intOrZero(row.st_m),
            stF: intOrZero(row.st_f),
        };

        return { data, issues };
    },
};
