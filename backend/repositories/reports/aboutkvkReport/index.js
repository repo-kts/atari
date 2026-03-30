const { getKvkBasicInfo } = require('./viewkvkReportRepository.js');
const { getKvkBankAccounts } = require('./bankAccountsReportRepository.js');
const {
    getKvkEmployees,
    getKvkEmployeeHeads,
    getKvkStaffTransferred,
} = require('./employeesReportRepository.js');
const {
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkFarmImplements,
} = require('./assetsReportRepository.js');

module.exports = {
    getKvkBasicInfo,
    getKvkBankAccounts,
    getKvkEmployees,
    getKvkEmployeeHeads,
    getKvkStaffTransferred,
    getKvkInfrastructure,
    getKvkVehicles,
    getKvkVehicleDetails,
    getKvkEquipments,
    getKvkFarmImplements,
};

