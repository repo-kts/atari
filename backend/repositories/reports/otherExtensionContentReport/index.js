const repo = require('./otherExtensionContentReportRepository.js');

module.exports = {
    getOtherExtensionContentReportData: repo.getOtherExtensionContentReportData,
    fetchOtherExtensionActivities: repo.fetchOtherExtensionActivities,
    buildPagePayloadFromRecords: repo.buildPagePayloadFromRecords,
    buildMatrixPayloadFromRecords: repo.buildMatrixPayloadFromRecords,
    resolveOtherExtensionPagePayload: repo.resolveOtherExtensionPagePayload,
    resolveOtherExtensionMatrixPayload: repo.resolveOtherExtensionMatrixPayload,
};
