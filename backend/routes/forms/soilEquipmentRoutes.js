const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const soilEquipmentController = require('../../controllers/forms/soilEquipmentController.js');

// REQUIRED: populates req.user with kvkId, roleName, etc. for KVK data isolation
router.use(authenticateToken);

router.post('/', soilEquipmentController.create);
router.get('/', soilEquipmentController.getAll);
router.get('/analysis-types', soilEquipmentController.getAnalysisTypes);
router.get('/:id', soilEquipmentController.getById);
router.patch('/:id', soilEquipmentController.update);
router.delete('/:id', soilEquipmentController.delete);

module.exports = router;
