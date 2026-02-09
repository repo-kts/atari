const aboutKvkService = require('../../services/forms/aboutKvkService.js');

/**
 * About KVK Controller
 * Handles HTTP requests for About KVK forms
 */

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
        });
    } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const getById = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        const data = await aboutKvkService.getById(entityName, id, req.user);
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(`Error fetching ${entityName} by ID:`, error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

const create = (entityName) => async (req, res) => {
    try {
        const data = await aboutKvkService.create(entityName, req.body, req.user);
        res.status(201).json({
            success: true,
            data,
            message: `${entityName} created successfully`,
        });
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

const update = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        const data = await aboutKvkService.update(entityName, id, req.body, req.user);
        res.json({
            success: true,
            data,
            message: `${entityName} updated successfully`,
        });
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
    }
};

const deleteEntity = (entityName) => async (req, res) => {
    try {
        const { id } = req.params;
        await aboutKvkService.delete(entityName, id, req.user);
        res.json({
            success: true,
            message: `${entityName} deleted successfully`,
        });
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error);
        const statusCode = error.message.includes('not found') ? 404 :
            error.message.includes('Access denied') ? 403 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message,
        });
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

exports.getAllKvkFarmImplements = getAll('kvk-farm-implements');
exports.getKvkFarmImplementById = getById('kvk-farm-implements');
exports.createKvkFarmImplement = create('kvk-farm-implements');
exports.updateKvkFarmImplement = update('kvk-farm-implements');
exports.deleteKvkFarmImplement = deleteEntity('kvk-farm-implements');
