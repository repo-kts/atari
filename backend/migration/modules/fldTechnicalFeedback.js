const { decodeEntities, cleanText } = require('../util.js');
const { resolveFld } = require('./fldExtension.js');

/**
 * Module spec: FLD Technical Feedback on the demonstrated technology (child of
 * an FLD). Old endpoint: /fld-feedback
 */
module.exports = {
    key: 'fldTechnicalFeedback',
    label: 'FLD Technical Feedback',
    model: 'fldTechnicalFeedback',
    idField: 'feedbackId',
    naturalKey: ['kvkId', 'fldId', 'feedback'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        cropId: { master: 'fldCrop' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // ── Parent FLD link (also scopes the row to the target KVK) ──────────
        const { fldId, reportingYear, issues: fldIssues } = await resolveFld(row, ctx);
        issues.push(...fldIssues);

        // ── Crop (optional) ──────────────────────────────────────────────────
        let cropId = null;
        const cropName = decodeEntities(cleanText(row.crop)) || '';
        if (cropName) {
            const c = await r.findOrCreate('fldCrop', 'cropName', 'cropId', cropName);
            if (c.id) {
                cropId = c.id;
                if (c.created) warn('cropId', `Created crop "${cropName}"`);
            }
        }

        // ── Feedback text (required) ─────────────────────────────────────────
        const feedback = decodeEntities(cleanText(row.feedback)) || '';
        if (!feedback) err('feedback', 'Missing feedback text (required)');

        return {
            data: {
                kvkId: ctx.kvkId,
                fldId,
                cropId,
                feedback,
                reportingYear,
            },
            issues,
        };
    },
};
