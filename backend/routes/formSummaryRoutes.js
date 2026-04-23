const express = require('express');
const router = express.Router();
const formSummaryController = require('../controllers/formSummaryController.js');
const { authenticateToken, requirePermission } = require('../middleware/auth.js');
const { apiRateLimiter } = require('../middleware/rateLimiter.js');

router.use(authenticateToken);

/**
 * GET /api/forms/summary
 * Sidebar-level summary of every Form-Management form's completion state.
 * super_admin (no kvkId): matrix across all KVKs.
 * super_admin + ?kvkId=N: single-KVK view.
 * Anyone else: their own KVK.
 */
router.get(
  '/',
  apiRateLimiter,
  requirePermission('form_summary_status', 'VIEW'),
  formSummaryController.getSummary,
);

module.exports = router;
