const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const otherMastersController = require('../../controllers/all-masters/otherMastersController.js');

// Apply authentication and authorization middleware
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============================================
// Season Routes
// ============================================

router.get('/seasons', otherMastersController.getAllSeasons);
router.get('/seasons/:id', otherMastersController.getSeasonById);
router.post('/seasons', otherMastersController.createSeason);
router.put('/seasons/:id', otherMastersController.updateSeason); 
router.delete('/seasons/:id', otherMastersController.deleteSeason);

// ============================================
// Sanctioned Post Routes
// ============================================

router.get('/sanctioned-posts', otherMastersController.getAllSanctionedPosts);
router.get('/sanctioned-posts/:id', otherMastersController.getSanctionedPostById);
router.post('/sanctioned-posts', otherMastersController.createSanctionedPost);
router.put('/sanctioned-posts/:id', otherMastersController.updateSanctionedPost);
router.delete('/sanctioned-posts/:id', otherMastersController.deleteSanctionedPost);

// ============================================
// Year Routes
// ============================================

router.get('/years', otherMastersController.getAllYears);
router.get('/years/:id', otherMastersController.getYearById);
router.post('/years', otherMastersController.createYear);
router.put('/years/:id', otherMastersController.updateYear);
router.delete('/years/:id', otherMastersController.deleteYear);

module.exports = router;
