/**
 * KVK Module Wipe Controller  ── TEMPORARY MIGRATION TOOL ──
 *
 * POST body: { entityType: string }
 * Deletes all rows of that module for the authenticated user's own KVK.
 */

const kvkModuleWipeService = require('../../services/forms/kvkModuleWipeService.js');

async function wipe(req, res) {
    try {
        if (!req.user || typeof req.user !== 'object') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { entityType } = req.body || {};
        if (!entityType || typeof entityType !== 'string') {
            return res
                .status(400)
                .json({ success: false, message: 'entityType is required.' });
        }

        // kvkId comes ONLY from the authenticated session — never from the client.
        const kvkId = Number(req.user.kvkId);

        const result = await kvkModuleWipeService.wipeModule(entityType, kvkId);

        return res.json({
            success: true,
            message: `Deleted ${result.total} ${result.module} record(s).`,
            data: result,
        });
    } catch (err) {
        const status = err.statusCode || 500;
        if (status >= 500) console.error('[kvkModuleWipe] error:', err);
        return res
            .status(status)
            .json({ success: false, message: err.message || 'Failed to delete data.' });
    }
}

module.exports = { wipe };
