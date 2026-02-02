const masterDataService = require('../services/masterDataService.js');

/**
 * Generic Master Data Controller
 * Thin controller layer for request/response handling
 */

/**
 * Standard success response
 */
function successResponse(res, data, meta = null, statusCode = 200) {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
}

/**
 * Standard error response
 */
function errorResponse(res, error, statusCode = 500) {
    const response = {
        success: false,
        error: {
            message: error.message || 'An error occurred',
            code: error.code || 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
}

// ============ ZONES ============

/**
 * Get all zones
 */
async function getAllZones(req, res) {
    try {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };

        const result = await masterDataService.getAllEntities('zones', options);
        return successResponse(res, result.data, result.meta);
    } catch (error) {
        console.error('Error in getAllZones:', error);
        return errorResponse(res, error);
    }
}

/**
 * Get zone by ID
 */
async function getZoneById(req, res) {
    try {
        const zone = await masterDataService.getEntityById('zones', req.params.id);
        return successResponse(res, zone);
    } catch (error) {
        console.error('Error in getZoneById:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Create zone
 */
async function createZone(req, res) {
    try {
        const zone = await masterDataService.createEntity('zones', req.body, req.user.userId);
        return successResponse(res, zone, null, 201);
    } catch (error) {
        console.error('Error in createZone:', error);
        const statusCode = error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Update zone
 */
async function updateZone(req, res) {
    try {
        const zone = await masterDataService.updateEntity('zones', req.params.id, req.body, req.user.userId);
        return successResponse(res, zone);
    } catch (error) {
        console.error('Error in updateZone:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Delete zone
 */
async function deleteZone(req, res) {
    try {
        await masterDataService.deleteEntity('zones', req.params.id, req.user.userId);
        return successResponse(res, { message: 'Zone deleted successfully' });
    } catch (error) {
        console.error('Error in deleteZone:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('dependent') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

// ============ STATES ============

/**
 * Get all states
 */
async function getAllStates(req, res) {
    try {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            filters: req.query.zoneId ? { zoneId: parseInt(req.query.zoneId) } : {},
        };

        const result = await masterDataService.getAllEntities('states', options);
        return successResponse(res, result.data, result.meta);
    } catch (error) {
        console.error('Error in getAllStates:', error);
        return errorResponse(res, error);
    }
}

/**
 * Get state by ID
 */
async function getStateById(req, res) {
    try {
        const state = await masterDataService.getEntityById('states', req.params.id);
        return successResponse(res, state);
    } catch (error) {
        console.error('Error in getStateById:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Get states by zone
 */
async function getStatesByZone(req, res) {
    try {
        const states = await masterDataService.getStatesByZone(req.params.zoneId);
        return successResponse(res, states);
    } catch (error) {
        console.error('Error in getStatesByZone:', error);
        return errorResponse(res, error);
    }
}

/**
 * Create state
 */
async function createState(req, res) {
    try {
        const state = await masterDataService.createEntity('states', req.body, req.user.userId);
        return successResponse(res, state, null, 201);
    } catch (error) {
        console.error('Error in createState:', error);
        const statusCode = error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Update state
 */
async function updateState(req, res) {
    try {
        const state = await masterDataService.updateEntity('states', req.params.id, req.body, req.user.userId);
        return successResponse(res, state);
    } catch (error) {
        console.error('Error in updateState:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Delete state
 */
async function deleteState(req, res) {
    try {
        await masterDataService.deleteEntity('states', req.params.id, req.user.userId);
        return successResponse(res, { message: 'State deleted successfully' });
    } catch (error) {
        console.error('Error in deleteState:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('dependent') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

// ============ DISTRICTS ============

/**
 * Get all districts
 */
async function getAllDistricts(req, res) {
    try {
        const filters = {};
        if (req.query.stateId) filters.stateId = parseInt(req.query.stateId);
        if (req.query.zoneId) filters.zoneId = parseInt(req.query.zoneId);

        const options = {
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            filters,
        };

        const result = await masterDataService.getAllEntities('districts', options);
        return successResponse(res, result.data, result.meta);
    } catch (error) {
        console.error('Error in getAllDistricts:', error);
        return errorResponse(res, error);
    }
}

/**
 * Get district by ID
 */
async function getDistrictById(req, res) {
    try {
        const district = await masterDataService.getEntityById('districts', req.params.id);
        return successResponse(res, district);
    } catch (error) {
        console.error('Error in getDistrictById:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Get districts by state
 */
async function getDistrictsByState(req, res) {
    try {
        const districts = await masterDataService.getDistrictsByState(req.params.stateId);
        return successResponse(res, districts);
    } catch (error) {
        console.error('Error in getDistrictsByState:', error);
        return errorResponse(res, error);
    }
}

/**
 * Create district
 */
async function createDistrict(req, res) {
    try {
        const district = await masterDataService.createEntity('districts', req.body, req.user.userId);
        return successResponse(res, district, null, 201);
    } catch (error) {
        console.error('Error in createDistrict:', error);
        const statusCode = error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Update district
 */
async function updateDistrict(req, res) {
    try {
        const district = await masterDataService.updateEntity('districts', req.params.id, req.body, req.user.userId);
        return successResponse(res, district);
    } catch (error) {
        console.error('Error in updateDistrict:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Delete district
 */
async function deleteDistrict(req, res) {
    try {
        await masterDataService.deleteEntity('districts', req.params.id, req.user.userId);
        return successResponse(res, { message: 'District deleted successfully' });
    } catch (error) {
        console.error('Error in deleteDistrict:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('dependent') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

// ============ ORGANIZATIONS ============

/**
 * Get all organizations
 */
async function getAllOrganizations(req, res) {
    try {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            filters: req.query.stateId ? { stateId: parseInt(req.query.stateId) } : {},
        };

        const result = await masterDataService.getAllEntities('organizations', options);
        return successResponse(res, result.data, result.meta);
    } catch (error) {
        console.error('Error in getAllOrganizations:', error);
        return errorResponse(res, error);
    }
}

/**
 * Get organization by ID
 */
async function getOrganizationById(req, res) {
    try {
        const organization = await masterDataService.getEntityById('organizations', req.params.id);
        return successResponse(res, organization);
    } catch (error) {
        console.error('Error in getOrganizationById:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Get organizations by state
 */
async function getOrganizationsByState(req, res) {
    try {
        const organizations = await masterDataService.getOrgsByState(req.params.stateId);
        return successResponse(res, organizations);
    } catch (error) {
        console.error('Error in getOrganizationsByState:', error);
        return errorResponse(res, error);
    }
}

/**
 * Create organization
 */
async function createOrganization(req, res) {
    try {
        const organization = await masterDataService.createEntity('organizations', req.body, req.user.userId);
        return successResponse(res, organization, null, 201);
    } catch (error) {
        console.error('Error in createOrganization:', error);
        const statusCode = error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Update organization
 */
async function updateOrganization(req, res) {
    try {
        const organization = await masterDataService.updateEntity('organizations', req.params.id, req.body, req.user.userId);
        return successResponse(res, organization);
    } catch (error) {
        console.error('Error in updateOrganization:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('already exists') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

/**
 * Delete organization
 */
async function deleteOrganization(req, res) {
    try {
        await masterDataService.deleteEntity('organizations', req.params.id, req.user.userId);
        return successResponse(res, { message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('Error in deleteOrganization:', error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('dependent') ? 409 : 400;
        return errorResponse(res, error, statusCode);
    }
}

// ============ UTILITY ============

/**
 * Get statistics
 */
async function getStats(req, res) {
    try {
        const stats = await masterDataService.getStats();
        return successResponse(res, stats);
    } catch (error) {
        console.error('Error in getStats:', error);
        return errorResponse(res, error);
    }
}

/**
 * Get hierarchy
 */
async function getHierarchy(req, res) {
    try {
        const hierarchy = await masterDataService.getHierarchy();
        return successResponse(res, hierarchy);
    } catch (error) {
        console.error('Error in getHierarchy:', error);
        return errorResponse(res, error);
    }
}

module.exports = {
    // Zones
    getAllZones,
    getZoneById,
    createZone,
    updateZone,
    deleteZone,

    // States
    getAllStates,
    getStateById,
    getStatesByZone,
    createState,
    updateState,
    deleteState,

    // Districts
    getAllDistricts,
    getDistrictById,
    getDistrictsByState,
    createDistrict,
    updateDistrict,
    deleteDistrict,

    // Organizations
    getAllOrganizations,
    getOrganizationById,
    getOrganizationsByState,
    createOrganization,
    updateOrganization,
    deleteOrganization,

    // Utility
    getStats,
    getHierarchy,
};
