const repo = require('./technologyWeekCelebrationReportRepository.js');

module.exports = {
    getTechnologyWeekCelebrationReportData: repo.getTechnologyWeekCelebrationReportData,
    fetchTechnologyWeekRecords: repo.fetchTechnologyWeekRecords,
    buildPagePayloadFromRecords: repo.buildPagePayloadFromRecords,
    buildStateSummaryFromRecords: repo.buildStateSummaryFromRecords,
    resolveTechnologyWeekPagePayload: repo.resolveTechnologyWeekPagePayload,
    resolveTechnologyWeekStateSummaryPayload: repo.resolveTechnologyWeekStateSummaryPayload,
};
