const express = require('express');
const router = express.Router();
const cfldTechnicalParameterController = require('../../controllers/forms/cfldTechnicalParameterController.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

router.get('/', cfldTechnicalParameterController.findAll);
router.get('/:id', cfldTechnicalParameterController.findById);
router.post('/', cfldTechnicalParameterController.create);
router.put('/:id', cfldTechnicalParameterController.update);
router.patch('/:id', cfldTechnicalParameterController.update);
router.post('/:id/transfer-next-year', cfldTechnicalParameterController.transferToNextYear);
router.post('/:id/revoke-transfer', cfldTechnicalParameterController.revokeTransfer);
router.post('/:id/mark-completed', cfldTechnicalParameterController.markCompleted);
router.delete('/:id', cfldTechnicalParameterController.delete);

module.exports = router;
