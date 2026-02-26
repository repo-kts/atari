const express = require('express');
const router = express.Router();
const fpoCbboDetailsController = require('../../controllers/forms/fpoCbboDetailsController');
const { authenticateToken } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', fpoCbboDetailsController.findAll);
router.get('/:id', fpoCbboDetailsController.findById);
router.post('/', fpoCbboDetailsController.create);
router.put('/:id', fpoCbboDetailsController.update);
router.patch('/:id', fpoCbboDetailsController.update);
router.delete('/:id', fpoCbboDetailsController.delete);

module.exports = router;
