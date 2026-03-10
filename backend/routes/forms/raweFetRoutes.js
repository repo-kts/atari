const express = require('express');
const router = express.Router();
const raweFetController = require('../../controllers/forms/raweFetController');
const { authenticateToken } = require('../../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/attachment-types', raweFetController.findAllAttachmentTypes);
router.get('/', raweFetController.findAll);
router.get('/:id', raweFetController.findById);
router.post('/', raweFetController.create);
router.patch('/:id', raweFetController.update);
router.delete('/:id', raweFetController.delete);

module.exports = router;
