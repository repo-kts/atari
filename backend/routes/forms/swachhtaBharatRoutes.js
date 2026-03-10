const express = require('express');
const router = express.Router();
const swachhtaBharatController = require('../../controllers/forms/swachhtaBharatController');
const { authenticateToken } = require('../../middleware/auth');

// Use auth middleware for all routes
router.use(authenticateToken);

// Swachhta Hi Sewa
router.post('/sewa', swachhtaBharatController.hiSewa.create);
router.get('/sewa', swachhtaBharatController.hiSewa.findAll);
router.get('/sewa/:id', swachhtaBharatController.hiSewa.findById);
router.patch('/sewa/:id', swachhtaBharatController.hiSewa.update);
router.delete('/sewa/:id', swachhtaBharatController.hiSewa.delete);

// Swachhta Pakhwada
router.post('/pakhwada', swachhtaBharatController.pakhwada.create);
router.get('/pakhwada', swachhtaBharatController.pakhwada.findAll);
router.get('/pakhwada/:id', swachhtaBharatController.pakhwada.findById);
router.patch('/pakhwada/:id', swachhtaBharatController.pakhwada.update);
router.delete('/pakhwada/:id', swachhtaBharatController.pakhwada.delete);

// Swachh Quarterly Expenditure (Budget)
router.post('/budget', swachhtaBharatController.budget.create);
router.get('/budget', swachhtaBharatController.budget.findAll);
router.get('/budget/:id', swachhtaBharatController.budget.findById);
router.patch('/budget/:id', swachhtaBharatController.budget.update);
router.delete('/budget/:id', swachhtaBharatController.budget.delete);

module.exports = router;
