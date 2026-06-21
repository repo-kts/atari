const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: Agri Drone — Demonstration Details. Source: atariams.org
 * `project/demonstration-details` (`kvk_agri_drone_demonstration` table).
 *
 * Each detail links to a PARENT Agri Drone (kvk_agri_drone) that must already be
 * migrated — agriDroneId is resolved from OUR db by kvkId + pilotName
 * (agri_drone.pic_name). Run the Agri Drone module first.
 *
 * Old → new:
 *   agri_drone.kvk.kvk_name → kvkId (match against selected KVK)
 *   agri_drone.pic_name     → agriDroneId (parent lookup by kvkId+pilotName)
 *   district.district_name  → districtId (DistrictMaster, nullable)
 *   date                    → dateOfDemonstration
 *   place                   → placeOfDemonstration
 *   crop_name               → cropName
 *   no_of_demo              → noOfDemos
 *   area                    → areaHa
 *   total                   → noOfFarmers
 *   reporting_year ("2024") → reportingYear (Jan 1 UTC, nullable)
 *
 * Gender breakdown + demonstrations_on are not on the old list — left null.
 */

function floatOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : null;
}

function intOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseInt(String(v).trim(), 10);
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
    key: 'agri-drone-demonstration',
    label: 'Agri Drone — Demonstration Details',
    model: 'kvkAgriDroneDemonstration',
    idField: 'agriDroneDemonstrationId',
    naturalKey: ['agriDroneId', 'reportingYear', 'dateOfDemonstration'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        agriDroneId: { master: 'agriDrone' },
        districtId: { master: 'district' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // 1. KVK match (from nested agri_drone.kvk.kvk_name).
        const agriDroneObj = asObject(row.agri_drone) || {};
        const kvkObj = asObject(agriDroneObj.kvk) || {};
        const oldKvkName =
            decodeEntities(
                cleanText(
                    kvkObj.kvk_name ||
                    row['agri_drone.kvk.kvk_name'] ||
                    '',
                ),
            ) || '';
        if (!oldKvkName) {
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }

        // 2. Resolve parent Agri Drone by kvkId + pilotName (must be migrated first).
        const pilotName = decodeEntities(
            cleanText(agriDroneObj.pic_name || row['agri_drone.pic_name'] || ''),
        ) || '';
        let agriDroneId = null;
        if (pilotName) {
            agriDroneId = await r.findId(
                'kvkAgriDrone',
                { kvkId: ctx.kvkId, pilotName },
                'agriDroneId',
            );
        }
        if (!agriDroneId) {
            err('agriDroneId', `Parent Agri Drone (pilot "${pilotName || '?'}") not found — migrate Agri Drone first`);
        }

        // 3. District → DistrictMaster (nullable).
        let districtId = null;
        const districtObj = asObject(row.district) || {};
        const districtName = decodeEntities(
            cleanText(districtObj.district_name || row['district.district_name'] || ''),
        ) || '';
        if (districtName) {
            const d = await r.resolve('districtMaster', 'districtName', 'districtId', districtName);
            if (d.matched) districtId = d.id;
            else warn('districtId', `District "${districtName}" not found in master — left null`);
        }

        // 4. reporting year ← "reporting_year" → Jan 1 (UTC), nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.reporting_year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        const dateIso = parseDate(row.date);

        const data = {
            kvkId: ctx.kvkId,
            agriDroneId,
            reportingYear,
            districtId,
            dateOfDemonstration: dateIso ? new Date(dateIso) : null,
            placeOfDemonstration: decodeEntities(cleanText(row.place)) || null,
            cropName: decodeEntities(cleanText(row.crop_name)) || null,
            noOfDemos: intOrNull(row.no_of_demo),
            areaHa: floatOrNull(row.area),
            noOfFarmers: intOrNull(row.total),
        };

        return { data, issues };
    },
};
