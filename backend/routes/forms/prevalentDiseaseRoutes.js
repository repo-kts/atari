const express = require('express');
const router = express.Router();
const prevalentDiseaseController = require('../../controllers/forms/prevalentDiseaseController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

// Crop Routes
router.get('/crops', prevalentDiseaseController.cropFindAll);
router.get('/crops/:id', prevalentDiseaseController.cropFindById);
router.post('/crops', prevalentDiseaseController.cropCreate);
router.patch('/crops/:id', prevalentDiseaseController.cropUpdate);
router.delete('/crops/:id', prevalentDiseaseController.cropDelete);

// Livestock Routes
router.get('/livestock', prevalentDiseaseController.livestockFindAll);
router.get('/livestock/:id', prevalentDiseaseController.livestockFindById);
router.post('/livestock', prevalentDiseaseController.livestockCreate);
router.patch('/livestock/:id', prevalentDiseaseController.livestockUpdate);
router.delete('/livestock/:id', prevalentDiseaseController.livestockDelete);

module.exports = router;
