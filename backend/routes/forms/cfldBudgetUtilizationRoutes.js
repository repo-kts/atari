const express = require('express');
const router = express.Router();
const cfldBudgetUtilizationController = require('../../controllers/forms/cfldBudgetUtilizationController');
const { authenticateToken } = require('../../middleware/auth');

router.post('/', authenticateToken, cfldBudgetUtilizationController.create);
router.get('/', authenticateToken, cfldBudgetUtilizationController.findAll);
router.get('/:id', authenticateToken, cfldBudgetUtilizationController.findById);
router.put('/:id', authenticateToken, cfldBudgetUtilizationController.update);
router.patch('/:id', authenticateToken, cfldBudgetUtilizationController.update);
router.delete('/:id', authenticateToken, cfldBudgetUtilizationController.delete);

module.exports = router;
