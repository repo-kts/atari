const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const trainingExtensionEventsController = require('../../controllers/all-masters/trainingExtensionEventsController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Helper for restricted actions (create, update, delete)
const requireSuperAdmin = requireRole(['super_admin']);
const allowAllRoles = requireRole(['super_admin', 'admin', 'kvk', 'zpd', 'icar']);

// ============================================
// Training Type Routes
// ============================================

router.get('/training/types', allowAllRoles, trainingExtensionEventsController.getAllTrainingTypes);
router.get('/training/types/:id', allowAllRoles, trainingExtensionEventsController.getTrainingTypeById);
router.post('/training/types', requireSuperAdmin, trainingExtensionEventsController.createTrainingType);
router.put('/training/types/:id', requireSuperAdmin, trainingExtensionEventsController.updateTrainingType);
router.delete('/training/types/:id', requireSuperAdmin, trainingExtensionEventsController.deleteTrainingType);

// ============================================
// Training Area Routes
// ============================================

router.get('/training/areas', allowAllRoles, trainingExtensionEventsController.getAllTrainingAreas);
router.get('/training/areas/:id', allowAllRoles, trainingExtensionEventsController.getTrainingAreaById);
router.post('/training/areas', requireSuperAdmin, trainingExtensionEventsController.createTrainingArea);
router.put('/training/areas/:id', requireSuperAdmin, trainingExtensionEventsController.updateTrainingArea);
router.delete('/training/areas/:id', requireSuperAdmin, trainingExtensionEventsController.deleteTrainingArea);

// ============================================
// Training Thematic Area Routes
// ============================================

router.get('/training/thematic-areas', allowAllRoles, trainingExtensionEventsController.getAllTrainingThematicAreas);
router.get('/training/thematic-areas/:id', allowAllRoles, trainingExtensionEventsController.getTrainingThematicAreaById);
router.post('/training/thematic-areas', requireSuperAdmin, trainingExtensionEventsController.createTrainingThematicArea);
router.put('/training/thematic-areas/:id', requireSuperAdmin, trainingExtensionEventsController.updateTrainingThematicArea);
router.delete('/training/thematic-areas/:id', requireSuperAdmin, trainingExtensionEventsController.deleteTrainingThematicArea);

// ============================================
// Training Hierarchical Routes
// ============================================

router.get('/training/types/:trainingTypeId/areas', allowAllRoles, trainingExtensionEventsController.getTrainingAreasByType);
router.get('/training/areas/:trainingAreaId/thematic-areas', allowAllRoles, trainingExtensionEventsController.getTrainingThematicAreasByArea);

// ============================================
// Extension Activity Routes
// ============================================

router.get('/extension-activities', allowAllRoles, trainingExtensionEventsController.getAllExtensionActivities);
router.get('/extension-activities/:id', allowAllRoles, trainingExtensionEventsController.getExtensionActivityById);
router.post('/extension-activities', requireSuperAdmin, trainingExtensionEventsController.createExtensionActivity);
router.put('/extension-activities/:id', requireSuperAdmin, trainingExtensionEventsController.updateExtensionActivity);
router.delete('/extension-activities/:id', requireSuperAdmin, trainingExtensionEventsController.deleteExtensionActivity);

// ============================================
// Other Extension Activity Routes
// ============================================

router.get('/other-extension-activities', allowAllRoles, trainingExtensionEventsController.getAllOtherExtensionActivities);
router.get('/other-extension-activities/:id', allowAllRoles, trainingExtensionEventsController.getOtherExtensionActivityById);
router.post('/other-extension-activities', requireSuperAdmin, trainingExtensionEventsController.createOtherExtensionActivity);
router.put('/other-extension-activities/:id', requireSuperAdmin, trainingExtensionEventsController.updateOtherExtensionActivity);
router.delete('/other-extension-activities/:id', requireSuperAdmin, trainingExtensionEventsController.deleteOtherExtensionActivity);

// ============================================
// Event Routes
// ============================================

router.get('/events', allowAllRoles, trainingExtensionEventsController.getAllEvents);
router.get('/events/:id', allowAllRoles, trainingExtensionEventsController.getEventById);
router.post('/events', requireSuperAdmin, trainingExtensionEventsController.createEvent);
router.put('/events/:id', requireSuperAdmin, trainingExtensionEventsController.updateEvent);
router.delete('/events/:id', requireSuperAdmin, trainingExtensionEventsController.deleteEvent);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', allowAllRoles, trainingExtensionEventsController.getStats);

module.exports = router;
