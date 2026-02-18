const express = require('express');
const router = express.Router();
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const aboutKvkController = require('../../controllers/forms/aboutKvkController.js');
const exportController = require('../../controllers/exportController.js');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ============================================
// KVK Basic Details Routes  (moduleCode: about_kvks_view_kvks)
// ============================================

router.get('/kvks',        requirePermission('about_kvks_view_kvks', 'VIEW'),   aboutKvkController.getAllKvks);
router.get('/kvks/:id',    requirePermission('about_kvks_view_kvks', 'VIEW'),   aboutKvkController.getKvkById);
router.post('/kvks',       requirePermission('about_kvks_view_kvks', 'ADD'),    aboutKvkController.createKvk);
router.put('/kvks/:id',    requirePermission('about_kvks_view_kvks', 'EDIT'),   aboutKvkController.updateKvk);
router.delete('/kvks/:id', requirePermission('about_kvks_view_kvks', 'DELETE'), aboutKvkController.deleteKvk);

// ============================================
// KVK Bank Account Routes  (moduleCode: about_kvks_bank_account_details)
// ============================================

router.get('/bank-accounts',        requirePermission('about_kvks_bank_account_details', 'VIEW'),   aboutKvkController.getAllKvkBankAccounts);
router.get('/bank-accounts/:id',    requirePermission('about_kvks_bank_account_details', 'VIEW'),   aboutKvkController.getKvkBankAccountById);
router.post('/bank-accounts',       requirePermission('about_kvks_bank_account_details', 'ADD'),    aboutKvkController.createKvkBankAccount);
router.put('/bank-accounts/:id',    requirePermission('about_kvks_bank_account_details', 'EDIT'),   aboutKvkController.updateKvkBankAccount);
router.delete('/bank-accounts/:id', requirePermission('about_kvks_bank_account_details', 'DELETE'), aboutKvkController.deleteKvkBankAccount);

// ============================================
// KVK Employees Routes  (moduleCode: about_kvks_employee_details)
// ============================================

router.get('/employees',        requirePermission('about_kvks_employee_details', 'VIEW'),   aboutKvkController.getAllKvkEmployees);
router.get('/employees/:id',    requirePermission('about_kvks_employee_details', 'VIEW'),   aboutKvkController.getKvkEmployeeById);
router.post('/employees',       requirePermission('about_kvks_employee_details', 'ADD'),    aboutKvkController.createKvkEmployee);
router.put('/employees/:id',    requirePermission('about_kvks_employee_details', 'EDIT'),   aboutKvkController.updateKvkEmployee);
router.delete('/employees/:id', requirePermission('about_kvks_employee_details', 'DELETE'), aboutKvkController.deleteKvkEmployee);

// Transfer sub-routes — each uses its own action on about_kvks_employee_details:
//   POST   .../transfer        → ADD  (transferEmployee: initiate a transfer)
//   GET    .../transfer-history → VIEW (getStaffTransferHistory: read history)
//   POST   .../transfer/revert → EDIT (revertTransfer: undo a transfer)
router.post('/employees/:id/transfer',        requirePermission('about_kvks_employee_details', 'ADD'),  aboutKvkController.transferEmployee);
router.get('/employees/:id/transfer-history', requirePermission('about_kvks_employee_details', 'VIEW'), aboutKvkController.getStaffTransferHistory);
router.post('/employees/:id/transfer/revert', requirePermission('about_kvks_employee_details', 'EDIT'), aboutKvkController.revertTransfer);

// ============================================
// KVK Staff Transferred Routes  (moduleCode: about_kvks_staff_details)
// ============================================

router.get('/staff-transferred',        requirePermission('about_kvks_staff_details', 'VIEW'),   aboutKvkController.getAllKvkStaffTransferred);
router.get('/staff-transferred/:id',    requirePermission('about_kvks_staff_details', 'VIEW'),   aboutKvkController.getKvkStaffTransferredById);
router.post('/staff-transferred',       requirePermission('about_kvks_staff_details', 'ADD'),    aboutKvkController.createKvkStaffTransferred);
router.put('/staff-transferred/:id',    requirePermission('about_kvks_staff_details', 'EDIT'),   aboutKvkController.updateKvkStaffTransferred);
router.delete('/staff-transferred/:id', requirePermission('about_kvks_staff_details', 'DELETE'), aboutKvkController.deleteKvkStaffTransferred);

// ============================================
// KVK Infrastructure Routes  (moduleCode: about_kvks_infrastructure_details)
// ============================================

router.get('/infrastructure',        requirePermission('about_kvks_infrastructure_details', 'VIEW'),   aboutKvkController.getAllKvkInfrastructure);
router.get('/infrastructure/:id',    requirePermission('about_kvks_infrastructure_details', 'VIEW'),   aboutKvkController.getKvkInfrastructureById);
router.post('/infrastructure',       requirePermission('about_kvks_infrastructure_details', 'ADD'),    aboutKvkController.createKvkInfrastructure);
router.put('/infrastructure/:id',    requirePermission('about_kvks_infrastructure_details', 'EDIT'),   aboutKvkController.updateKvkInfrastructure);
router.delete('/infrastructure/:id', requirePermission('about_kvks_infrastructure_details', 'DELETE'), aboutKvkController.deleteKvkInfrastructure);

// ============================================
// KVK Vehicle Routes  (moduleCode: about_kvks_vehicle_details)
// ============================================

router.get('/vehicles',        requirePermission('about_kvks_vehicle_details', 'VIEW'),   aboutKvkController.getAllKvkVehicles);
router.get('/vehicles/:id',    requirePermission('about_kvks_vehicle_details', 'VIEW'),   aboutKvkController.getKvkVehicleById);
router.post('/vehicles',       requirePermission('about_kvks_vehicle_details', 'ADD'),    aboutKvkController.createKvkVehicle);
router.put('/vehicles/:id',    requirePermission('about_kvks_vehicle_details', 'EDIT'),   aboutKvkController.updateKvkVehicle);
router.delete('/vehicles/:id', requirePermission('about_kvks_vehicle_details', 'DELETE'), aboutKvkController.deleteKvkVehicle);

// Alias routes (vehicle-details)
router.get('/vehicle-details',        requirePermission('about_kvks_vehicle_details', 'VIEW'),   aboutKvkController.getAllKvkVehicleDetails);
router.get('/vehicle-details/:id',    requirePermission('about_kvks_vehicle_details', 'VIEW'),   aboutKvkController.getKvkVehicleDetailsById);
router.post('/vehicle-details',       requirePermission('about_kvks_vehicle_details', 'ADD'),    aboutKvkController.createKvkVehicleDetails);
router.put('/vehicle-details/:id',    requirePermission('about_kvks_vehicle_details', 'EDIT'),   aboutKvkController.updateKvkVehicleDetails);
router.delete('/vehicle-details/:id', requirePermission('about_kvks_vehicle_details', 'DELETE'), aboutKvkController.deleteKvkVehicleDetails);

// ============================================
// KVK Equipment Routes  (moduleCode: about_kvks_equipment_details)
// ============================================

router.get('/equipments',        requirePermission('about_kvks_equipment_details', 'VIEW'),   aboutKvkController.getAllKvkEquipments);
router.get('/equipments/:id',    requirePermission('about_kvks_equipment_details', 'VIEW'),   aboutKvkController.getKvkEquipmentById);
router.post('/equipments',       requirePermission('about_kvks_equipment_details', 'ADD'),    aboutKvkController.createKvkEquipment);
router.put('/equipments/:id',    requirePermission('about_kvks_equipment_details', 'EDIT'),   aboutKvkController.updateKvkEquipment);
router.delete('/equipments/:id', requirePermission('about_kvks_equipment_details', 'DELETE'), aboutKvkController.deleteKvkEquipment);

// Alias routes (equipment-details)
router.get('/equipment-details',        requirePermission('about_kvks_equipment_details', 'VIEW'),   aboutKvkController.getAllKvkEquipmentDetails);
router.get('/equipment-details/:id',    requirePermission('about_kvks_equipment_details', 'VIEW'),   aboutKvkController.getKvkEquipmentDetailsById);
router.post('/equipment-details',       requirePermission('about_kvks_equipment_details', 'ADD'),    aboutKvkController.createKvkEquipmentDetails);
router.put('/equipment-details/:id',    requirePermission('about_kvks_equipment_details', 'EDIT'),   aboutKvkController.updateKvkEquipmentDetails);
router.delete('/equipment-details/:id', requirePermission('about_kvks_equipment_details', 'DELETE'), aboutKvkController.deleteKvkEquipmentDetails);

// ============================================
// KVK Farm Implement Routes  (moduleCode: about_kvks_farm_implement_details)
// ============================================

router.get('/farm-implements',        requirePermission('about_kvks_farm_implement_details', 'VIEW'),   aboutKvkController.getAllKvkFarmImplements);
router.get('/farm-implements/:id',    requirePermission('about_kvks_farm_implement_details', 'VIEW'),   aboutKvkController.getKvkFarmImplementById);
router.post('/farm-implements',       requirePermission('about_kvks_farm_implement_details', 'ADD'),    aboutKvkController.createKvkFarmImplement);
router.put('/farm-implements/:id',    requirePermission('about_kvks_farm_implement_details', 'EDIT'),   aboutKvkController.updateKvkFarmImplement);
router.delete('/farm-implements/:id', requirePermission('about_kvks_farm_implement_details', 'DELETE'), aboutKvkController.deleteKvkFarmImplement);

// ============================================
// Master Data Routes (dropdown helpers — auth only, no extra permission)
// These are read-only lookup endpoints used in forms to populate dropdowns.
// ============================================

router.get('/sanctioned-posts', aboutKvkController.getAllSanctionedPosts);
router.get('/disciplines',      aboutKvkController.getAllDisciplines);
router.get('/infra-masters',    aboutKvkController.getAllInfraMasters);
router.get('/kvks-dropdown',    aboutKvkController.getAllKvksForDropdown);

// ============================================
// Transfer History & Export
// ============================================

router.get('/staff-transfers', requirePermission('about_kvks_staff_details', 'VIEW'), aboutKvkController.getAllTransfers);
router.post('/export',         requirePermission('about_kvks_view_kvks',    'VIEW'), exportController.exportData);

module.exports = router;
