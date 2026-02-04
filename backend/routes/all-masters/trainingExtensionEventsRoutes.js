const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const trainingExtensionEventsController = require('../../controllers/all-masters/trainingExtensionEventsController.js');

// Apply authentication and authorization middleware
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============================================
// Training Type Routes
// ============================================

router.get('/training/types', trainingExtensionEventsController.getAllTrainingTypes);
router.get('/training/types/:id', trainingExtensionEventsController.getTrainingTypeById);
router.post('/training/types', trainingExtensionEventsController.createTrainingType);
router.put('/training/types/:id', trainingExtensionEventsController.updateTrainingType);
router.delete('/training/types/:id', trainingExtensionEventsController.deleteTrainingType);

// ============================================
// Training Area Routes
// ============================================

router.get('/training/areas', trainingExtensionEventsController.getAllTrainingAreas);
router.get('/training/areas/:id', trainingExtensionEventsController.getTrainingAreaById);
router.post('/training/areas', trainingExtensionEventsController.createTrainingArea);
router.put('/training/areas/:id', trainingExtensionEventsController.updateTrainingArea);
router.delete('/training/areas/:id', trainingExtensionEventsController.deleteTrainingArea);

// ============================================
// Training Thematic Area Routes
// ============================================

router.get('/training/thematic-areas', trainingExtensionEventsController.getAllTrainingThematicAreas);
router.get('/training/thematic-areas/:id', trainingExtensionEventsController.getTrainingThematicAreaById);
router.post('/training/thematic-areas', trainingExtensionEventsController.createTrainingThematicArea);
router.put('/training/thematic-areas/:id', trainingExtensionEventsController.updateTrainingThematicArea);
router.delete('/training/thematic-areas/:id', trainingExtensionEventsController.deleteTrainingThematicArea);

// ============================================
// Training Hierarchical Routes
// ============================================

router.get('/training/types/:trainingTypeId/areas', trainingExtensionEventsController.getTrainingAreasByType);
router.get('/training/areas/:trainingAreaId/thematic-areas', trainingExtensionEventsController.getTrainingThematicAreasByArea);

// ============================================
// Extension Activity Routes
// ============================================

router.get('/extension-activities', trainingExtensionEventsController.getAllExtensionActivities);
router.get('/extension-activities/:id', trainingExtensionEventsController.getExtensionActivityById);
router.post('/extension-activities', trainingExtensionEventsController.createExtensionActivity);
router.put('/extension-activities/:id', trainingExtensionEventsController.updateExtensionActivity);
router.delete('/extension-activities/:id', trainingExtensionEventsController.deleteExtensionActivity);

// ============================================
// Other Extension Activity Routes
// ============================================

router.get('/other-extension-activities', trainingExtensionEventsController.getAllOtherExtensionActivities);
router.get('/other-extension-activities/:id', trainingExtensionEventsController.getOtherExtensionActivityById);
router.post('/other-extension-activities', trainingExtensionEventsController.createOtherExtensionActivity);
router.put('/other-extension-activities/:id', trainingExtensionEventsController.updateOtherExtensionActivity);
router.delete('/other-extension-activities/:id', trainingExtensionEventsController.deleteOtherExtensionActivity);

// ============================================
// Event Routes
// ============================================

router.get('/events', trainingExtensionEventsController.getAllEvents);
router.get('/events/:id', trainingExtensionEventsController.getEventById);
router.post('/events', trainingExtensionEventsController.createEvent);
router.put('/events/:id', trainingExtensionEventsController.updateEvent);
router.delete('/events/:id', trainingExtensionEventsController.deleteEvent);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', trainingExtensionEventsController.getStats);

module.exports = router;
