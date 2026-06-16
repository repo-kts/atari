/**
 * KVK Module Wipe Service  ── TEMPORARY MIGRATION TOOL ──
 *
 * Deletes every row of a module's table(s) for ONE kvkId. The kvkId is always
 * supplied by the controller from the authenticated user (req.user.kvkId) and
 * never taken from the client, so a KVK user can only ever clear their own data.
 */

const prisma = require('../../config/prisma.js');
const { getWipeSpec, toAccessor } = require('./kvkModuleWipeRegistry.js');

/**
 * @param {string} entityType  registry key (the frontend's entityType)
 * @param {number} kvkId       authenticated user's KVK id
 * @returns {Promise<{ module: string, kvkId: number, deleted: Record<string, number>, total: number }>}
 */
async function wipeModule(entityType, kvkId) {
    const spec = getWipeSpec(entityType);
    if (!spec) {
        const err = new Error(`Delete-all is not available for "${entityType}".`);
        err.statusCode = 400;
        throw err;
    }
    if (!Number.isInteger(kvkId) || kvkId <= 0) {
        const err = new Error('No KVK is linked to your account.');
        err.statusCode = 403;
        throw err;
    }

    const deleted = {};
    // Models are listed child-first; delete in order inside one transaction so a
    // partial failure rolls back rather than leaving the module half-wiped.
    await prisma.$transaction(async (tx) => {
        for (const modelName of spec.models) {
            const accessor = toAccessor(modelName);
            const res = await tx[accessor].deleteMany({ where: { kvkId } });
            deleted[modelName] = res.count;
        }
    });

    const total = Object.values(deleted).reduce((a, b) => a + b, 0);
    return { module: spec.label, entityType, kvkId, deleted, total };
}

module.exports = { wipeModule };
