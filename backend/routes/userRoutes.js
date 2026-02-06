const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const userController = require('../controllers/userController.js');
=======
const userController = require('../controllers/userController');
>>>>>>> my-merged-work

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
