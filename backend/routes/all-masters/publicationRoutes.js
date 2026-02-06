const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const publicationController = require('../../controllers/all-masters/publicationController.js');

// Apply authentication and authorization middleware
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============================================
// Publication Item Routes
// ============================================

router.get('/publication-items', publicationController.getAllPublicationItems);
router.get('/publication-items/:id', publicationController.getPublicationItemById);
router.post('/publication-items', publicationController.createPublicationItem);
router.put('/publication-items/:id', publicationController.updatePublicationItem);
router.delete('/publication-items/:id', publicationController.deletePublicationItem);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', publicationController.getStats);

module.exports = router;
