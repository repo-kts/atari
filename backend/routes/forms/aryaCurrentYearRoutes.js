const express = require('express');
const router = express.Router();
const aryaCurrentYearController = require('../../controllers/forms/aryaCurrentYearController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

router.get('/', aryaCurrentYearController.getAll);
router.get('/:id', aryaCurrentYearController.getById);
router.post('/', aryaCurrentYearController.create);
router.put('/:id', aryaCurrentYearController.update);
router.patch('/:id', aryaCurrentYearController.update);
router.delete('/:id', aryaCurrentYearController.delete);

module.exports = router;
