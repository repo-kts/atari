const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const fldController = require('../../controllers/forms/fldController.js');

router.use(authenticateToken);

router.post('/', fldController.create);
router.get('/', fldController.getAll);
router.get('/:id', fldController.getById);
router.patch('/:id', fldController.update);
router.delete('/:id', fldController.delete);

module.exports = router;
