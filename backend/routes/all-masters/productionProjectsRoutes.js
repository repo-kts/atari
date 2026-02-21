const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const productionProjectsController = require('../../controllers/all-masters/productionProjectsController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Helper for restricted actions (create, update, delete)
const requireSuperAdmin = requireRole(['super_admin']);
const allowAllRoles = requireRole(['super_admin', 'admin', 'kvk', 'zpd', 'icar']);

// ============================================
// Product Category Routes
// ============================================

router.get('/product-categories', allowAllRoles, productionProjectsController.getAllProductCategories);
router.get('/product-categories/:id', allowAllRoles, productionProjectsController.getProductCategoryById);
router.post('/product-categories', requireSuperAdmin, productionProjectsController.createProductCategory);
router.put('/product-categories/:id', requireSuperAdmin, productionProjectsController.updateProductCategory);
router.delete('/product-categories/:id', requireSuperAdmin, productionProjectsController.deleteProductCategory);

// ============================================
// Product Type Routes
// ============================================

router.get('/product-types', allowAllRoles, productionProjectsController.getAllProductTypes);
router.get('/product-types/:id', allowAllRoles, productionProjectsController.getProductTypeById);
router.post('/product-types', requireSuperAdmin, productionProjectsController.createProductType);
router.put('/product-types/:id', requireSuperAdmin, productionProjectsController.updateProductType);
router.delete('/product-types/:id', requireSuperAdmin, productionProjectsController.deleteProductType);

// ============================================
// Product Routes
// ============================================

router.get('/products', allowAllRoles, productionProjectsController.getAllProducts);
router.get('/products/:id', allowAllRoles, productionProjectsController.getProductById);
router.post('/products', requireSuperAdmin, productionProjectsController.createProduct);
router.put('/products/:id', requireSuperAdmin, productionProjectsController.updateProduct);
router.delete('/products/:id', requireSuperAdmin, productionProjectsController.deleteProduct);

// ============================================
// Hierarchical Product Routes
// ============================================

router.get('/product-categories/:categoryId/types', allowAllRoles, productionProjectsController.getProductTypesByCategory);

// ============================================
// CRA Cropping System Routes
// ============================================

router.get('/cra-cropping-systems', allowAllRoles, productionProjectsController.getAllCraCroppingSystems);
router.get('/cra-cropping-systems/:id', allowAllRoles, productionProjectsController.getCraCroppingSystemById);
router.post('/cra-cropping-systems', requireSuperAdmin, productionProjectsController.createCraCroppingSystem);
router.put('/cra-cropping-systems/:id', requireSuperAdmin, productionProjectsController.updateCraCroppingSystem);
router.delete('/cra-cropping-systems/:id', requireSuperAdmin, productionProjectsController.deleteCraCroppingSystem);

// ============================================
// CRA Farming System Routes
// ============================================

router.get('/cra-farming-systems', allowAllRoles, productionProjectsController.getAllCraFarmingSystems);
router.get('/cra-farming-systems/:id', allowAllRoles, productionProjectsController.getCraFarmingSystemById);
router.post('/cra-farming-systems', requireSuperAdmin, productionProjectsController.createCraFarmingSystem);
router.put('/cra-farming-systems/:id', requireSuperAdmin, productionProjectsController.updateCraFarmingSystem);
router.delete('/cra-farming-systems/:id', requireSuperAdmin, productionProjectsController.deleteCraFarmingSystem);

// ============================================
// Arya Enterprise Routes
// ============================================

router.get('/arya-enterprises', allowAllRoles, productionProjectsController.getAllAryaEnterprises);
router.get('/arya-enterprises/:id', allowAllRoles, productionProjectsController.getAryaEnterpriseById);
router.post('/arya-enterprises', requireSuperAdmin, productionProjectsController.createAryaEnterprise);
router.put('/arya-enterprises/:id', requireSuperAdmin, productionProjectsController.updateAryaEnterprise);
router.delete('/arya-enterprises/:id', requireSuperAdmin, productionProjectsController.deleteAryaEnterprise);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', allowAllRoles, productionProjectsController.getStats);

module.exports = router;
