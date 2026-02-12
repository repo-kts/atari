const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const aboutKvkController = require('../../controllers/forms/aboutKvkController.js');
const exportController = require('../../controllers/exportController.js');

// Apply authentication middleware
router.use(authenticateToken);

// Role groups for route guards (service layer does fine-grained checks)
const allRoles = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk'];
const adminsOnly = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
const kvkOnly = ['kvk'];

// ============================================
// About KVK Routes
// ============================================

// KVK Basic Details Routes
router.get('/kvks', aboutKvkController.getAllKvks);
router.get('/kvks/:id', aboutKvkController.getKvkById);
router.post('/kvks', requireRole(['super_admin']), aboutKvkController.createKvk);
router.put('/kvks/:id', requireRole(adminsOnly), aboutKvkController.updateKvk);
router.delete('/kvks/:id', requireRole(['super_admin']), aboutKvkController.deleteKvk);

// KVK Bank Accounts Routes
router.get('/bank-accounts', aboutKvkController.getAllKvkBankAccounts);
router.get('/bank-accounts/:id', aboutKvkController.getKvkBankAccountById);
router.post('/bank-accounts', requireRole(kvkOnly), aboutKvkController.createKvkBankAccount);
router.put('/bank-accounts/:id', requireRole(kvkOnly), aboutKvkController.updateKvkBankAccount);
router.delete('/bank-accounts/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkBankAccount);

// KVK Employees Routes
router.get('/employees', aboutKvkController.getAllKvkEmployees);
router.get('/employees/:id', aboutKvkController.getKvkEmployeeById);
router.post('/employees', requireRole(kvkOnly), aboutKvkController.createKvkEmployee);
router.put('/employees/:id', requireRole(kvkOnly), aboutKvkController.updateKvkEmployee);
router.delete('/employees/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkEmployee);
router.post('/employees/:id/transfer', requireRole([...kvkOnly, 'super_admin']), aboutKvkController.transferEmployee);
router.get('/employees/:id/transfer-history', aboutKvkController.getStaffTransferHistory);
router.post('/employees/:id/transfer/revert', requireRole(['super_admin']), aboutKvkController.revertTransfer);

// KVK Staff Transferred Routes
router.get('/staff-transferred', aboutKvkController.getAllKvkStaffTransferred);
router.get('/staff-transferred/:id', aboutKvkController.getKvkStaffTransferredById);
router.post('/staff-transferred', requireRole(kvkOnly), aboutKvkController.createKvkStaffTransferred);
router.put('/staff-transferred/:id', requireRole(kvkOnly), aboutKvkController.updateKvkStaffTransferred);
router.delete('/staff-transferred/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkStaffTransferred);

// KVK Infrastructure Routes
router.get('/infrastructure', aboutKvkController.getAllKvkInfrastructure);
router.get('/infrastructure/:id', aboutKvkController.getKvkInfrastructureById);
router.post('/infrastructure', requireRole(kvkOnly), aboutKvkController.createKvkInfrastructure);
router.put('/infrastructure/:id', requireRole(kvkOnly), aboutKvkController.updateKvkInfrastructure);
router.delete('/infrastructure/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkInfrastructure);

// KVK Vehicles Routes
router.get('/vehicles', aboutKvkController.getAllKvkVehicles);
router.get('/vehicles/:id', aboutKvkController.getKvkVehicleById);
router.post('/vehicles', requireRole(kvkOnly), aboutKvkController.createKvkVehicle);
router.put('/vehicles/:id', requireRole(kvkOnly), aboutKvkController.updateKvkVehicle);
router.delete('/vehicles/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkVehicle);

// KVK Vehicle Details Routes (Alias)
router.get('/vehicle-details', aboutKvkController.getAllKvkVehicleDetails);
router.get('/vehicle-details/:id', aboutKvkController.getKvkVehicleDetailsById);
router.post('/vehicle-details', requireRole(kvkOnly), aboutKvkController.createKvkVehicleDetails);
router.put('/vehicle-details/:id', requireRole(kvkOnly), aboutKvkController.updateKvkVehicleDetails);
router.delete('/vehicle-details/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkVehicleDetails);

// KVK Equipments Routes
router.get('/equipments', aboutKvkController.getAllKvkEquipments);
router.get('/equipments/:id', aboutKvkController.getKvkEquipmentById);
router.post('/equipments', requireRole(kvkOnly), aboutKvkController.createKvkEquipment);
router.put('/equipments/:id', requireRole(kvkOnly), aboutKvkController.updateKvkEquipment);
router.delete('/equipments/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkEquipment);

// KVK Equipment Details Routes (Alias)
router.get('/equipment-details', aboutKvkController.getAllKvkEquipmentDetails);
router.get('/equipment-details/:id', aboutKvkController.getKvkEquipmentDetailsById);
router.post('/equipment-details', requireRole(kvkOnly), aboutKvkController.createKvkEquipmentDetails);
router.put('/equipment-details/:id', requireRole(kvkOnly), aboutKvkController.updateKvkEquipmentDetails);
router.delete('/equipment-details/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkEquipmentDetails);

// KVK Farm Implements Routes
router.get('/farm-implements', aboutKvkController.getAllKvkFarmImplements);
router.get('/farm-implements/:id', aboutKvkController.getKvkFarmImplementById);
router.post('/farm-implements', requireRole(kvkOnly), aboutKvkController.createKvkFarmImplement);
router.put('/farm-implements/:id', requireRole(kvkOnly), aboutKvkController.updateKvkFarmImplement);
router.delete('/farm-implements/:id', requireRole(kvkOnly), aboutKvkController.deleteKvkFarmImplement);

// ============================================
// Master Data Routes (for dropdowns)
// ============================================

// Sanctioned Posts
router.get('/sanctioned-posts', aboutKvkController.getAllSanctionedPosts);

// Disciplines
router.get('/disciplines', aboutKvkController.getAllDisciplines);

// Infrastructure Masters
router.get('/infra-masters', aboutKvkController.getAllInfraMasters);

// Get all KVKs for dropdown (without user filtering)
router.get('/kvks-dropdown', aboutKvkController.getAllKvksForDropdown);

// ============================================
// Transfer History Routes
// ============================================
router.get('/staff-transfers', aboutKvkController.getAllTransfers);

// ============================================
// Export Route (for About KVK forms)
// ============================================
router.post('/export', exportController.exportData);

module.exports = router;
