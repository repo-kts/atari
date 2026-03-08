const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const oftFldController = require('../../controllers/all-masters/oftFldController.js');

/**
 * OFT / FLD / CFLD Master Routes
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
// OFT Routes  (moduleCode: all_masters_oft_master)
// ============================================

// OFT Subject Routes
router.get('/oft/subjects',     oftFldController.getAllOftSubjects);
router.get('/oft/subjects/:id', oftFldController.getOftSubjectById);
router.post('/oft/subjects',    requirePermission('all_masters_oft_master', 'ADD'),  oftFldController.createOftSubject);
router.put('/oft/subjects/:id', requirePermission('all_masters_oft_master', 'EDIT'), oftFldController.updateOftSubject);
router.delete('/oft/subjects/:id', requirePermission('all_masters_oft_master', 'DELETE'), oftFldController.deleteOftSubject);

// OFT Thematic Area Routes
router.get('/oft/thematic-areas',     oftFldController.getAllOftThematicAreas);
router.get('/oft/thematic-areas/:id', oftFldController.getOftThematicAreaById);
router.post('/oft/thematic-areas',    requirePermission('all_masters_oft_master', 'ADD'),  oftFldController.createOftThematicArea);
router.put('/oft/thematic-areas/:id', requirePermission('all_masters_oft_master', 'EDIT'), oftFldController.updateOftThematicArea);
router.delete('/oft/thematic-areas/:id', requirePermission('all_masters_oft_master', 'DELETE'), oftFldController.deleteOftThematicArea);

// OFT Hierarchical
router.get('/oft/subjects/:subjectId/thematic-areas', oftFldController.getOftThematicAreasBySubject);

// ============================================
// FLD Routes  (moduleCode: all_masters_fld_master)
// ============================================

// Sector Routes
router.get('/fld/sectors',     oftFldController.getAllSectors);
router.get('/fld/sectors/:id', oftFldController.getSectorById);
router.post('/fld/sectors',    requirePermission('all_masters_fld_master', 'ADD'),  oftFldController.createSector);
router.put('/fld/sectors/:id', requirePermission('all_masters_fld_master', 'EDIT'), oftFldController.updateSector);
router.delete('/fld/sectors/:id', requirePermission('all_masters_fld_master', 'DELETE'), oftFldController.deleteSector);

// FLD Thematic Area Routes
router.get('/fld/thematic-areas',     oftFldController.getAllFldThematicAreas);
router.get('/fld/thematic-areas/:id', oftFldController.getFldThematicAreaById);
router.post('/fld/thematic-areas',    requirePermission('all_masters_fld_master', 'ADD'),  oftFldController.createFldThematicArea);
router.put('/fld/thematic-areas/:id', requirePermission('all_masters_fld_master', 'EDIT'), oftFldController.updateFldThematicArea);
router.delete('/fld/thematic-areas/:id', requirePermission('all_masters_fld_master', 'DELETE'), oftFldController.deleteFldThematicArea);

// FLD Category Routes
router.get('/fld/categories',     oftFldController.getAllFldCategories);
router.get('/fld/categories/:id', oftFldController.getFldCategoryById);
router.post('/fld/categories',    requirePermission('all_masters_fld_master', 'ADD'),  oftFldController.createFldCategory);
router.put('/fld/categories/:id', requirePermission('all_masters_fld_master', 'EDIT'), oftFldController.updateFldCategory);
router.delete('/fld/categories/:id', requirePermission('all_masters_fld_master', 'DELETE'), oftFldController.deleteFldCategory);

// FLD Subcategory Routes
router.get('/fld/subcategories',     oftFldController.getAllFldSubcategories);
router.get('/fld/subcategories/:id', oftFldController.getFldSubcategoryById);
router.post('/fld/subcategories',    requirePermission('all_masters_fld_master', 'ADD'),  oftFldController.createFldSubcategory);
router.put('/fld/subcategories/:id', requirePermission('all_masters_fld_master', 'EDIT'), oftFldController.updateFldSubcategory);
router.delete('/fld/subcategories/:id', requirePermission('all_masters_fld_master', 'DELETE'), oftFldController.deleteFldSubcategory);

// FLD Crop Routes
router.get('/fld/crops',     oftFldController.getAllFldCrops);
router.get('/fld/crops/:id', oftFldController.getFldCropById);
router.post('/fld/crops',    requirePermission('all_masters_fld_master', 'ADD'),  oftFldController.createFldCrop);
router.put('/fld/crops/:id', requirePermission('all_masters_fld_master', 'EDIT'), oftFldController.updateFldCrop);
router.delete('/fld/crops/:id', requirePermission('all_masters_fld_master', 'DELETE'), oftFldController.deleteFldCrop);

// FLD Hierarchical
router.get('/fld/sectors/:sectorId/thematic-areas',          oftFldController.getFldThematicAreasBySector);
router.get('/fld/sectors/:sectorId/categories',              oftFldController.getFldCategoriesBySector);
router.get('/fld/categories/:categoryId/subcategories',      oftFldController.getFldSubcategoriesByCategory);
router.get('/fld/subcategories/:subCategoryId/crops',        oftFldController.getFldCropsBySubcategory);

// NOTE: Season CRUD is intentionally NOT defined here.
// Seasons are managed as standalone master data via otherMastersRoutes.js,
// exposed at GET/POST/PUT/DELETE /admin/masters/seasons and guarded by
// all_masters_season_master. CFLD crops reference seasons but do not own them;
// clients that need a season list (e.g. for CFLD dropdowns) should call
// GET /admin/masters/seasons, which requires VIEW on all_masters_season_master.

router.get('/crop-types',     oftFldController.getAllCropTypes);
router.get('/crop-types/:id', oftFldController.getCropTypeById);
router.post('/crop-types',    requirePermission('all_masters_cfld_master', 'ADD'),  oftFldController.createCropType);
router.put('/crop-types/:id', requirePermission('all_masters_cfld_master', 'EDIT'), oftFldController.updateCropType);
router.delete('/crop-types/:id', requirePermission('all_masters_cfld_master', 'DELETE'), oftFldController.deleteCropType);

// ============================================
// CFLD Routes  (moduleCode: all_masters_cfld_master)
// ============================================

router.get('/cfld/crops',     oftFldController.getAllCfldCrops);
router.get('/cfld/crops/:id', oftFldController.getCfldCropById);
router.post('/cfld/crops',    requirePermission('all_masters_cfld_master', 'ADD'),  oftFldController.createCfldCrop);
router.put('/cfld/crops/:id', requirePermission('all_masters_cfld_master', 'EDIT'), oftFldController.updateCfldCrop);
router.delete('/cfld/crops/:id', requirePermission('all_masters_cfld_master', 'DELETE'), oftFldController.deleteCfldCrop);
router.get('/cfld/crops/season/:seasonId/type/:typeId', oftFldController.getCfldCropsBySeasonAndType);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', oftFldController.getStats);

module.exports = router;
