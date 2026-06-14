const { parseDate, decodeEntities, extractImgSrc, cleanText } = require('../util.js');

/**
 * Old-site discipline is a bare number indexing a HARDCODED dropdown (no master
 * table on their side). This is that list, in order — same names/ids as our
 * Discipline master, so number -> name -> our id resolves cleanly.
 */
const DISCIPLINE_MAP = {
    1: 'Agronomy',
    2: 'Soil Science',
    3: 'Horticulture',
    4: 'Plant breeding',
    5: 'Plant Protection',
    6: 'Entomology',
    7: 'Plant Pathology',
    8: 'Home Science',
    9: 'Agricultural Engineering',
    10: 'Agricultural Extension',
    11: 'Animal Science',
    12: 'Fisheries',
    13: 'Other',
};

/**
 * Module spec: KVK Staff / Employees. Source: atariams.org `staff-data`.
 *
 * Master resolution strategy per field:
 *  - sanctionedPost : by OLD id (post_id) — old & our ids align 1:1; this dodges
 *    the old typo "Speaclist" that broke name matching. Name fallback, then Other.
 *  - discipline     : old number -> DISCIPLINE_MAP name -> our master id.
 *  - payScale       : by name, else CREATE the master row and use the new id.
 *  - jobType/staffCategory/payLevel : by name, else Other.
 */
module.exports = {
    key: 'employee',
    label: 'Employees (Staff)',
    model: 'kvkStaff',
    naturalKey: ['kvkId', 'staffName', 'dateOfBirth'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        sanctionedPostId: { master: 'sanctionedPost', otherField: 'sanctionedPostOther' },
        jobTypeMasterId: { master: 'jobTypeMaster', otherField: 'jobTypeOther' },
        staffCategoryId: { master: 'staffCategory', otherField: 'staffCategoryOther' },
        payLevelId: { master: 'payLevel', otherField: 'payLevelOther' },
        payScaleId: { master: 'payScale', otherField: 'payScaleOther' },
        disciplineId: { master: 'discipline' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const req = (field, value) => {
            if (value === undefined || value === null || String(value).trim() === '') {
                issues.push({ field, message: `Missing required "${field}"`, severity: 'error' });
            }
            return value;
        };
        const warn = (field, message) => issues.push({ field, message, severity: 'warn' });

        // Simple name-match-or-Other (jobType, staffCategory, payLevel).
        const byName = async (model, nameField, idField, rawLabel, idKey, otherKey) => {
            const label = decodeEntities(rawLabel);
            const m = await r.resolve(model, nameField, idField, label);
            if (label && !m.matched) warn(otherKey, `"${label}" not in ${model} — parked in ${otherKey}`);
            return { [idKey]: m.id, [otherKey]: m.matched ? null : cleanText(rawLabel) };
        };

        // sanctionedPost: old id first, then name, then Other.
        let sanctionedPostId = null;
        let sanctionedPostOther = null;
        const postName = decodeEntities(row.post?.post_name);
        const byId = await r.resolveById('sanctionedPost', 'postName', 'sanctionedPostId', row.post_id ?? row.post?.id);
        if (byId.matched) {
            sanctionedPostId = byId.id;
        } else {
            const byNm = await r.resolve('sanctionedPost', 'postName', 'sanctionedPostId', postName);
            if (byNm.matched) sanctionedPostId = byNm.id;
            else if (postName) {
                sanctionedPostOther = postName;
                warn('sanctionedPostId', `"${postName}" (old id ${row.post_id}) not in master — parked in Other`);
            }
        }

        // discipline: old number -> name -> our master id.
        let disciplineId = null;
        const dName = DISCIPLINE_MAP[Number(row.discipline)];
        if (dName) {
            const m = await r.resolve('discipline', 'disciplineName', 'disciplineId', dName);
            if (m.matched) disciplineId = m.id;
        }
        if (disciplineId == null && row.discipline) {
            warn('disciplineId', `Old discipline "${row.discipline}"${dName ? ' (' + dName + ')' : ''} unmapped — pick manually`);
        }

        // payScale: find or create.
        let payScaleId = null;
        let payScaleOther = null;
        const payScaleVal = cleanText(row.pay_scale);
        if (payScaleVal) {
            const m = await r.findOrCreate('payScaleMaster', 'scaleName', 'payScaleId', payScaleVal);
            payScaleId = m.id;
            if (m.created) warn('payScaleId', `Created new pay scale "${payScaleVal}" (#${m.id})`);
        }

        const jt = await byName('jobTypeMaster', 'name', 'jobTypeId', row.job_type, 'jobTypeMasterId', 'jobTypeOther');
        const sc = await byName('staffCategoryMaster', 'categoryName', 'staffCategoryId', row.caste?.caste_name, 'staffCategoryId', 'staffCategoryOther');
        const pl = await byName('payLevelMaster', 'levelName', 'payLevelId', row.pay_band, 'payLevelId', 'payLevelOther');

        const data = {
            kvkId: ctx.kvkId,
            staffName: decodeEntities(req('staffName', row.staff_name)),
            email: cleanText(row.email),
            mobile: req('mobile', row.mobile),
            dateOfBirth: req('dateOfBirth', parseDate(row.dob)),
            dateOfJoining: req('dateOfJoining', parseDate(row.date_of_joining)),
            photoPath: extractImgSrc(row.photo),
            resumePath: cleanText(row.resume),
            positionOrder: Number(row.position) || 0,
            allowances: cleanText(row.alliances),
            transferStatus: row.is_transferred ? 'TRANSFERRED' : 'ACTIVE',

            sanctionedPostId,
            sanctionedPostOther,
            disciplineId,
            payScaleId,
            payScaleOther,
            ...jt,
            ...sc,
            ...pl,
        };

        return { data, issues };
    },
};
