const repo = require('./soilWaterEquipmentReportRepository.js');

module.exports = {
    getSoilWaterEquipmentReportData: repo.getSoilWaterEquipmentReportData,
    fetchSoilWaterEquipmentRecordsForReport: repo.fetchSoilWaterEquipmentRecordsForReport,
    buildPagePayloadFromRecords: repo.buildPagePayloadFromRecords,
    resolveSoilWaterEquipmentPagePayload: repo.resolveSoilWaterEquipmentPagePayload,
};
