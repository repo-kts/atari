const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const otherMastersController = require('../../controllers/all-masters/otherMastersController.js');

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Season Routes
// ============================================

router.get('/seasons',     requirePermission('all_masters_season_master', 'VIEW'), otherMastersController.getAllSeasons);
router.get('/seasons/:id', requirePermission('all_masters_season_master', 'VIEW'), otherMastersController.getSeasonById);
router.post('/seasons',    requirePermission('all_masters_season_master', 'ADD'),  otherMastersController.createSeason);
router.put('/seasons/:id', requirePermission('all_masters_season_master', 'EDIT'), otherMastersController.updateSeason);
router.delete('/seasons/:id', requirePermission('all_masters_season_master', 'DELETE'), otherMastersController.deleteSeason);

// ============================================
// Sanctioned Post Routes
// ============================================

router.get('/sanctioned-posts',     requirePermission('all_masters_sanctioned_post_master', 'VIEW'), otherMastersController.getAllSanctionedPosts);
router.get('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'VIEW'), otherMastersController.getSanctionedPostById);
router.post('/sanctioned-posts',    requirePermission('all_masters_sanctioned_post_master', 'ADD'),  otherMastersController.createSanctionedPost);
router.put('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'EDIT'), otherMastersController.updateSanctionedPost);
router.delete('/sanctioned-posts/:id', requirePermission('all_masters_sanctioned_post_master', 'DELETE'), otherMastersController.deleteSanctionedPost);

// ============================================
// Year Routes
// ============================================

router.get('/years',     requirePermission('all_masters_year_master', 'VIEW'), otherMastersController.getAllYears);
router.get('/years/:id', requirePermission('all_masters_year_master', 'VIEW'), otherMastersController.getYearById);
router.post('/years',    requirePermission('all_masters_year_master', 'ADD'),  otherMastersController.createYear);
router.put('/years/:id', requirePermission('all_masters_year_master', 'EDIT'), otherMastersController.updateYear);
router.delete('/years/:id', requirePermission('all_masters_year_master', 'DELETE'), otherMastersController.deleteYear);

module.exports = router;
