const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const trainingExtensionEventsController = require('../../controllers/all-masters/trainingExtensionEventsController.js');

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Training Routes  (moduleCode: all_masters_training_master)
// ============================================

router.get('/training/types',     requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getAllTrainingTypes);
router.get('/training/types/:id', requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getTrainingTypeById);
router.post('/training/types',    requirePermission('all_masters_training_master', 'ADD'),  trainingExtensionEventsController.createTrainingType);
router.put('/training/types/:id', requirePermission('all_masters_training_master', 'EDIT'), trainingExtensionEventsController.updateTrainingType);
router.delete('/training/types/:id', requirePermission('all_masters_training_master', 'DELETE'), trainingExtensionEventsController.deleteTrainingType);

router.get('/training/areas',     requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getAllTrainingAreas);
router.get('/training/areas/:id', requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getTrainingAreaById);
router.post('/training/areas',    requirePermission('all_masters_training_master', 'ADD'),  trainingExtensionEventsController.createTrainingArea);
router.put('/training/areas/:id', requirePermission('all_masters_training_master', 'EDIT'), trainingExtensionEventsController.updateTrainingArea);
router.delete('/training/areas/:id', requirePermission('all_masters_training_master', 'DELETE'), trainingExtensionEventsController.deleteTrainingArea);

router.get('/training/thematic-areas',     requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getAllTrainingThematicAreas);
router.get('/training/thematic-areas/:id', requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getTrainingThematicAreaById);
router.post('/training/thematic-areas',    requirePermission('all_masters_training_master', 'ADD'),  trainingExtensionEventsController.createTrainingThematicArea);
router.put('/training/thematic-areas/:id', requirePermission('all_masters_training_master', 'EDIT'), trainingExtensionEventsController.updateTrainingThematicArea);
router.delete('/training/thematic-areas/:id', requirePermission('all_masters_training_master', 'DELETE'), trainingExtensionEventsController.deleteTrainingThematicArea);

// Hierarchical
router.get('/training/types/:trainingTypeId/areas',             requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getTrainingAreasByType);
router.get('/training/areas/:trainingAreaId/thematic-areas',    requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getTrainingThematicAreasByArea);

// ============================================
// Extension Activity Routes  (moduleCode: all_masters_extension_activity_master)
// ============================================

router.get('/extension-activities',     requirePermission('all_masters_extension_activity_master', 'VIEW'), trainingExtensionEventsController.getAllExtensionActivities);
router.get('/extension-activities/:id', requirePermission('all_masters_extension_activity_master', 'VIEW'), trainingExtensionEventsController.getExtensionActivityById);
router.post('/extension-activities',    requirePermission('all_masters_extension_activity_master', 'ADD'),  trainingExtensionEventsController.createExtensionActivity);
router.put('/extension-activities/:id', requirePermission('all_masters_extension_activity_master', 'EDIT'), trainingExtensionEventsController.updateExtensionActivity);
router.delete('/extension-activities/:id', requirePermission('all_masters_extension_activity_master', 'DELETE'), trainingExtensionEventsController.deleteExtensionActivity);

// ============================================
// Other Extension Activity Routes  (moduleCode: all_masters_other_extension_activity_master)
// ============================================

router.get('/other-extension-activities',     requirePermission('all_masters_other_extension_activity_master', 'VIEW'), trainingExtensionEventsController.getAllOtherExtensionActivities);
router.get('/other-extension-activities/:id', requirePermission('all_masters_other_extension_activity_master', 'VIEW'), trainingExtensionEventsController.getOtherExtensionActivityById);
router.post('/other-extension-activities',    requirePermission('all_masters_other_extension_activity_master', 'ADD'),  trainingExtensionEventsController.createOtherExtensionActivity);
router.put('/other-extension-activities/:id', requirePermission('all_masters_other_extension_activity_master', 'EDIT'), trainingExtensionEventsController.updateOtherExtensionActivity);
router.delete('/other-extension-activities/:id', requirePermission('all_masters_other_extension_activity_master', 'DELETE'), trainingExtensionEventsController.deleteOtherExtensionActivity);

// ============================================
// Event Routes  (moduleCode: all_masters_events_master)
// ============================================

router.get('/events',     requirePermission('all_masters_events_master', 'VIEW'), trainingExtensionEventsController.getAllEvents);
router.get('/events/:id', requirePermission('all_masters_events_master', 'VIEW'), trainingExtensionEventsController.getEventById);
router.post('/events',    requirePermission('all_masters_events_master', 'ADD'),  trainingExtensionEventsController.createEvent);
router.put('/events/:id', requirePermission('all_masters_events_master', 'EDIT'), trainingExtensionEventsController.updateEvent);
router.delete('/events/:id', requirePermission('all_masters_events_master', 'DELETE'), trainingExtensionEventsController.deleteEvent);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', requirePermission('all_masters_training_master', 'VIEW'), trainingExtensionEventsController.getStats);

module.exports = router;
