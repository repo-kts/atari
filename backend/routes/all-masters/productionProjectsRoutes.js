const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission, requireAnyPermission } = require('../../middleware/auth.js');
const productionProjectsController = require('../../controllers/all-masters/productionProjectsController.js');

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// Product Category Routes  (moduleCode: all_masters_products_master)
// ============================================

router.get('/product-categories',     requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getAllProductCategories);
router.get('/product-categories/:id', requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getProductCategoryById);
router.post('/product-categories',    requirePermission('all_masters_products_master', 'ADD'),  productionProjectsController.createProductCategory);
router.put('/product-categories/:id', requirePermission('all_masters_products_master', 'EDIT'), productionProjectsController.updateProductCategory);
router.delete('/product-categories/:id', requirePermission('all_masters_products_master', 'DELETE'), productionProjectsController.deleteProductCategory);

// ============================================
// Product Type Routes  (moduleCode: all_masters_products_master)
// ============================================

router.get('/product-types',     requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getAllProductTypes);
router.get('/product-types/:id', requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getProductTypeById);
router.post('/product-types',    requirePermission('all_masters_products_master', 'ADD'),  productionProjectsController.createProductType);
router.put('/product-types/:id', requirePermission('all_masters_products_master', 'EDIT'), productionProjectsController.updateProductType);
router.delete('/product-types/:id', requirePermission('all_masters_products_master', 'DELETE'), productionProjectsController.deleteProductType);

// ============================================
// Product Routes  (moduleCode: all_masters_products_master)
// ============================================

router.get('/products',     requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getAllProducts);
router.get('/products/:id', requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getProductById);
router.post('/products',    requirePermission('all_masters_products_master', 'ADD'),  productionProjectsController.createProduct);
router.put('/products/:id', requirePermission('all_masters_products_master', 'EDIT'), productionProjectsController.updateProduct);
router.delete('/products/:id', requirePermission('all_masters_products_master', 'DELETE'), productionProjectsController.deleteProduct);

// Hierarchical
router.get('/product-categories/:categoryId/types', requirePermission('all_masters_products_master', 'VIEW'), productionProjectsController.getProductTypesByCategory);

// ============================================
// CRA Cropping System Routes  (moduleCode: all_masters_climate_master)
// ============================================

router.get('/cra-cropping-systems',     requirePermission('all_masters_climate_master', 'VIEW'), productionProjectsController.getAllCraCroppingSystems);
router.get('/cra-cropping-systems/:id', requirePermission('all_masters_climate_master', 'VIEW'), productionProjectsController.getCraCroppingSystemById);
router.post('/cra-cropping-systems',    requirePermission('all_masters_climate_master', 'ADD'),  productionProjectsController.createCraCroppingSystem);
router.put('/cra-cropping-systems/:id', requirePermission('all_masters_climate_master', 'EDIT'), productionProjectsController.updateCraCroppingSystem);
router.delete('/cra-cropping-systems/:id', requirePermission('all_masters_climate_master', 'DELETE'), productionProjectsController.deleteCraCroppingSystem);

// ============================================
// CRA Farming System Routes  (moduleCode: all_masters_climate_master)
// ============================================

router.get('/cra-farming-systems',     requirePermission('all_masters_climate_master', 'VIEW'), productionProjectsController.getAllCraFarmingSystems);
router.get('/cra-farming-systems/:id', requirePermission('all_masters_climate_master', 'VIEW'), productionProjectsController.getCraFarmingSystemById);
router.post('/cra-farming-systems',    requirePermission('all_masters_climate_master', 'ADD'),  productionProjectsController.createCraFarmingSystem);
router.put('/cra-farming-systems/:id', requirePermission('all_masters_climate_master', 'EDIT'), productionProjectsController.updateCraFarmingSystem);
router.delete('/cra-farming-systems/:id', requirePermission('all_masters_climate_master', 'DELETE'), productionProjectsController.deleteCraFarmingSystem);

// ============================================
// Arya Enterprise Routes  (moduleCode: all_masters_arya_master)
// ============================================

router.get('/arya-enterprises',     requirePermission('all_masters_arya_master', 'VIEW'), productionProjectsController.getAllAryaEnterprises);
router.get('/arya-enterprises/:id', requirePermission('all_masters_arya_master', 'VIEW'), productionProjectsController.getAryaEnterpriseById);
router.post('/arya-enterprises',    requirePermission('all_masters_arya_master', 'ADD'),  productionProjectsController.createAryaEnterprise);
router.put('/arya-enterprises/:id', requirePermission('all_masters_arya_master', 'EDIT'), productionProjectsController.updateAryaEnterprise);
router.delete('/arya-enterprises/:id', requirePermission('all_masters_arya_master', 'DELETE'), productionProjectsController.deleteAryaEnterprise);

// ============================================
// Statistics Route
// ============================================

router.get('/stats',
    requireAnyPermission(['all_masters_products_master', 'all_masters_climate_master', 'all_masters_arya_master'], 'VIEW'),
    productionProjectsController.getStats,
);

module.exports = router;
