const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const techWeekController = require('../../controllers/forms/techWeekController.js');

router.use(authenticateToken);

router.post('/', techWeekController.create);
router.get('/', techWeekController.getAll);
router.get('/:id', techWeekController.getById);
router.put('/:id', techWeekController.update);
router.delete('/:id', techWeekController.delete);

module.exports = router;
