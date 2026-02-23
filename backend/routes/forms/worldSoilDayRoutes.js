const express = require('express');
const router = express.Router();
const worldSoilDayController = require('../../controllers/forms/worldSoilDayController.js');
const { authenticateToken } = require('../../middleware/auth.js');

router.post('/', authenticateToken, worldSoilDayController.create);
router.get('/', authenticateToken, worldSoilDayController.findAll);
router.get('/:id', authenticateToken, worldSoilDayController.findById);
router.patch('/:id', authenticateToken, worldSoilDayController.update);
router.delete('/:id', authenticateToken, worldSoilDayController.delete);

module.exports = router;
