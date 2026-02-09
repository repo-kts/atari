const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const aboutKvkController = require('../../controllers/forms/aboutKvkController.js');

// Apply authentication middleware
router.use(authenticateToken);

// ============================================
// About KVK Routes
// ============================================

// KVK Basic Details Routes
router.get('/kvks', aboutKvkController.getAllKvks);
router.get('/kvks/:id', aboutKvkController.getKvkById);
router.post('/kvks', aboutKvkController.createKvk);
router.put('/kvks/:id', aboutKvkController.updateKvk);
router.delete('/kvks/:id', aboutKvkController.deleteKvk);

// KVK Bank Accounts Routes
router.get('/bank-accounts', aboutKvkController.getAllKvkBankAccounts);
router.get('/bank-accounts/:id', aboutKvkController.getKvkBankAccountById);
router.post('/bank-accounts', aboutKvkController.createKvkBankAccount);
router.put('/bank-accounts/:id', aboutKvkController.updateKvkBankAccount);
router.delete('/bank-accounts/:id', aboutKvkController.deleteKvkBankAccount);

// KVK Employees Routes
router.get('/employees', aboutKvkController.getAllKvkEmployees);
router.get('/employees/:id', aboutKvkController.getKvkEmployeeById);
router.post('/employees', aboutKvkController.createKvkEmployee);
router.put('/employees/:id', aboutKvkController.updateKvkEmployee);
router.delete('/employees/:id', aboutKvkController.deleteKvkEmployee);

// KVK Staff Transferred Routes
router.get('/staff-transferred', aboutKvkController.getAllKvkStaffTransferred);
router.get('/staff-transferred/:id', aboutKvkController.getKvkStaffTransferredById);
router.post('/staff-transferred', aboutKvkController.createKvkStaffTransferred);
router.put('/staff-transferred/:id', aboutKvkController.updateKvkStaffTransferred);
router.delete('/staff-transferred/:id', aboutKvkController.deleteKvkStaffTransferred);

// KVK Infrastructure Routes
router.get('/infrastructure', aboutKvkController.getAllKvkInfrastructure);
router.get('/infrastructure/:id', aboutKvkController.getKvkInfrastructureById);
router.post('/infrastructure', aboutKvkController.createKvkInfrastructure);
router.put('/infrastructure/:id', aboutKvkController.updateKvkInfrastructure);
router.delete('/infrastructure/:id', aboutKvkController.deleteKvkInfrastructure);

// KVK Vehicles Routes
router.get('/vehicles', aboutKvkController.getAllKvkVehicles);
router.get('/vehicles/:id', aboutKvkController.getKvkVehicleById);
router.post('/vehicles', aboutKvkController.createKvkVehicle);
router.put('/vehicles/:id', aboutKvkController.updateKvkVehicle);
router.delete('/vehicles/:id', aboutKvkController.deleteKvkVehicle);

// KVK Vehicle Details Routes (Alias)
router.get('/vehicle-details', aboutKvkController.getAllKvkVehicleDetails);
router.get('/vehicle-details/:id', aboutKvkController.getKvkVehicleDetailsById);
router.post('/vehicle-details', aboutKvkController.createKvkVehicleDetails);
router.put('/vehicle-details/:id', aboutKvkController.updateKvkVehicleDetails);
router.delete('/vehicle-details/:id', aboutKvkController.deleteKvkVehicleDetails);

// KVK Equipments Routes
router.get('/equipments', aboutKvkController.getAllKvkEquipments);
router.get('/equipments/:id', aboutKvkController.getKvkEquipmentById);
router.post('/equipments', aboutKvkController.createKvkEquipment);
router.put('/equipments/:id', aboutKvkController.updateKvkEquipment);
router.delete('/equipments/:id', aboutKvkController.deleteKvkEquipment);

// KVK Equipment Details Routes (Alias)
router.get('/equipment-details', aboutKvkController.getAllKvkEquipmentDetails);
router.get('/equipment-details/:id', aboutKvkController.getKvkEquipmentDetailsById);
router.post('/equipment-details', aboutKvkController.createKvkEquipmentDetails);
router.put('/equipment-details/:id', aboutKvkController.updateKvkEquipmentDetails);
router.delete('/equipment-details/:id', aboutKvkController.deleteKvkEquipmentDetails);

// KVK Farm Implements Routes
router.get('/farm-implements', aboutKvkController.getAllKvkFarmImplements);
router.get('/farm-implements/:id', aboutKvkController.getKvkFarmImplementById);
router.post('/farm-implements', aboutKvkController.createKvkFarmImplement);
router.put('/farm-implements/:id', aboutKvkController.updateKvkFarmImplement);
router.delete('/farm-implements/:id', aboutKvkController.deleteKvkFarmImplement);

module.exports = router;
