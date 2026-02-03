const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const oftFldController = require('../../controllers/all-masters/oftFldController.js');

// Apply authentication and authorization middleware
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============================================
// OFT Routes
// ============================================

// OFT Subject Routes
router.get('/oft/subjects', oftFldController.getAllOftSubjects);
router.get('/oft/subjects/:id', oftFldController.getOftSubjectById);
router.post('/oft/subjects', oftFldController.createOftSubject);
router.put('/oft/subjects/:id', oftFldController.updateOftSubject);
router.delete('/oft/subjects/:id', oftFldController.deleteOftSubject);

// OFT Thematic Area Routes
router.get('/oft/thematic-areas', oftFldController.getAllOftThematicAreas);
router.get('/oft/thematic-areas/:id', oftFldController.getOftThematicAreaById);
router.post('/oft/thematic-areas', oftFldController.createOftThematicArea);
router.put('/oft/thematic-areas/:id', oftFldController.updateOftThematicArea);
router.delete('/oft/thematic-areas/:id', oftFldController.deleteOftThematicArea);

// OFT Hierarchical Routes
router.get('/oft/subjects/:subjectId/thematic-areas', oftFldController.getOftThematicAreasBySubject);

// ============================================
// FLD Routes
// ============================================

// Sector Routes
router.get('/fld/sectors', oftFldController.getAllSectors);
router.get('/fld/sectors/:id', oftFldController.getSectorById);
router.post('/fld/sectors', oftFldController.createSector);
router.put('/fld/sectors/:id', oftFldController.updateSector);
router.delete('/fld/sectors/:id', oftFldController.deleteSector);

// FLD Thematic Area Routes
router.get('/fld/thematic-areas', oftFldController.getAllFldThematicAreas);
router.get('/fld/thematic-areas/:id', oftFldController.getFldThematicAreaById);
router.post('/fld/thematic-areas', oftFldController.createFldThematicArea);
router.put('/fld/thematic-areas/:id', oftFldController.updateFldThematicArea);
router.delete('/fld/thematic-areas/:id', oftFldController.deleteFldThematicArea);

// FLD Category Routes
router.get('/fld/categories', oftFldController.getAllFldCategories);
router.get('/fld/categories/:id', oftFldController.getFldCategoryById);
router.post('/fld/categories', oftFldController.createFldCategory);
router.put('/fld/categories/:id', oftFldController.updateFldCategory);
router.delete('/fld/categories/:id', oftFldController.deleteFldCategory);

// FLD Subcategory Routes
router.get('/fld/subcategories', oftFldController.getAllFldSubcategories);
router.get('/fld/subcategories/:id', oftFldController.getFldSubcategoryById);
router.post('/fld/subcategories', oftFldController.createFldSubcategory);
router.put('/fld/subcategories/:id', oftFldController.updateFldSubcategory);
router.delete('/fld/subcategories/:id', oftFldController.deleteFldSubcategory);

// FLD Crop Routes
router.get('/fld/crops', oftFldController.getAllFldCrops);
router.get('/fld/crops/:id', oftFldController.getFldCropById);
router.post('/fld/crops', oftFldController.createFldCrop);
router.put('/fld/crops/:id', oftFldController.updateFldCrop);
router.delete('/fld/crops/:id', oftFldController.deleteFldCrop);

// FLD Hierarchical Routes
router.get('/fld/sectors/:sectorId/thematic-areas', oftFldController.getFldThematicAreasBySector);
router.get('/fld/sectors/:sectorId/categories', oftFldController.getFldCategoriesBySector);
router.get('/fld/categories/:categoryId/subcategories', oftFldController.getFldSubcategoriesByCategory);
router.get('/fld/subcategories/:subCategoryId/crops', oftFldController.getFldCropsBySubcategory);

// ============================================
// Season Routes
// ============================================

router.get('/seasons', oftFldController.getAllSeasons);
router.get('/seasons/:id', oftFldController.getSeasonById);
router.post('/seasons', oftFldController.createSeason);
router.put('/seasons/:id', oftFldController.updateSeason);
router.delete('/seasons/:id', oftFldController.deleteSeason);

// ============================================
// CropType Routes
// ============================================

router.get('/crop-types', oftFldController.getAllCropTypes);
router.get('/crop-types/:id', oftFldController.getCropTypeById);
router.post('/crop-types', oftFldController.createCropType);
router.put('/crop-types/:id', oftFldController.updateCropType);
router.delete('/crop-types/:id', oftFldController.deleteCropType);

// ============================================
// CFLD Routes
// ============================================

router.get('/cfld/crops', oftFldController.getAllCfldCrops);
router.get('/cfld/crops/:id', oftFldController.getCfldCropById);
router.post('/cfld/crops', oftFldController.createCfldCrop);
router.put('/cfld/crops/:id', oftFldController.updateCfldCrop);
router.delete('/cfld/crops/:id', oftFldController.deleteCfldCrop);
router.get('/cfld/crops/season/:seasonId/type/:typeId', oftFldController.getCfldCropsBySeasonAndType);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', oftFldController.getStats);

module.exports = router;
