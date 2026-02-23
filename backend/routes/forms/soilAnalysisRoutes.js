const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const soilAnalysisController = require('../../controllers/forms/soilAnalysisController.js');

router.use(authenticateToken);

router.post('/', soilAnalysisController.create);
router.get('/', soilAnalysisController.getAll);
router.get('/:id', soilAnalysisController.getById);
router.patch('/:id', soilAnalysisController.update);
router.delete('/:id', soilAnalysisController.delete);

module.exports = router;
