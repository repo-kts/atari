const { getKvkBasicInfo } = require('./viewkvkReportRepository.js');
const { getKvkBankAccounts } = require('./bankAccountsReportRepository.js');
const {
    getKvkEmployees,
    getKvkEmployeeHeads,
    getKvkStaffTransferred,
} = require('./employeesReportRepository.js');
const {
    getKvkLandDetails,
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkEquipmentRecords,
} = require('./assetsReportRepository.js');

module.exports = {
    getKvkBasicInfo,
    getKvkBankAccounts,
    getKvkEmployees,
    getKvkEmployeeHeads,
    getKvkStaffTransferred,
    getKvkLandDetails,
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkEquipmentRecords,
};
