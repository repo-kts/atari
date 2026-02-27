const express = require('express');
const router = express.Router();
const cfldTechnicalParameterController = require('../../controllers/forms/cfldTechnicalParameterController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', cfldTechnicalParameterController.findAll);
router.get('/:id', cfldTechnicalParameterController.findById);
router.post('/', cfldTechnicalParameterController.create);
router.put('/:id', cfldTechnicalParameterController.update);
router.patch('/:id', cfldTechnicalParameterController.update);
router.delete('/:id', cfldTechnicalParameterController.delete);

module.exports = router;
