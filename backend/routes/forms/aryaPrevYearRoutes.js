const express = require('express');
const router = express.Router();
const aryaPrevYearController = require('../../controllers/forms/aryaPrevYearController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

router.get('/', aryaPrevYearController.getAll);
router.get('/:id', aryaPrevYearController.getById);
router.post('/', aryaPrevYearController.create);
router.put('/:id', aryaPrevYearController.update);
router.patch('/:id', aryaPrevYearController.update);
router.delete('/:id', aryaPrevYearController.delete);

module.exports = router;
