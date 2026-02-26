const express = require('express');
const router = express.Router();
const hrdController = require('../../controllers/forms/hrdController');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');

// All routes require authentication
router.use(authenticateToken);

router.post('/', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), hrdController.create);
router.get('/', hrdController.findAll);
router.get('/:id', hrdController.findById);
router.patch('/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), hrdController.update);
router.delete('/:id', requireRole(['kvk_admin', 'kvk_user', 'super_admin']), hrdController.delete);

module.exports = router;
