const repo = require('./celebrationDaysReportRepository.js');

module.exports = {
    getCelebrationDaysReportData: repo.getCelebrationDaysReportData,
    fetchCelebrationRecords: repo.fetchCelebrationRecords,
    fetchMasterDayNames: repo.fetchMasterDayNames,
    buildPagePayloadFromRecords: repo.buildPagePayloadFromRecords,
    buildStateMatrixFromRecords: repo.buildStateMatrixFromRecords,
    resolveCelebrationDaysPagePayload: repo.resolveCelebrationDaysPagePayload,
    resolveCelebrationDaysMatrixPayload: repo.resolveCelebrationDaysMatrixPayload,
};
