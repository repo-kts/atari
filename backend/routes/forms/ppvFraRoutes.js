const express = require('express');
const router = express.Router();
const ppvFraController = require('../../controllers/forms/ppvFraController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

// Training & Awareness routes
router.get('/training', ppvFraController.findAllTrainings);
router.get('/training/:id', ppvFraController.findTrainingById);
router.post('/training', ppvFraController.createTraining);
router.patch('/training/:id', ppvFraController.updateTraining);
router.delete('/training/:id', ppvFraController.deleteTraining);

// Plant Varieties routes
router.get('/plant-varieties', ppvFraController.findAllPlantVarieties);
router.get('/plant-varieties/:id', ppvFraController.findPlantVarietyById);
router.post('/plant-varieties', ppvFraController.createPlantVariety);
router.patch('/plant-varieties/:id', ppvFraController.updatePlantVariety);
router.delete('/plant-varieties/:id', ppvFraController.deletePlantVariety);

module.exports = router;
