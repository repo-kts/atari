const express = require('express');
const router = express.Router();
const nykTrainingController = require('../../controllers/forms/nykTrainingController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

router.get('/', nykTrainingController.findAll);
router.get('/:id', nykTrainingController.findById);
router.post('/', nykTrainingController.create);
router.patch('/:id', nykTrainingController.update);
router.delete('/:id', nykTrainingController.delete);

module.exports = router;
