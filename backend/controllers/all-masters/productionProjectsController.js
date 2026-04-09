const productionProjectsService = require('../../services/all-masters/productionProjectsService.js');
const { DEFAULT_MASTER_LIST_PAGE_SIZE, normalizeListLimit } = require('../../constants/masterListPagination.js');

/**
 * Production & Projects Master Data Controller
 * HTTP request handlers for Production and Projects master data operations
 */

/**
 * Generic handler to get all entities
 */
const getAll = (entityName) => async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page, 10) || 1,
            limit: normalizeListLimit(req.query.limit, DEFAULT_MASTER_LIST_PAGE_SIZE),
            search: req.query.search || '',
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder || 'asc',
            filters: req.query.filters ? JSON.parse(req.query.filters) : {},
        };

        const result = await productionProjectsService.getAll(entityName, options);
        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        });
    } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to get entity by ID
 */
const getById = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        const data = await productionProjectsService.getById(entityName, id);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(`Error fetching ${entityName} by ID:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to create entity
 */
const create = (entityName) => async (req, res) => {
    try {
        const data = await productionProjectsService.create(entityName, req.body);
        res.status(201).json({
            success: true,
            data,
            message: `${entityName} created successfully`,
        });
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        const statusCode = error.message.includes('already exists') ? 409 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to update entity
 */
const update = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        const data = await productionProjectsService.update(entityName, id, req.body);
        res.json({
            success: true,
            data,
            message: `${entityName} updated successfully`,
        });
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

/**
 * Generic handler to delete entity
 */
const deleteEntity = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        await productionProjectsService.delete(entityName, id);
        res.json({
            success: true,
            message: `${entityName} deleted successfully`,
        });
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

// Product Category Controllers
exports.getAllProductCategories = getAll('product-categories');
exports.getProductCategoryById = getById('product-categories');
exports.createProductCategory = create('product-categories');
exports.updateProductCategory = update('product-categories');
exports.deleteProductCategory = deleteEntity('product-categories');

// Product Type Controllers
exports.getAllProductTypes = getAll('product-types');
exports.getProductTypeById = getById('product-types');
exports.createProductType = create('product-types');
exports.updateProductType = update('product-types');
exports.deleteProductType = deleteEntity('product-types');

// Product Controllers
exports.getAllProducts = getAll('products');
exports.getProductById = getById('products');
exports.createProduct = create('products');
exports.updateProduct = update('products');
exports.deleteProduct = deleteEntity('products');

// CRA Cropping System Controllers
exports.getAllCraCroppingSystems = getAll('cra-cropping-systems');
exports.getCraCroppingSystemById = getById('cra-cropping-systems');
exports.createCraCroppingSystem = create('cra-cropping-systems');
exports.updateCraCroppingSystem = update('cra-cropping-systems');
exports.deleteCraCroppingSystem = deleteEntity('cra-cropping-systems');

// CRA Farming System Controllers
exports.getAllCraFarmingSystems = getAll('cra-farming-systems');
exports.getCraFarmingSystemById = getById('cra-farming-systems');
exports.createCraFarmingSystem = create('cra-farming-systems');
exports.updateCraFarmingSystem = update('cra-farming-systems');
exports.deleteCraFarmingSystem = deleteEntity('cra-farming-systems');

// Arya Enterprise Controllers
exports.getAllAryaEnterprises = getAll('arya-enterprises');
exports.getAryaEnterpriseById = getById('arya-enterprises');
exports.createAryaEnterprise = create('arya-enterprises');
exports.updateAryaEnterprise = update('arya-enterprises');
exports.deleteAryaEnterprise = deleteEntity('arya-enterprises');

// TSP/SCSP Master Controllers
exports.getAllTspScspTypes = getAll('tsp-scsp-types');
exports.getTspScspTypeById = getById('tsp-scsp-types');
exports.createTspScspType = create('tsp-scsp-types');
exports.updateTspScspType = update('tsp-scsp-types');
exports.deleteTspScspType = deleteEntity('tsp-scsp-types');

exports.getAllTspScspActivities = getAll('tsp-scsp-activities');
exports.getTspScspActivityById = getById('tsp-scsp-activities');
exports.createTspScspActivity = create('tsp-scsp-activities');
exports.updateTspScspActivity = update('tsp-scsp-activities');
exports.deleteTspScspActivity = deleteEntity('tsp-scsp-activities');

// Natural Farming Activity Master Controllers
exports.getAllNaturalFarmingActivities = getAll('natural-farming-activities');
exports.getNaturalFarmingActivityById = getById('natural-farming-activities');
exports.createNaturalFarmingActivity = create('natural-farming-activities');
exports.updateNaturalFarmingActivity = update('natural-farming-activities');
exports.deleteNaturalFarmingActivity = deleteEntity('natural-farming-activities');

exports.getAllNaturalFarmingSoilParameters = getAll('natural-farming-soil-parameters');
exports.getNaturalFarmingSoilParameterById = getById('natural-farming-soil-parameters');
exports.createNaturalFarmingSoilParameter = create('natural-farming-soil-parameters');
exports.updateNaturalFarmingSoilParameter = update('natural-farming-soil-parameters');
exports.deleteNaturalFarmingSoilParameter = deleteEntity('natural-farming-soil-parameters');

// Hierarchical filtering endpoints
exports.getProductTypesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const data = await productionProjectsService.getProductTypesByCategory(categoryId);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error fetching product types by category:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Statistics endpoint
exports.getStats = async (req, res) => {
    try {
        const stats = await productionProjectsService.getStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching Production/Projects stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
