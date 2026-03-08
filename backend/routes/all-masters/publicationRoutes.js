const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const publicationController = require('../../controllers/all-masters/publicationController.js');

/**
 * Publication Master Routes
 *
 * GET (read) endpoints require only authentication — master data is
 * non-sensitive reference/lookup data used as dropdown sources across many
 * forms. Gating reads by master-specific permissions would block form users
 * who have form permissions but not master-management permissions.
 *
 * POST/PUT/DELETE (write) endpoints require granular master module permissions
 * controlled by the Role Permission Editor.
 *
 * Master management PAGES are still protected on the frontend by sidebar
 * filtering (hasPermission) and ProtectedRoute — users without the VIEW
 * permission on a master module won't see or navigate to those pages.
 */

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Publication Item Routes  (moduleCode: all_masters_publication_master)
// ============================================

router.get('/publication-items',     publicationController.getAllPublicationItems);
router.get('/publication-items/:id', publicationController.getPublicationItemById);
router.post('/publication-items',    requirePermission('all_masters_publication_master', 'ADD'),  publicationController.createPublicationItem);
router.put('/publication-items/:id', requirePermission('all_masters_publication_master', 'EDIT'), publicationController.updatePublicationItem);
router.delete('/publication-items/:id', requirePermission('all_masters_publication_master', 'DELETE'), publicationController.deletePublicationItem);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', publicationController.getStats);

module.exports = router;
