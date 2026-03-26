const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const productionProjectsController = require('../../controllers/all-masters/productionProjectsController.js');
const agriDroneMastersController = require('../../controllers/all-masters/agriDroneMastersController.js');

/**
 * Production & Projects Master Routes
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
// Product Category Routes  (moduleCode: all_masters_products_master)
// ============================================

router.get('/product-categories',     productionProjectsController.getAllProductCategories);
router.get('/product-categories/:id', productionProjectsController.getProductCategoryById);
router.post('/product-categories',    requirePermission('all_masters_products_master', 'ADD'),  productionProjectsController.createProductCategory);
router.put('/product-categories/:id', requirePermission('all_masters_products_master', 'EDIT'), productionProjectsController.updateProductCategory);
router.delete('/product-categories/:id', requirePermission('all_masters_products_master', 'DELETE'), productionProjectsController.deleteProductCategory);

// ============================================
// Product Type Routes  (moduleCode: all_masters_products_master)
// ============================================

router.get('/product-types',     productionProjectsController.getAllProductTypes);
router.get('/product-types/:id', productionProjectsController.getProductTypeById);
router.post('/product-types',    requirePermission('all_masters_products_master', 'ADD'),  productionProjectsController.createProductType);
router.put('/product-types/:id', requirePermission('all_masters_products_master', 'EDIT'), productionProjectsController.updateProductType);
router.delete('/product-types/:id', requirePermission('all_masters_products_master', 'DELETE'), productionProjectsController.deleteProductType);

// ============================================
// Product Routes  (moduleCode: all_masters_products_master)
// ============================================

router.get('/products',     productionProjectsController.getAllProducts);
router.get('/products/:id', productionProjectsController.getProductById);
router.post('/products',    requirePermission('all_masters_products_master', 'ADD'),  productionProjectsController.createProduct);
router.put('/products/:id', requirePermission('all_masters_products_master', 'EDIT'), productionProjectsController.updateProduct);
router.delete('/products/:id', requirePermission('all_masters_products_master', 'DELETE'), productionProjectsController.deleteProduct);

// Hierarchical
router.get('/product-categories/:categoryId/types', productionProjectsController.getProductTypesByCategory);

// ============================================
// CRA Cropping System Routes  (moduleCode: all_masters_climate_master)
// ============================================

router.get('/cra-cropping-systems',     productionProjectsController.getAllCraCroppingSystems);
router.get('/cra-cropping-systems/:id', productionProjectsController.getCraCroppingSystemById);
router.post('/cra-cropping-systems',    requirePermission('all_masters_climate_master', 'ADD'),  productionProjectsController.createCraCroppingSystem);
router.put('/cra-cropping-systems/:id', requirePermission('all_masters_climate_master', 'EDIT'), productionProjectsController.updateCraCroppingSystem);
router.delete('/cra-cropping-systems/:id', requirePermission('all_masters_climate_master', 'DELETE'), productionProjectsController.deleteCraCroppingSystem);

// ============================================
// CRA Farming System Routes  (moduleCode: all_masters_climate_master)
// ============================================

router.get('/cra-farming-systems',     productionProjectsController.getAllCraFarmingSystems);
router.get('/cra-farming-systems/:id', productionProjectsController.getCraFarmingSystemById);
router.post('/cra-farming-systems',    requirePermission('all_masters_climate_master', 'ADD'),  productionProjectsController.createCraFarmingSystem);
router.put('/cra-farming-systems/:id', requirePermission('all_masters_climate_master', 'EDIT'), productionProjectsController.updateCraFarmingSystem);
router.delete('/cra-farming-systems/:id', requirePermission('all_masters_climate_master', 'DELETE'), productionProjectsController.deleteCraFarmingSystem);

// ============================================
// Arya Enterprise Routes  (moduleCode: all_masters_arya_master)
// ============================================

router.get('/arya-enterprises',     productionProjectsController.getAllAryaEnterprises);
router.get('/arya-enterprises/:id', productionProjectsController.getAryaEnterpriseById);
router.post('/arya-enterprises',    requirePermission('all_masters_arya_master', 'ADD'),  productionProjectsController.createAryaEnterprise);
router.put('/arya-enterprises/:id', requirePermission('all_masters_arya_master', 'EDIT'), productionProjectsController.updateAryaEnterprise);
router.delete('/arya-enterprises/:id', requirePermission('all_masters_arya_master', 'DELETE'), productionProjectsController.deleteAryaEnterprise);

// ============================================
// TSP/SCSP Type Routes  (moduleCode: all_masters_tsp_scsp_master)
// ============================================

router.get('/tsp-scsp-types',     productionProjectsController.getAllTspScspTypes);
router.get('/tsp-scsp-types/:id', productionProjectsController.getTspScspTypeById);
router.post('/tsp-scsp-types',    requirePermission('all_masters_tsp_scsp_master', 'ADD'),  productionProjectsController.createTspScspType);
router.put('/tsp-scsp-types/:id', requirePermission('all_masters_tsp_scsp_master', 'EDIT'), productionProjectsController.updateTspScspType);
router.delete('/tsp-scsp-types/:id', requirePermission('all_masters_tsp_scsp_master', 'DELETE'), productionProjectsController.deleteTspScspType);

// ============================================
// TSP/SCSP Activity Routes  (moduleCode: all_masters_tsp_scsp_master)
// ============================================

router.get('/tsp-scsp-activities',     productionProjectsController.getAllTspScspActivities);
router.get('/tsp-scsp-activities/:id', productionProjectsController.getTspScspActivityById);
router.post('/tsp-scsp-activities',    requirePermission('all_masters_tsp_scsp_master', 'ADD'),  productionProjectsController.createTspScspActivity);
router.put('/tsp-scsp-activities/:id', requirePermission('all_masters_tsp_scsp_master', 'EDIT'), productionProjectsController.updateTspScspActivity);
router.delete('/tsp-scsp-activities/:id', requirePermission('all_masters_tsp_scsp_master', 'DELETE'), productionProjectsController.deleteTspScspActivity);

// ============================================
// Natural Farming Activity Routes  (moduleCode: all_masters_natural_farming_master)
// ============================================
router.get('/natural-farming-activities', productionProjectsController.getAllNaturalFarmingActivities);
router.get('/natural-farming-activities/:id', productionProjectsController.getNaturalFarmingActivityById);
router.post('/natural-farming-activities', requirePermission('all_masters_natural_farming_master', 'ADD'), productionProjectsController.createNaturalFarmingActivity);
router.put('/natural-farming-activities/:id', requirePermission('all_masters_natural_farming_master', 'EDIT'), productionProjectsController.updateNaturalFarmingActivity);
router.delete('/natural-farming-activities/:id', requirePermission('all_masters_natural_farming_master', 'DELETE'), productionProjectsController.deleteNaturalFarmingActivity);

router.get('/natural-farming-soil-parameters', productionProjectsController.getAllNaturalFarmingSoilParameters);
router.get('/natural-farming-soil-parameters/:id', productionProjectsController.getNaturalFarmingSoilParameterById);
router.post('/natural-farming-soil-parameters', requirePermission('all_masters_natural_farming_master', 'ADD'), productionProjectsController.createNaturalFarmingSoilParameter);
router.put('/natural-farming-soil-parameters/:id', requirePermission('all_masters_natural_farming_master', 'EDIT'), productionProjectsController.updateNaturalFarmingSoilParameter);
router.delete('/natural-farming-soil-parameters/:id', requirePermission('all_masters_natural_farming_master', 'DELETE'), productionProjectsController.deleteNaturalFarmingSoilParameter);

// ============================================
// Agri Drone Masters  (moduleCode: all_masters_agri_drone_master)
// ============================================
router.get('/agri-drone-demonstrations-on', agriDroneMastersController.getAllDemonstrationsOn);
router.get('/agri-drone-demonstrations-on/:id', agriDroneMastersController.getDemonstrationsOnById);
router.post('/agri-drone-demonstrations-on', requirePermission('all_masters_agri_drone_master', 'ADD'), agriDroneMastersController.createDemonstrationsOn);
router.put('/agri-drone-demonstrations-on/:id', requirePermission('all_masters_agri_drone_master', 'EDIT'), agriDroneMastersController.updateDemonstrationsOn);
router.delete('/agri-drone-demonstrations-on/:id', requirePermission('all_masters_agri_drone_master', 'DELETE'), agriDroneMastersController.deleteDemonstrationsOn);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', productionProjectsController.getStats);

module.exports = router;
