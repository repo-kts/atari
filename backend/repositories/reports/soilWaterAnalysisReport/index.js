const repo = require('./soilWaterAnalysisReportRepository.js');

module.exports = {
    getSoilWaterAnalysisReportData: repo.getSoilWaterAnalysisReportData,
    fetchAnalysisRecordsForReport: repo.fetchAnalysisRecordsForReport,
    resolveSoilWaterSamplesBPayload: repo.resolveSoilWaterSamplesBPayload,
    resolveSoilWaterAnalysisStatePayload: repo.resolveSoilWaterAnalysisStatePayload,
};
