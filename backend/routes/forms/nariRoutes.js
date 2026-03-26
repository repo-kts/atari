const express = require('express');
const router = express.Router();
const nariBioFortifiedCropController = require('../../controllers/forms/nariBioFortifiedCropController.js');
const nariExtensionActivityController = require('../../controllers/forms/nariExtensionActivityController.js');
const nariNutritionalGardenController = require('../../controllers/forms/nariNutritionalGardenController.js');
const nariTrainingProgrammeController = require('../../controllers/forms/nariTrainingProgrammeController.js');
const nariValueAdditionController = require('../../controllers/forms/nariValueAdditionController.js');
const nariTrainingController = require('../../controllers/forms/nariTrainingController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// Apply authentication to all routes
router.use(authenticateToken);

// Bio-fortified Crop Routes
router.post('/bio-fortified-crop', requireRole(['kvk_admin', 'kvk_user', 'super_admin', 'icar_admin', 'atari_admin']), nariBioFortifiedCropController.create);
router.get('/bio-fortified-crop', nariBioFortifiedCropController.getAll);
router.get('/bio-fortified-crop/:id', nariBioFortifiedCropController.getById);
router.put('/bio-fortified-crop/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariBioFortifiedCropController.update);
router.delete('/bio-fortified-crop/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariBioFortifiedCropController.delete);

// Extension Activity Routes
router.post('/extension-activity', requireRole(['kvk_admin', 'kvk_user', 'super_admin', 'icar_admin', 'atari_admin']), nariExtensionActivityController.create);
router.get('/extension-activity', nariExtensionActivityController.getAll);
router.get('/extension-activity/:id', nariExtensionActivityController.getById);
router.put('/extension-activity/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariExtensionActivityController.update);
router.delete('/extension-activity/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariExtensionActivityController.delete);

// Nutritional Garden Routes
router.post('/nutritional-garden', requireRole(['kvk_admin', 'kvk_user', 'super_admin', 'icar_admin', 'atari_admin']), nariNutritionalGardenController.create);
router.get('/nutritional-garden', nariNutritionalGardenController.getAll);
router.get('/nutritional-garden/:id', nariNutritionalGardenController.getById);
router.put('/nutritional-garden/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariNutritionalGardenController.update);
router.delete('/nutritional-garden/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariNutritionalGardenController.delete);

// Value Addition Routes
router.post('/value-addition', requireRole(['kvk_admin', 'kvk_user', 'super_admin', 'icar_admin', 'atari_admin']), nariValueAdditionController.create);
router.get('/value-addition', nariValueAdditionController.getAll);
router.get('/value-addition/:id', nariValueAdditionController.getById);
router.put('/value-addition/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariValueAdditionController.update);
router.delete('/value-addition/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariValueAdditionController.delete);

// Training Programme Routes
router.post('/training-programme', requireRole(['kvk_admin', 'kvk_user', 'super_admin', 'icar_admin', 'atari_admin']), nariTrainingController.create);
router.get('/training-programme', nariTrainingController.getAll);
router.get('/training-programme/:id', nariTrainingController.getById);
router.put('/training-programme/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariTrainingController.update);
router.delete('/training-programme/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), nariTrainingController.delete);

module.exports = router;
