const express = require('express');
const router = express.Router();
const craController = require('../../controllers/forms/craExtensionActivityController.js');
const { authenticateToken } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

// CRA Details Routes
router.get('/details', craController.getAllDetails);
router.post('/details', craController.createDetails);
router.get('/details/:id', craController.getDetailsById);
router.patch('/details/:id', craController.updateDetails);
router.delete('/details/:id', craController.deleteDetails);

// Extension Activity Routes
router.get('/extension', craController.getAll);
router.post('/extension', craController.create);
router.get('/extension/:id', craController.getById);
router.patch('/extension/:id', craController.update);
router.delete('/extension/:id', craController.delete);

module.exports = router;
