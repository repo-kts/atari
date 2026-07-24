const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const reportController = require('../../controllers/reports/reportController.js');

// All report routes require authentication
router.use(authenticateToken);

// All report routes require VIEW permission on reports module
router.use(requirePermission('reports', 'VIEW'));

/**
 * GET /api/reports/kvk/config
 * Get report configuration (available sections)
 */
router.get('/kvk/config', reportController.getReportConfig); 

/**
 * POST /api/reports/kvk/data
 * Get report data for preview (without generating PDF)
 */
router.post('/kvk/data', reportController.getReportData);

/**
 * POST /api/reports/kvk/generate
 * Generate KVK report PDF (supports both single KVK and aggregated reports)
 */
router.post('/kvk/generate', reportController.generateKvkReport);

/**
 * GET /api/reports/scope
 * Get scope options for current user based on their role
 */
router.get('/scope', reportController.getScopeOptions);

/**
 * POST /api/reports/scope/children
 * Get filtered children based on selected parents
 */
router.post('/scope/children', reportController.getFilteredChildren);

/**
 * POST /api/reports/scope/kvks
 * Get filtered KVKs based on multiple parent filters
 */
router.post('/scope/kvks', reportController.getFilteredKvks);

/**
 * POST /api/reports/aggregated/generate
 * Generate aggregated report PDF for multiple KVKs
 */
router.post('/aggregated/generate', reportController.generateAggregatedReport);

/**
 * POST /api/reports/aggregated/jobs
 * Queue a durable aggregated PDF generation job.
 */
router.post('/aggregated/jobs', reportController.createAggregatedReportJob);

/**
 * GET /api/reports/aggregated/jobs/:jobId
 * Read progress and signed result URLs for the current user's report job.
 */
router.get('/aggregated/jobs/:jobId', reportController.getAggregatedReportJob);

/**
 * GET /api/reports/aggregated/jobs/:jobId/file
 * Stream a completed report from development-only local storage.
 */
router.get(
    '/aggregated/jobs/:jobId/file',
    reportController.getAggregatedReportJobFile,
);

/**
 * POST /api/reports/aggregated/jobs/:jobId/cancel
 * Cancel an active report job owned by the current user.
 */
router.post(
    '/aggregated/jobs/:jobId/cancel',
    reportController.cancelAggregatedReportJob,
);

module.exports = router;
