const express = require('express');
const router = express.Router();
const vipVisitorsController = require('../../controllers/forms/vipVisitorsController');
const { authenticateToken } = require('../../middleware/auth');

router.use(authenticateToken);

router.get('/dignitary-types', vipVisitorsController.findAllDignitaryTypes);
router.get('/', vipVisitorsController.findAll);
router.get('/:id', vipVisitorsController.findById);
router.post('/', vipVisitorsController.create);
router.patch('/:id', vipVisitorsController.update);
router.delete('/:id', vipVisitorsController.delete);

module.exports = router;
