const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const productionProjectsController = require('../../controllers/all-masters/productionProjectsController.js');

// Apply authentication and authorization middleware
router.use(authenticateToken);
router.use(requireRole(['super_admin']));

// ============================================
// Product Category Routes
// ============================================

router.get('/product-categories', productionProjectsController.getAllProductCategories);
router.get('/product-categories/:id', productionProjectsController.getProductCategoryById);
router.post('/product-categories', productionProjectsController.createProductCategory);
router.put('/product-categories/:id', productionProjectsController.updateProductCategory);
router.delete('/product-categories/:id', productionProjectsController.deleteProductCategory);

// ============================================
// Product Type Routes
// ============================================

router.get('/product-types', productionProjectsController.getAllProductTypes);
router.get('/product-types/:id', productionProjectsController.getProductTypeById);
router.post('/product-types', productionProjectsController.createProductType);
router.put('/product-types/:id', productionProjectsController.updateProductType);
router.delete('/product-types/:id', productionProjectsController.deleteProductType);

// ============================================
// Product Routes
// ============================================

router.get('/products', productionProjectsController.getAllProducts);
router.get('/products/:id', productionProjectsController.getProductById);
router.post('/products', productionProjectsController.createProduct);
router.put('/products/:id', productionProjectsController.updateProduct);
router.delete('/products/:id', productionProjectsController.deleteProduct);

// ============================================
// Hierarchical Product Routes
// ============================================

router.get('/product-categories/:categoryId/types', productionProjectsController.getProductTypesByCategory);

// ============================================
// CRA Cropping System Routes
// ============================================

router.get('/cra-cropping-systems', productionProjectsController.getAllCraCroppingSystems);
router.get('/cra-cropping-systems/:id', productionProjectsController.getCraCroppingSystemById);
router.post('/cra-cropping-systems', productionProjectsController.createCraCroppingSystem);
router.put('/cra-cropping-systems/:id', productionProjectsController.updateCraCroppingSystem);
router.delete('/cra-cropping-systems/:id', productionProjectsController.deleteCraCroppingSystem);

// ============================================
// CRA Farming System Routes
// ============================================

router.get('/cra-farming-systems', productionProjectsController.getAllCraFarmingSystems);
router.get('/cra-farming-systems/:id', productionProjectsController.getCraFarmingSystemById);
router.post('/cra-farming-systems', productionProjectsController.createCraFarmingSystem);
router.put('/cra-farming-systems/:id', productionProjectsController.updateCraFarmingSystem);
router.delete('/cra-farming-systems/:id', productionProjectsController.deleteCraFarmingSystem);

// ============================================
// Arya Enterprise Routes
// ============================================

router.get('/arya-enterprises', productionProjectsController.getAllAryaEnterprises);
router.get('/arya-enterprises/:id', productionProjectsController.getAryaEnterpriseById);
router.post('/arya-enterprises', productionProjectsController.createAryaEnterprise);
router.put('/arya-enterprises/:id', productionProjectsController.updateAryaEnterprise);
router.delete('/arya-enterprises/:id', productionProjectsController.deleteAryaEnterprise);

// ============================================
// Statistics Route
// ============================================

router.get('/stats', productionProjectsController.getStats);

module.exports = router;
