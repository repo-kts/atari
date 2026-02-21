const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const oftFldController = require('../../controllers/all-masters/oftFldController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Helper for restricted actions (create, update, delete)
const requireSuperAdmin = requireRole(['super_admin']);
const allowAllRoles = requireRole(['super_admin', 'admin', 'kvk', 'zpd', 'icar']);

// ============================================
// OFT Routes
// ============================================

// OFT Subject Routes
router.get('/oft/subjects', allowAllRoles, oftFldController.getAllOftSubjects);
router.get('/oft/subjects/:id', allowAllRoles, oftFldController.getOftSubjectById);
router.post('/oft/subjects', requireSuperAdmin, oftFldController.createOftSubject);
router.put('/oft/subjects/:id', requireSuperAdmin, oftFldController.updateOftSubject);
router.delete('/oft/subjects/:id', requireSuperAdmin, oftFldController.deleteOftSubject);

// OFT Thematic Area Routes
router.get('/oft/thematic-areas', allowAllRoles, oftFldController.getAllOftThematicAreas);
router.get('/oft/thematic-areas/:id', allowAllRoles, oftFldController.getOftThematicAreaById);
router.post('/oft/thematic-areas', requireSuperAdmin, oftFldController.createOftThematicArea);
router.put('/oft/thematic-areas/:id', requireSuperAdmin, oftFldController.updateOftThematicArea);
router.delete('/oft/thematic-areas/:id', requireSuperAdmin, oftFldController.deleteOftThematicArea);

// OFT Hierarchical Routes
router.get('/oft/subjects/:subjectId/thematic-areas', allowAllRoles, oftFldController.getOftThematicAreasBySubject);

// ============================================
// FLD Routes
// ============================================

// Sector Routes
router.get('/fld/sectors', allowAllRoles, oftFldController.getAllSectors);
router.get('/fld/sectors/:id', allowAllRoles, oftFldController.getSectorById);
router.post('/fld/sectors', requireSuperAdmin, oftFldController.createSector);
router.put('/fld/sectors/:id', requireSuperAdmin, oftFldController.updateSector);
router.delete('/fld/sectors/:id', requireSuperAdmin, oftFldController.deleteSector);

// FLD Thematic Area Routes
router.get('/fld/thematic-areas', allowAllRoles, oftFldController.getAllFldThematicAreas);
router.get('/fld/thematic-areas/:id', allowAllRoles, oftFldController.getFldThematicAreaById);
router.post('/fld/thematic-areas', requireSuperAdmin, oftFldController.createFldThematicArea);
router.put('/fld/thematic-areas/:id', requireSuperAdmin, oftFldController.updateFldThematicArea);
router.delete('/fld/thematic-areas/:id', requireSuperAdmin, oftFldController.deleteFldThematicArea);

// FLD Category Routes
router.get('/fld/categories', allowAllRoles, oftFldController.getAllFldCategories);
router.get('/fld/categories/:id', allowAllRoles, oftFldController.getFldCategoryById);
router.post('/fld/categories', requireSuperAdmin, oftFldController.createFldCategory);
router.put('/fld/categories/:id', requireSuperAdmin, oftFldController.updateFldCategory);
router.delete('/fld/categories/:id', requireSuperAdmin, oftFldController.deleteFldCategory);

// FLD Subcategory Routes
router.get('/fld/subcategories', allowAllRoles, oftFldController.getAllFldSubcategories);
router.get('/fld/subcategories/:id', allowAllRoles, oftFldController.getFldSubcategoryById);
router.post('/fld/subcategories', requireSuperAdmin, oftFldController.createFldSubcategory);
router.put('/fld/subcategories/:id', requireSuperAdmin, oftFldController.updateFldSubcategory);
router.delete('/fld/subcategories/:id', requireSuperAdmin, oftFldController.deleteFldSubcategory);

// FLD Crop Routes
router.get('/fld/crops', allowAllRoles, oftFldController.getAllFldCrops);
router.get('/fld/crops/:id', allowAllRoles, oftFldController.getFldCropById);
router.post('/fld/crops', requireSuperAdmin, oftFldController.createFldCrop);
router.put('/fld/crops/:id', requireSuperAdmin, oftFldController.updateFldCrop);
router.delete('/fld/crops/:id', requireSuperAdmin, oftFldController.deleteFldCrop);

// FLD Hierarchical Routes
router.get('/fld/sectors/:sectorId/thematic-areas', allowAllRoles, oftFldController.getFldThematicAreasBySector);
router.get('/fld/sectors/:sectorId/categories', allowAllRoles, oftFldController.getFldCategoriesBySector);
router.get('/fld/categories/:categoryId/subcategories', allowAllRoles, oftFldController.getFldSubcategoriesByCategory);
router.get('/fld/subcategories/:subCategoryId/crops', allowAllRoles, oftFldController.getFldCropsBySubcategory);

// ============================================
// Season Routes
// ============================================

router.get('/seasons', allowAllRoles, oftFldController.getAllSeasons);
router.get('/seasons/:id', allowAllRoles, oftFldController.getSeasonById);
router.post('/seasons', requireSuperAdmin, oftFldController.createSeason);
router.put('/seasons/:id', requireSuperAdmin, oftFldController.updateSeason);
router.delete('/seasons/:id', requireSuperAdmin, oftFldController.deleteSeason);

// ============================================
// CropType Routes
// ============================================

router.get('/crop-types', allowAllRoles, oftFldController.getAllCropTypes);
router.get('/crop-types/:id', allowAllRoles, oftFldController.getCropTypeById);
router.post('/crop-types', requireSuperAdmin, oftFldController.createCropType);
router.put('/crop-types/:id', requireSuperAdmin, oftFldController.updateCropType);
router.delete('/crop-types/:id', requireSuperAdmin, oftFldController.deleteCropType);

// ============================================
// CFLD Routes
// ============================================

router.get('/cfld/crops', allowAllRoles, oftFldController.getAllCfldCrops);
router.get('/cfld/crops/:id', allowAllRoles, oftFldController.getCfldCropById);
router.post('/cfld/crops', requireSuperAdmin, oftFldController.createCfldCrop);
router.put('/cfld/crops/:id', requireSuperAdmin, oftFldController.updateCfldCrop);
router.delete('/cfld/crops/:id', requireSuperAdmin, oftFldController.deleteCfldCrop);
router.get('/cfld/crops/season/:seasonId/type/:typeId', allowAllRoles, oftFldController.getCfldCropsBySeasonAndType);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', allowAllRoles, oftFldController.getStats);

module.exports = router;
