const express = require('express');
const router = express.Router();
const seedHubController = require('../../controllers/forms/seedHubController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

router.get('/', seedHubController.getAll);
router.get('/:id', seedHubController.getById);
router.post('/', seedHubController.create);
router.put('/:id', seedHubController.update);
router.patch('/:id', seedHubController.update);
router.delete('/:id', seedHubController.delete);

module.exports = router;
