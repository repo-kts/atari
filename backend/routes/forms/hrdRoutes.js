const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const hrdController = require('../../controllers/forms/hrdController.js');

router.use(authenticateToken);

// Create a new HRD program
router.post('/', hrdController.create);

// Get all HRD programs
router.get('/', hrdController.getAll);

// Get HRD program by ID
router.get('/:id', hrdController.getById);

// Update HRD program
router.put('/:id', hrdController.update);

// Delete HRD program
router.delete('/:id', hrdController.delete);

module.exports = router;
