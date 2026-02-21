const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const otherMastersController = require('../../controllers/all-masters/otherMastersController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Helper for restricted actions (create, update, delete)
const requireSuperAdmin = requireRole(['super_admin']);
const allowAllRoles = requireRole(['super_admin', 'admin', 'kvk', 'zpd', 'icar']);

// ============================================
// Season Routes
// ============================================

router.get('/seasons', allowAllRoles, otherMastersController.getAllSeasons);
router.get('/seasons/:id', allowAllRoles, otherMastersController.getSeasonById);
router.post('/seasons', requireSuperAdmin, otherMastersController.createSeason);
router.put('/seasons/:id', requireSuperAdmin, otherMastersController.updateSeason);
router.delete('/seasons/:id', requireSuperAdmin, otherMastersController.deleteSeason);

// ============================================
// Sanctioned Post Routes
// ============================================

router.get('/sanctioned-posts', allowAllRoles, otherMastersController.getAllSanctionedPosts);
router.get('/sanctioned-posts/:id', allowAllRoles, otherMastersController.getSanctionedPostById);
router.post('/sanctioned-posts', requireSuperAdmin, otherMastersController.createSanctionedPost);
router.put('/sanctioned-posts/:id', requireSuperAdmin, otherMastersController.updateSanctionedPost);
router.delete('/sanctioned-posts/:id', requireSuperAdmin, otherMastersController.deleteSanctionedPost);

// ============================================
// Year Routes
// ============================================

router.get('/years', allowAllRoles, otherMastersController.getAllYears);
router.get('/years/:id', allowAllRoles, otherMastersController.getYearById);
router.post('/years', requireSuperAdmin, otherMastersController.createYear);
router.put('/years/:id', requireSuperAdmin, otherMastersController.updateYear);
router.delete('/years/:id', requireSuperAdmin, otherMastersController.deleteYear);

module.exports = router;
