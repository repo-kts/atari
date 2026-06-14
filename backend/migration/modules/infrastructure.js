const { decodeEntities, cleanText, toBool } = require('../util.js');

/**
 * Module spec: KVK Infrastructure. Source: atariams.org `infra-data`.
 *
 * infraMaster: old `name_of_infra` / nested `infrastruture.id` aligns 1:1 with
 * our KvkInfrastructureMaster ids ("Admin Building"=1 …) — resolve by id, name
 * fallback. It's a required FK, so an unmatched one is an error (pick in the UI).
 * Booleans arrive as "Yes"/"No".
 */
module.exports = {
    key: 'infrastructure',
    label: 'Infrastructure',
    model: 'kvkInfrastructure',
    idField: 'infraId',
    // specifyName disambiguates multiple "Others" rows for the same KVK
    naturalKey: ['kvkId', 'infraMasterId', 'specifyName'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        infraMasterId: { master: 'infraMaster', otherField: 'specifyName' },
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

        // infraMaster by old id, then by name.
        let infraMasterId = null;
        const oldId = row.name_of_infra ?? row.infrastruture?.id;
        const byId = await r.resolveById('kvkInfrastructureMaster', 'name', 'infraMasterId', oldId);
        if (byId.matched) {
            infraMasterId = byId.id;
        } else {
            const name = decodeEntities(row.infrastruture?.infra_name);
            const byNm = await r.resolve('kvkInfrastructureMaster', 'name', 'infraMasterId', name);
            if (byNm.matched) infraMasterId = byNm.id;
        }
        if (infraMasterId == null) {
            issues.push({
                field: 'infraMasterId',
                message: `Infra type (old id "${oldId}", "${row.infrastruture?.infra_name}") not in master — pick one`,
                severity: 'error',
            });
        }

        // Seed the funding-source master from the raw old value (free text on the
        // old site). The infra record keeps sourceOfFunding as the raw string —
        // this just accumulates distinct old values into the master (idempotent).
        const fundingStr = cleanText(row.source_of_funding);
        if (fundingStr) {
            const f = await r.findOrCreate('fundingSourceMaster', 'name', 'fundingSourceId', fundingStr);
            if (f.created) warn('sourceOfFunding', `Added funding source "${fundingStr}" to master (#${f.id})`);
        }

        const data = {
            kvkId: ctx.kvkId,
            infraMasterId,
            specifyName: cleanText(row.other_name),
            notYetStarted: toBool(row.not_yet),
            completedPlinthLevel: toBool(row.completed_plinth_level),
            completedLintelLevel: toBool(row.completed_lintel_level),
            completedRoofLevel: toBool(row.completed_roof_level),
            totallyCompleted: toBool(row.totally_completed),
            plinthAreaSqM: Number(row.plinth_area) || 0,
            underUse: toBool(row.under_use),
            sourceOfFunding: req('sourceOfFunding', cleanText(row.source_of_funding)) || '',
        };

        return { data, issues };
    },
};
