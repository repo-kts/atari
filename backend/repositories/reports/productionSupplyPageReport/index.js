const repo = require('./productionSupplyPageReportRepository.js');

module.exports = {
    buildPagePayloadFromRecords: repo.buildPagePayloadFromRecords,
    resolveProductionSupplyPagePayload: repo.resolveProductionSupplyPagePayload,
    getProductionSupplyReportData: repo.getProductionSupplyReportData,
    fetchProductionSupplyRecordsForReport: repo.fetchProductionSupplyRecordsForReport,
};
