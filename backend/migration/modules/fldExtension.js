const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');
const prisma = require('../../config/prisma.js');

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Resolve the embedded old-site `fld` object to an already-migrated
 * KvkFldIntroduction record in OUR db. Both fld-extension and fld-feedback rows
 * carry the parent FLD inline; we link by KVK + technology name (+ start date to
 * disambiguate). FLDs MUST be migrated first.
 * @returns {Promise<{ fldId:number|null, reportingYear:string|null, issues:Array }>}
 */
async function resolveFld(row, ctx) {
    const issues = [];
    const fld = row.fld || {};
    const techName =
        decodeEntities(cleanText(fld.technology_demonstrated || row.technology_demonstrated)) || '';

    const reportingYear = fld.reporting_year != null
        ? parseDate(String(fld.reporting_year))
        : null;

    if (!techName) {
        issues.push({ field: 'fldId', message: 'Missing FLD technology name on old row — cannot link FLD', severity: 'error' });
        return { fldId: null, reportingYear, issues };
    }

    const candidates = await prisma.kvkFldIntroduction.findMany({
        where: { kvkId: ctx.kvkId },
        select: { kvkFldId: true, fldName: true, startDate: true },
    });
    const target = normalize(techName);
    let matches = candidates.filter(c => normalize(c.fldName) === target);

    if (matches.length === 0) {
        issues.push({
            field: 'fldId',
            message: `FLD "${techName}" not found for KVK #${ctx.kvkId} — migrate FLDs first (or this row belongs to another KVK)`,
            severity: 'error',
        });
        return { fldId: null, reportingYear, issues };
    }

    if (matches.length > 1) {
        // Disambiguate by FLD start date when the old row carries one.
        const oldStart = fld.start_date ? parseDate(String(fld.start_date)) : null;
        if (oldStart) {
            const day = oldStart.slice(0, 10);
            const narrowed = matches.filter(
                c => c.startDate && c.startDate.toISOString().slice(0, 10) === day,
            );
            if (narrowed.length) matches = narrowed;
        }
        if (matches.length > 1) {
            issues.push({
                field: 'fldId',
                message: `Multiple FLDs named "${techName}" for KVK #${ctx.kvkId} — linked to the first (#${matches[0].kvkFldId}); verify manually`,
                severity: 'warn',
            });
        }
    }

    return { fldId: matches[0].kvkFldId, reportingYear, issues };
}

/**
 * Module spec: FLD Extension & Training Activities (child of an FLD).
 * Old endpoint: /fld-extensions
 */
module.exports = {
    key: 'fldExtension',
    label: 'FLD Extension & Training Activities',
    model: 'fldExtension',
    idField: 'extensionId',
    naturalKey: ['kvkId', 'fldId', 'activityId', 'activityDate'],
    resolveFld,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        activityId: { master: 'fldActivity' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // ── Parent FLD link (also scopes the row to the target KVK) ──────────
        const { fldId, reportingYear, issues: fldIssues } = await resolveFld(row, ctx);
        issues.push(...fldIssues);

        // ── Activity type ────────────────────────────────────────────────────
        let activityId = null;
        const activityName = decodeEntities(cleanText(row.activity)) || '';
        if (activityName) {
            const a = await r.findOrCreate('fldActivity', 'activityName', 'activityId', activityName);
            if (a.id) {
                activityId = a.id;
                if (a.created) warn('activityId', `Created activity "${activityName}"`);
            }
        }
        if (!activityId) err('activityId', 'Missing activity type — cannot resolve or create');

        // ── Activity date ────────────────────────────────────────────────────
        const activityDate = row.date ? parseDate(String(row.date)) : null;
        if (!activityDate) err('activityDate', 'Missing activity date (required)');

        // ── Counts & demographics ────────────────────────────────────────────
        const numberOfActivities = intOrZero(row.no_of_activity);
        const generalM = intOrZero(row.general_m);
        const generalF = intOrZero(row.general_f);
        const obcM = intOrZero(row.obc_m);
        const obcF = intOrZero(row.obc_f);
        const scM = intOrZero(row.sc_m);
        const scF = intOrZero(row.sc_f);
        const stM = intOrZero(row.st_m);
        const stF = intOrZero(row.st_f);

        const demoTotal = generalM + generalF + obcM + obcF + scM + scF + stM + stF;
        const participants = intOrZero(row.no_of_perticipent);
        if (demoTotal === 0 && participants > 0) {
            warn('generalM', `Old row had ${participants} participants but no category split — demographics default to 0, fill manually`);
        }

        return {
            data: {
                kvkId: ctx.kvkId,
                fldId,
                activityId,
                activityDate,
                numberOfActivities,
                remarks: decodeEntities(cleanText(row.remark)),
                generalM,
                generalF,
                obcM,
                obcF,
                scM,
                scF,
                stM,
                stF,
                reportingYear,
            },
            issues,
        };
    },
};
