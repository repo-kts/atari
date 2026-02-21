const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const publicationController = require('../../controllers/all-masters/publicationController.js');

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Publication Item Routes  (moduleCode: all_masters_publication_master)
// ============================================

router.get('/publication-items',     requirePermission('all_masters_publication_master', 'VIEW'), publicationController.getAllPublicationItems);
router.get('/publication-items/:id', requirePermission('all_masters_publication_master', 'VIEW'), publicationController.getPublicationItemById);
router.post('/publication-items',    requirePermission('all_masters_publication_master', 'ADD'),  publicationController.createPublicationItem);
router.put('/publication-items/:id', requirePermission('all_masters_publication_master', 'EDIT'), publicationController.updatePublicationItem);
router.delete('/publication-items/:id', requirePermission('all_masters_publication_master', 'DELETE'), publicationController.deletePublicationItem);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', requirePermission('all_masters_publication_master', 'VIEW'), publicationController.getStats);

module.exports = router;
