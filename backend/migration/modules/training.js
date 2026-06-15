const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Training Achievements. Source: atariams.org
 * `achievements-of-training`. The DataTables list row carries every field we
 * need (nested master objects, farmer counts, dates) — no per-row edit-page
 * fetch required. Coordinator is the one exception: the row holds a numeric old
 * staff id, so we pre-fetch `staff-data` to map id → name (see enrichTrainingRows).
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function normalizeCampusType(raw) {
    const s = String(raw || '').trim().toUpperCase().replace(/\s+/g, '_');
    if (s.includes('OFF')) return 'OFF_CAMPUS';
    return 'ON_CAMPUS';
}

/** Pull a nested master object off the row whether it arrived parsed or as a JSON string. */
function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

async function fetchStaffMap(headers) {
    // Fetch all staff from the old site → Map<oldStaffId, staffName>.
    try {
        const url = 'https://atariams.org/staff-data?draw=1&start=0&length=9999&search=';
        const res = await fetch(url, {
            headers: {
                ...headers,
                accept: 'application/json, text/javascript, */*; q=0.01',
                'x-requested-with': 'XMLHttpRequest',
                referer: 'https://atariams.org/view-staff',
            },
        });
        if (!res.ok) {
            console.error(`[training fetchStaffMap] HTTP ${res.status}`);
            return new Map();
        }
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch {
            console.error('[training fetchStaffMap] non-JSON response:', text.slice(0, 200));
            return new Map();
        }
        const staffRows = Array.isArray(json.data) ? json.data : [];
        console.log(`[training fetchStaffMap] fetched ${staffRows.length} staff rows`);
        const map = new Map();
        for (const s of staffRows) {
            const id = s.id ?? s.staff_id;
            const name = s.staff_name ?? s.name;
            if (id && name) map.set(Number(id), String(name).trim());
        }
        return map;
    } catch (e) {
        console.error('[training fetchStaffMap] error:', e.message);
        return new Map();
    }
}

/** Resolve the numeric coordinator/staff id on each row → name string (`_coordinatorName`). */
async function enrichTrainingRows(rows, headers) {
    const staffMap = await fetchStaffMap(headers);
    return rows.map((row) => {
        const rawId =
            row.coordinator_id ??
            row.course_coordinator_id ??
            row.staff_id ??
            row.coordinator ??
            row.staff;
        const id = Number(rawId);
        const name = Number.isFinite(id) ? (staffMap.get(id) || null) : null;
        return { ...row, _coordinatorName: name };
    });
}

module.exports = {
    key: 'training',
    label: 'Training Achievements',
    model: 'trainingAchievement',
    idField: 'trainingAchievementId',
    naturalKey: ['kvkId', 'titleOfTraining', 'startDate'],
    enrichTrainingRows,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        trainingTypeId: { master: 'trainingType' },
        trainingAreaId: { master: 'trainingArea' },
        thematicAreaId: { master: 'trainingThematicArea' },
        clienteleId: { master: 'trainingClientele' },
        fundingSourceId: { master: 'trainingFundingSource' },
        coordinatorId: { master: 'courseCoordinator' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });
        const err = (field, msg) => issues.push({ field, message: msg, severity: 'error' });

        // 1. KVK match
        const oldKvkName = decodeEntities(cleanText(row.kvk?.kvk_name || row['kvk.kvk_name'])) || '';
        if (!oldKvkName) {
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // 2. Clientele ← old `training` relation object (.name). Optional.
        let clienteleId = null;
        const trainingObj = asObject(row.training) || asObject(row.clientele);
        const clienteleName = decodeEntities(cleanText(
            trainingObj?.name || trainingObj?.clientele || row['training.name'] || '',
        ));
        if (clienteleName) {
            const c = await r.resolve('clienteleMaster', 'name', 'clienteleId', clienteleName);
            if (c.matched) clienteleId = c.id;
            else {
                const created = await r.findOrCreate('clienteleMaster', 'name', 'clienteleId', clienteleName);
                clienteleId = created.id;
                warn('clienteleId', `Created clientele "${clienteleName}"`);
            }
        }

        // 3. Training Type ← old `training_type` object (.type). Optional.
        let trainingTypeId = null;
        const typeObj = asObject(row.training_type);
        const trainingTypeName = decodeEntities(cleanText(
            typeObj?.type || typeObj?.name || row['training_type.type'] || '',
        ));
        if (trainingTypeName) {
            const t = await r.resolve('trainingType', 'trainingTypeName', 'trainingTypeId', trainingTypeName);
            if (t.matched) trainingTypeId = t.id;
            else warn('trainingTypeId', `Training type "${trainingTypeName}" not found — pick manually`);
        }

        // 4. Training Area ← old `training_area` object (.name). Optional.
        let trainingAreaId = null;
        const areaObj = asObject(row.training_area);
        const trainingAreaName = decodeEntities(cleanText(
            areaObj?.name || row['training_area.name'] || '',
        ));
        if (trainingAreaName) {
            const ta = await r.resolve('trainingArea', 'trainingAreaName', 'trainingAreaId', trainingAreaName);
            if (ta.matched) trainingAreaId = ta.id;
            else warn('trainingAreaId', `Training area "${trainingAreaName}" not found — pick manually`);
        }

        // 5. Thematic Area ← old `thematic_area` object. REQUIRED (find-or-create).
        let thematicAreaId = null;
        const themeObj = asObject(row.thematic_area);
        const thematicAreaName = decodeEntities(cleanText(
            themeObj?.thematic_area || themeObj?.name || row['thematic_area.thematic_area'] || '',
        ));
        if (thematicAreaName) {
            const th = await r.resolve('trainingThematicArea', 'trainingThematicAreaName', 'trainingThematicAreaId', thematicAreaName);
            if (th.matched) thematicAreaId = th.id;
            else {
                const created = await r.findOrCreate('trainingThematicArea', 'trainingThematicAreaName', 'trainingThematicAreaId', thematicAreaName);
                thematicAreaId = created.id;
                warn('thematicAreaId', `Created thematic area "${thematicAreaName}"`);
            }
        }
        if (!thematicAreaId) err('thematicAreaId', 'Thematic area required — not found on old row, pick manually');

        // 6. Coordinator ← staff id mapped to name via staff-data. REQUIRED (find-or-create).
        let coordinatorId = null;
        let coordinatorName = row._coordinatorName ? cleanText(row._coordinatorName) : null;
        if (!coordinatorName) {
            const coObj = asObject(row.coordinator) || asObject(row.staff);
            coordinatorName = decodeEntities(cleanText(coObj?.name || coObj?.staff_name || row.coordinator_name || ''));
        }
        if (coordinatorName) {
            const co = await r.findOrCreate('courseCoordinatorMaster', 'name', 'coordinatorId', coordinatorName);
            coordinatorId = co.id;
            if (co.created) warn('coordinatorId', `Created coordinator "${coordinatorName}"`);
        }
        if (!coordinatorId) {
            err('coordinatorId', coordinatorName
                ? `Coordinator "${coordinatorName}" could not be resolved`
                : 'No coordinator/staff on old row — pick manually in FK picker');
        }

        // 7. Funding Source ← old `funding_source`. Optional, find-or-create.
        let fundingSourceId = null;
        const fundObj = asObject(row.funding_source);
        const fundingSourceName = decodeEntities(cleanText(
            fundObj?.name || (typeof row.funding_source === 'string' ? row.funding_source : '') || row.funding_source_name || '',
        ));
        if (fundingSourceName) {
            const fs = await r.findOrCreate('fundingSourceMaster', 'name', 'fundingSourceId', fundingSourceName);
            fundingSourceId = fs.id;
            if (fs.created) warn('fundingSourceId', `Created funding source "${fundingSourceName}"`);
        }

        // 8. Funding Agency Name (free text). Optional.
        const fundingAgencyName = decodeEntities(cleanText(
            row.funding_agency_name || row.funding_agency || '',
        ));

        // 9. Dates — old format is dd-mm-yyyy; parseDate normalizes both shapes (UTC).
        const startIso = parseDate(row.start_date);
        const endIso = parseDate(row.end_date);
        const startDate = startIso ? new Date(startIso) : null;
        const endDate = endIso ? new Date(endIso) : null;
        if (!startDate) err('startDate', `Missing/invalid start date "${row.start_date}"`);
        if (!endDate) err('endDate', `Missing/invalid end date "${row.end_date}"`);
        if (startDate && endDate && endDate < startDate) {
            warn('endDate', 'End date is before start date on old row');
        }

        // 10. Title (REQUIRED)
        const titleOfTraining = decodeEntities(cleanText(row.training_title || row.title || '')) || '';
        if (!titleOfTraining) err('titleOfTraining', 'Title of training required');

        // 11. Venue (REQUIRED in schema)
        let venue = decodeEntities(cleanText(row.venue || '')) || '';
        if (!venue) {
            venue = 'Unknown';
            warn('venue', 'Venue not on old row — set to "Unknown", update manually');
        }

        // 12. Campus type
        const campusType = normalizeCampusType(row.campus_type);

        // 13. Farmer demographics — flat on the list row.
        const generalM = intOrZero(row.general_m);
        const generalF = intOrZero(row.general_f);
        const obcM = intOrZero(row.obc_m);
        const obcF = intOrZero(row.obc_f);
        const scM = intOrZero(row.sc_m);
        const scF = intOrZero(row.sc_f);
        const stM = intOrZero(row.st_m);
        const stF = intOrZero(row.st_f);

        const data = {
            kvkId,
            clienteleId,
            trainingTypeId,
            trainingAreaId,
            thematicAreaId,
            coordinatorId,
            fundingSourceId,
            titleOfTraining,
            startDate,
            endDate,
            venue,
            campusType,
            fundingAgencyName: fundingAgencyName || null,
            generalM, generalF, obcM, obcF, scM, scF, stM, stF,
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        const existing = await prisma.trainingAchievement.findFirst({
            where: {
                kvkId: data.kvkId,
                titleOfTraining: data.titleOfTraining,
                ...(data.startDate ? { startDate: data.startDate } : {}),
            },
        });

        if (existing) {
            await prisma.trainingAchievement.update({
                where: { trainingAchievementId: existing.trainingAchievementId },
                data,
            });
            return 'updated';
        }
        await prisma.trainingAchievement.create({ data });
        return 'created';
    },
};
