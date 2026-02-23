const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const otherExtensionActivityController = require('../../controllers/forms/otherExtensionActivityController.js');

router.use(authenticateToken);

// Create a new Other Extension Activity
router.post('/', otherExtensionActivityController.create);

// Get all Other Extension Activities
router.get('/', otherExtensionActivityController.getAll);

// Get a specific Other Extension Activity by ID
router.get('/:id', otherExtensionActivityController.getById);

// Update an Other Extension Activity
router.put('/:id', otherExtensionActivityController.update);

// Delete an Other Extension Activity
router.delete('/:id', otherExtensionActivityController.delete);

module.exports = router;
