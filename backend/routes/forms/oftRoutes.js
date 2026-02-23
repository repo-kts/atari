const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const oftController = require('../../controllers/forms/oftController.js');

router.use(authenticateToken);

router.post('/', oftController.create);
router.get('/', oftController.getAll);
router.get('/:id', oftController.getById);
router.patch('/:id', oftController.update);
router.delete('/:id', oftController.delete);

module.exports = router;
