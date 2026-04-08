const {
    getAgriDroneIntroductionData,
    resolveAgriDroneIntroductionPayload,
    enrichAgriDroneIntroductionExport,
} = require('./agriDroneIntroductionReportRepository.js');
const {
    getAgriDroneDemonstrationDetailsData,
    resolveAgriDroneDemonstrationDetailsPayload,
} = require('./agriDroneDemonstrationDetailsReportRepository.js');

module.exports = {
    getAgriDroneIntroductionData,
    resolveAgriDroneIntroductionPayload,
    enrichAgriDroneIntroductionExport,
    getAgriDroneDemonstrationDetailsData,
    resolveAgriDroneDemonstrationDetailsPayload,
};
