/**
 * KVK Module Wipe routes  ── TEMPORARY MIGRATION TOOL ──
 *
 * Mounted OUTSIDE the /forms tree so it does not inherit validateFormRobustness
 * / reportingYearNormalizer (those mutate a form payload this body is not).
 * Restricted to KVK roles: the wipe is always scoped to req.user.kvkId, which
 * only KVK accounts have, so they can clear only their own module data.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { ensureBody } = require('../../middleware/validateInput.js');
const kvkModuleWipeController = require('../../controllers/forms/kvkModuleWipeController.js');

router.use(authenticateToken);

/**
 * @route   POST /api/maintenance/kvk-module-wipe
 * @desc    Delete all rows of a module for the caller's own KVK
 * @access  KVK Role (kvk_admin / kvk_user)
 */
router.post(
    '/kvk-module-wipe',
    requireRole(['kvk_admin', 'kvk_user']),
    ensureBody(),
    kvkModuleWipeController.wipe
);

module.exports = router;
