const express = require('express');
const router = express.Router();
const fpoManagementController = require('../../controllers/forms/fpoManagementController');
const { authenticateToken } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', fpoManagementController.findAll);
router.get('/:id', fpoManagementController.findById);
router.post('/', fpoManagementController.create);
router.put('/:id', fpoManagementController.update);
router.patch('/:id', fpoManagementController.update);
router.delete('/:id', fpoManagementController.delete);

module.exports = router;
