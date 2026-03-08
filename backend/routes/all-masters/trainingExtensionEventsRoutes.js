const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const trainingExtensionEventsController = require('../../controllers/all-masters/trainingExtensionEventsController.js');

/**
 * Training, Extension & Events Master Routes
 *
 * GET (read) endpoints require only authentication — master data is
 * non-sensitive reference/lookup data used as dropdown sources across many
 * forms. Gating reads by master-specific permissions would block form users
 * who have form permissions but not master-management permissions.
 *
 * POST/PUT/DELETE (write) endpoints require granular master module permissions
 * controlled by the Role Permission Editor.
 *
 * Master management PAGES are still protected on the frontend by sidebar
 * filtering (hasPermission) and ProtectedRoute — users without the VIEW
 * permission on a master module won't see or navigate to those pages.
 */

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Training Routes  (moduleCode: all_masters_training_master)
// ============================================

router.get('/training/types',     trainingExtensionEventsController.getAllTrainingTypes);
router.get('/training/types/:id', trainingExtensionEventsController.getTrainingTypeById);
router.post('/training/types',    requirePermission('all_masters_training_master', 'ADD'),  trainingExtensionEventsController.createTrainingType);
router.put('/training/types/:id', requirePermission('all_masters_training_master', 'EDIT'), trainingExtensionEventsController.updateTrainingType);
router.delete('/training/types/:id', requirePermission('all_masters_training_master', 'DELETE'), trainingExtensionEventsController.deleteTrainingType);

router.get('/training/areas',     trainingExtensionEventsController.getAllTrainingAreas);
router.get('/training/areas/:id', trainingExtensionEventsController.getTrainingAreaById);
router.post('/training/areas',    requirePermission('all_masters_training_master', 'ADD'),  trainingExtensionEventsController.createTrainingArea);
router.put('/training/areas/:id', requirePermission('all_masters_training_master', 'EDIT'), trainingExtensionEventsController.updateTrainingArea);
router.delete('/training/areas/:id', requirePermission('all_masters_training_master', 'DELETE'), trainingExtensionEventsController.deleteTrainingArea);

router.get('/training/thematic-areas',     trainingExtensionEventsController.getAllTrainingThematicAreas);
router.get('/training/thematic-areas/:id', trainingExtensionEventsController.getTrainingThematicAreaById);
router.post('/training/thematic-areas',    requirePermission('all_masters_training_master', 'ADD'),  trainingExtensionEventsController.createTrainingThematicArea);
router.put('/training/thematic-areas/:id', requirePermission('all_masters_training_master', 'EDIT'), trainingExtensionEventsController.updateTrainingThematicArea);
router.delete('/training/thematic-areas/:id', requirePermission('all_masters_training_master', 'DELETE'), trainingExtensionEventsController.deleteTrainingThematicArea);

// Hierarchical
router.get('/training/types/:trainingTypeId/areas',             trainingExtensionEventsController.getTrainingAreasByType);
router.get('/training/areas/:trainingAreaId/thematic-areas',    trainingExtensionEventsController.getTrainingThematicAreasByArea);

// ============================================
// Extension Activity Routes  (moduleCode: all_masters_extension_activity_master)
// ============================================

router.get('/extension-activities',     trainingExtensionEventsController.getAllExtensionActivities);
router.get('/extension-activities/:id', trainingExtensionEventsController.getExtensionActivityById);
router.post('/extension-activities',    requirePermission('all_masters_extension_activity_master', 'ADD'),  trainingExtensionEventsController.createExtensionActivity);
router.put('/extension-activities/:id', requirePermission('all_masters_extension_activity_master', 'EDIT'), trainingExtensionEventsController.updateExtensionActivity);
router.delete('/extension-activities/:id', requirePermission('all_masters_extension_activity_master', 'DELETE'), trainingExtensionEventsController.deleteExtensionActivity);

// ============================================
// Other Extension Activity Routes  (moduleCode: all_masters_other_extension_activity_master)
// ============================================

router.get('/other-extension-activities',     trainingExtensionEventsController.getAllOtherExtensionActivities);
router.get('/other-extension-activities/:id', trainingExtensionEventsController.getOtherExtensionActivityById);
router.post('/other-extension-activities',    requirePermission('all_masters_other_extension_activity_master', 'ADD'),  trainingExtensionEventsController.createOtherExtensionActivity);
router.put('/other-extension-activities/:id', requirePermission('all_masters_other_extension_activity_master', 'EDIT'), trainingExtensionEventsController.updateOtherExtensionActivity);
router.delete('/other-extension-activities/:id', requirePermission('all_masters_other_extension_activity_master', 'DELETE'), trainingExtensionEventsController.deleteOtherExtensionActivity);

// ============================================
// Event Routes  (moduleCode: all_masters_events_master)
// ============================================

router.get('/events',     trainingExtensionEventsController.getAllEvents);
router.get('/events/:id', trainingExtensionEventsController.getEventById);
router.post('/events',    requirePermission('all_masters_events_master', 'ADD'),  trainingExtensionEventsController.createEvent);
router.put('/events/:id', requirePermission('all_masters_events_master', 'EDIT'), trainingExtensionEventsController.updateEvent);
router.delete('/events/:id', requirePermission('all_masters_events_master', 'DELETE'), trainingExtensionEventsController.deleteEvent);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', trainingExtensionEventsController.getStats);

module.exports = router;
