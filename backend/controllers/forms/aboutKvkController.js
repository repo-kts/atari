const aboutKvkService = require('../../services/forms/aboutKvkService.js');
const { sanitizeDate } = require('../../utils/dataSanitizer.js');
const { translatePrismaError } = require('../../utils/errorHandler.js');

/**
 * About KVK Controller
 * Handles HTTP requests for About KVK forms
 */

// Friendly labels for error messages — nicer than raw entity slugs like "kvk-bank-accounts".
const ENTITY_LABELS = {
    'kvks': 'KVK',
    'kvk-bank-accounts': 'Bank account',
    'kvk-employees': 'Employee',
    'kvk-staff-transferred': 'Staff transfer record',
    'kvk-infrastructure': 'Infrastructure record',
    'kvk-vehicles': 'Vehicle',
    'kvk-vehicle-details': 'Vehicle detail record',
    'kvk-equipments': 'Equipment',
    'kvk-equipment-details': 'Equipment detail record',
    'kvk-land-details': 'Land detail record',
};

// Translates raw Prisma/internal errors into a user-readable message and picks a
// status code (translated error's own statusCode wins; otherwise fallbackStatus,
// which callers derive from legacy string-matching on the original message).
function sendControllerError(res, error, { entityName, operation, fallbackStatus = 500 }) {
    const resource = ENTITY_LABELS[entityName] || entityName;
    console.error(`Error during ${operation} for ${resource}:`, error);
    const translated = translatePrismaError(error, resource, operation);
    res.status(translated.statusCode || fallbackStatus).json({
        success: false,
        error: translated.message,
    });
}

const getAll = (entityName) => async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 100,
            search: req.query.search || '',
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder || 'asc',
            filters: req.query.filters ? JSON.parse(req.query.filters) : {},
        };

        const result = await aboutKvkService.getAll(entityName, options, req.user);
        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
            ...(result.noKvkLinked && { noKvkLinked: true }),
        });
    } catch (error) {
        sendControllerError(res, error, { entityName, operation: 'fetch', fallbackStatus: 500 });
    }
};

const getById = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                error: `ID is required for ${ENTITY_LABELS[entityName] || entityName}. Received: ${id}`,
            });
        }
        const data = await aboutKvkService.getById(entityName, id, req.user);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        const fallbackStatus = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') ? 403 : 500;
        sendControllerError(res, error, { entityName, operation: 'fetch', fallbackStatus });
    }
};

const create = (entityName) => async (req, res) => {
    try {
        const data = await aboutKvkService.create(entityName, req.body, req.user);
        res.status(201).json({
            success: true,
            data,
            message: `${ENTITY_LABELS[entityName] || entityName} created successfully`,
        });
    } catch (error) {
        sendControllerError(res, error, { entityName, operation: 'create', fallbackStatus: 400 });
    }
};

const update = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                error: `ID is required for ${ENTITY_LABELS[entityName] || entityName}. Received: ${id}`,
            });
        }
        const data = await aboutKvkService.update(entityName, id, req.body, req.user);
        res.json({
            success: true,
            data,
            message: `${ENTITY_LABELS[entityName] || entityName} updated successfully`,
        });
    } catch (error) {
        const fallbackStatus = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') ? 403 : 400;
        sendControllerError(res, error, { entityName, operation: 'update', fallbackStatus });
    }
};

const deleteEntity = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                error: `ID is required for ${ENTITY_LABELS[entityName] || entityName}. Received: ${id}`,
            });
        }
        await aboutKvkService.delete(entityName, id, req.user);
        res.json({
            success: true,
            message: `${ENTITY_LABELS[entityName] || entityName} deleted successfully`,
        });
    } catch (error) {
        const fallbackStatus = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') ? 403 : 500;
        sendControllerError(res, error, { entityName, operation: 'delete', fallbackStatus });
    }
};

// Exports for each entity route
exports.getAllKvks = getAll('kvks');
exports.getKvkById = getById('kvks');
exports.createKvk = create('kvks');
exports.updateKvk = update('kvks');
exports.deleteKvk = deleteEntity('kvks');

exports.getAllKvkBankAccounts = getAll('kvk-bank-accounts');
exports.getKvkBankAccountById = getById('kvk-bank-accounts');
exports.createKvkBankAccount = create('kvk-bank-accounts');
exports.updateKvkBankAccount = update('kvk-bank-accounts');
exports.deleteKvkBankAccount = deleteEntity('kvk-bank-accounts');

exports.getAllKvkEmployees = getAll('kvk-employees');
exports.getKvkEmployeeById = getById('kvk-employees');
exports.createKvkEmployee = create('kvk-employees');
exports.updateKvkEmployee = update('kvk-employees');
exports.deleteKvkEmployee = deleteEntity('kvk-employees');

exports.getAllKvkStaffTransferred = getAll('kvk-staff-transferred');
exports.getKvkStaffTransferredById = getById('kvk-staff-transferred');
exports.createKvkStaffTransferred = create('kvk-staff-transferred');
exports.updateKvkStaffTransferred = update('kvk-staff-transferred');
exports.deleteKvkStaffTransferred = deleteEntity('kvk-staff-transferred');

exports.getAllKvkInfrastructure = getAll('kvk-infrastructure');
exports.getKvkInfrastructureById = getById('kvk-infrastructure');
exports.createKvkInfrastructure = create('kvk-infrastructure');
exports.updateKvkInfrastructure = update('kvk-infrastructure');
exports.deleteKvkInfrastructure = deleteEntity('kvk-infrastructure');

exports.getAllKvkVehicles = getAll('kvk-vehicles');
exports.getKvkVehicleById = getById('kvk-vehicles');
exports.createKvkVehicle = create('kvk-vehicles');
exports.updateKvkVehicle = update('kvk-vehicles');
exports.deleteKvkVehicle = deleteEntity('kvk-vehicles');

// Vehicle Details route (if different, but usually maps to same)
exports.getAllKvkVehicleDetails = getAll('kvk-vehicle-details');
exports.getKvkVehicleDetailsById = getById('kvk-vehicle-details');
exports.createKvkVehicleDetails = create('kvk-vehicle-details');
exports.updateKvkVehicleDetails = update('kvk-vehicle-details');
exports.deleteKvkVehicleDetails = deleteEntity('kvk-vehicle-details');

exports.getAllKvkEquipments = getAll('kvk-equipments');
exports.getKvkEquipmentById = getById('kvk-equipments');
exports.createKvkEquipment = create('kvk-equipments');
exports.updateKvkEquipment = update('kvk-equipments');
exports.deleteKvkEquipment = deleteEntity('kvk-equipments');

exports.getAllKvkEquipmentDetails = getAll('kvk-equipment-details');
exports.getKvkEquipmentDetailsById = getById('kvk-equipment-details');
exports.createKvkEquipmentDetails = create('kvk-equipment-details');
exports.updateKvkEquipmentDetails = update('kvk-equipment-details');
exports.deleteKvkEquipmentDetails = deleteEntity('kvk-equipment-details');

exports.getAllKvkLandDetails = getAll('kvk-land-details');
exports.getKvkLandDetailById = getById('kvk-land-details');
exports.createKvkLandDetail = create('kvk-land-details');
exports.updateKvkLandDetail = update('kvk-land-details');
exports.deleteKvkLandDetail = deleteEntity('kvk-land-details');

// ============================================
// Master Data Controllers (for dropdowns)
// ============================================

exports.getAllSanctionedPosts = async (req, res) => {
    try {
        const data = await aboutKvkService.getAllSanctionedPosts();
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        sendControllerError(res, error, { entityName: 'Sanctioned post', operation: 'fetch', fallbackStatus: 500 });
    }
};

exports.getAllDisciplines = async (req, res) => {
    try {
        const data = await aboutKvkService.getAllDisciplines();
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        sendControllerError(res, error, { entityName: 'Discipline', operation: 'fetch', fallbackStatus: 500 });
    }
};

exports.getAllInfraMasters = async (req, res) => {
    try {
        const data = await aboutKvkService.getAllInfraMasters();
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        sendControllerError(res, error, { entityName: 'Infrastructure master', operation: 'fetch', fallbackStatus: 500 });
    }
};

exports.getStaffForDropdown = async (req, res) => {
    try {
        const { kvkId } = req.query;
        if (!kvkId) {
            return res.status(400).json({
                success: false,
                error: 'kvkId is required',
            });
        }
        const data = await aboutKvkService.getStaffForDropdown(parseInt(kvkId));
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        sendControllerError(res, error, { entityName: 'KVK staff', operation: 'fetch', fallbackStatus: 500 });
    }
};

exports.getVehiclesForDropdown = async (req, res) => {
    try {
        const { reportingYear } = req.query;
        const resolvedKvkId = req.query.kvkId || req.user?.kvkId;
        if (!resolvedKvkId && req.user?.roleName !== 'super_admin') {
            return res.status(400).json({ success: false, error: 'kvkId is required' });
        }
        const data = await aboutKvkService.getVehiclesForDropdown(
            resolvedKvkId ? parseInt(resolvedKvkId, 10) : null,
            reportingYear,
        );
        res.json({ success: true, data });
    } catch (error) {
        sendControllerError(res, error, { entityName: 'Vehicle', operation: 'fetch', fallbackStatus: 500 });
    }
};

exports.getEquipmentsForDropdown = async (req, res) => {
    try {
        const { reportingYear } = req.query;
        const resolvedKvkId = req.query.kvkId || req.user?.kvkId;
        if (!resolvedKvkId && req.user?.roleName !== 'super_admin') {
            return res.status(400).json({ success: false, error: 'kvkId is required' });
        }
        const data = await aboutKvkService.getEquipmentsForDropdown(
            resolvedKvkId ? parseInt(resolvedKvkId, 10) : null,
            reportingYear,
        );
        res.json({ success: true, data });
    } catch (error) {
        sendControllerError(res, error, { entityName: 'Equipment', operation: 'fetch', fallbackStatus: 500 });
    }
};

// Get all KVKs for dropdown (without user filtering)
exports.getAllKvksForDropdown = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 1000,
            search: req.query.search || '',
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder || 'asc',
        };

        const result = await aboutKvkService.getAllKvksForDropdown(options, req.user);
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
        sendControllerError(res, error, { entityName: 'KVK', operation: 'fetch', fallbackStatus: 500 });
    }
};

// Transfer employee to another KVK
exports.transferEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetKvkId, transferReason, notes, transferDate } = req.body;

        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                error: 'Employee ID is required',
            });
        }

        if (!targetKvkId) {
            return res.status(400).json({
                success: false,
                error: 'Target KVK ID is required',
            });
        }

        const parsedTransferDate = sanitizeDate(transferDate);
        if (!parsedTransferDate) {
            return res.status(400).json({
                success: false,
                error: 'Transfer date is required',
            });
        }
        if (parsedTransferDate > new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Transfer date cannot be in the future',
            });
        }

        const result = await aboutKvkService.transferEmployee(
            parseInt(id), 
            parseInt(targetKvkId), 
            req.user,
            transferReason,
            notes,
            transferDate
        );
        res.json({
            success: true,
            data: result.employee,
            transferHistory: result.transferHistory,
            message: 'Employee transferred successfully',
        });
    } catch (error) {
        const fallbackStatus = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') || error.message.includes('Only KVK') ? 403 : 400;
        sendControllerError(res, error, { entityName: 'Employee transfer', operation: 'transfer', fallbackStatus });
    }
};

// Get all transfers with filters
exports.getAllTransfers = async (req, res) => {
    try {
        const filters = {
            staffId: req.query.staffId ? parseInt(req.query.staffId) : undefined,
            fromKvkId: req.query.fromKvkId ? parseInt(req.query.fromKvkId) : undefined,
            toKvkId: req.query.toKvkId ? parseInt(req.query.toKvkId) : undefined,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            isReversal: req.query.isReversal === 'true' ? true : 
                       req.query.isReversal === 'false' ? false : undefined,
        };

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 100,
            sortBy: req.query.sortBy || 'transferDate',
            sortOrder: req.query.sortOrder || 'desc',
        };

        const result = await aboutKvkService.getAllTransfers(filters, options, req.user);
        
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
        sendControllerError(res, error, { entityName: 'Transfer', operation: 'fetch', fallbackStatus: 500 });
    }
};

// Get transfer history for a specific staff member
exports.getStaffTransferHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 100,
            sortBy: req.query.sortBy || 'transferDate',
            sortOrder: req.query.sortOrder || 'desc',
        };

        const result = await aboutKvkService.getStaffTransferHistory(parseInt(id), options);
        
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
        sendControllerError(res, error, { entityName: 'Staff transfer history', operation: 'fetch', fallbackStatus: 500 });
    }
};

// Revert a transfer (Super Admin only)
exports.revertTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetKvkId, reason, notes, transferDate } = req.body;

        if (!req.user || req.user.roleName !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Only Super Admins can revert transfers',
            });
        }

        const parsedTransferDate = sanitizeDate(transferDate);
        if (!parsedTransferDate) {
            return res.status(400).json({
                success: false,
                error: 'Transfer date is required',
            });
        }
        if (parsedTransferDate > new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Transfer date cannot be in the future',
            });
        }

        const result = await aboutKvkService.revertTransfer(
            parseInt(id),
            targetKvkId ? parseInt(targetKvkId) : null,
            req.user,
            reason,
            notes,
            transferDate
        );

        res.json({
            success: true,
            data: result.employee,
            transferHistory: result.transferHistory,
            message: 'Transfer reverted successfully',
        });
    } catch (error) {
        const fallbackStatus = error.message.includes('not found') ? 404 :
                          error.message.includes('Only Super') ? 403 : 400;
        sendControllerError(res, error, { entityName: 'Transfer', operation: 'revert', fallbackStatus });
    }
};
