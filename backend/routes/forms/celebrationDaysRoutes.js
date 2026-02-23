const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const celebrationDaysController = require('../../controllers/forms/celebrationDaysController.js');

router.use(authenticateToken);

router.post('/', celebrationDaysController.create);
router.get('/', celebrationDaysController.getAll);
router.get('/:id', celebrationDaysController.getById);
router.put('/:id', celebrationDaysController.update);
router.delete('/:id', celebrationDaysController.delete);

module.exports = router;
