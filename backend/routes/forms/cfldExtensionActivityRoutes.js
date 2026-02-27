const express = require('express');
const router = express.Router();
const cfldExtensionActivityController = require('../../controllers/forms/cfldExtensionActivityController');
const { authenticateToken } = require('../../middleware/auth');

router.post('/', authenticateToken, cfldExtensionActivityController.create);
router.get('/', authenticateToken, cfldExtensionActivityController.findAll);
router.get('/:id', authenticateToken, cfldExtensionActivityController.findById);
router.put('/:id', authenticateToken, cfldExtensionActivityController.update);
router.patch('/:id', authenticateToken, cfldExtensionActivityController.update);
router.delete('/:id', authenticateToken, cfldExtensionActivityController.delete);

module.exports = router;
