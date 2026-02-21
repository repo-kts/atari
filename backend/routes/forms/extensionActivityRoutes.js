const express = require('express');
const router = express.Router();
const extensionActivityController = require('../../controllers/forms/extensionActivityController.js');

// Create a new Extension Activity
router.post('/', extensionActivityController.create);

// Get all Extension Activities
router.get('/', extensionActivityController.getAll);

// Get a specific Extension Activity by ID
router.get('/:id', extensionActivityController.getById);

// Update an Extension Activity
router.put('/:id', extensionActivityController.update);

// Delete an Extension Activity
router.delete('/:id', extensionActivityController.delete);

module.exports = router;
