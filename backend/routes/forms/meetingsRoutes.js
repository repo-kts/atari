const express = require('express');
const router = express.Router();
const meetingsController = require('../../controllers/forms/meetingsController');
const { authenticateToken } = require('../../middleware/auth');

// Use auth middleware for all routes
router.use(authenticateToken);

// SAC Meetings
router.post('/sac', meetingsController.sac.create);
router.get('/sac', meetingsController.sac.findAll);
router.get('/sac/:id', meetingsController.sac.findById);
router.patch('/sac/:id', meetingsController.sac.update);
router.delete('/sac/:id', meetingsController.sac.delete);

// Other Meetings
router.post('/other', meetingsController.other.create);
router.get('/other', meetingsController.other.findAll);
router.get('/other/:id', meetingsController.other.findById);
router.patch('/other/:id', meetingsController.other.update);
router.delete('/other/:id', meetingsController.other.delete);

module.exports = router;
