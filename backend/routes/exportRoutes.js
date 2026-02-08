const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken } = require('../middleware/auth.js');

// Mount point: /api/admin/masters
// Route: /api/admin/masters/exportData
router.post('/exportData', authenticateToken, exportController.exportData);

module.exports = router;
