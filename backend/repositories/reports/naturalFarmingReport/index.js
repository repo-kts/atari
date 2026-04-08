const { getNaturalFarmingPhysicalInfoData } = require('./physicalInfoReportRepository.js');
const { getNaturalFarmingDemonstrationData } = require('./demonstrationInfoReportRepository.js');
const { getNaturalFarmingFarmersPracticingData } = require('./farmersPracticingReportRepository.js');
const { getNaturalFarmingSoilData } = require('./soilDataReportRepository.js');
const { getNaturalFarmingBudgetExpenditureData } = require('./budgetExpenditureReportRepository.js');

module.exports = {
	getNaturalFarmingPhysicalInfoData,
	getNaturalFarmingDemonstrationData,
	getNaturalFarmingFarmersPracticingData,
	getNaturalFarmingSoilData,
	getNaturalFarmingBudgetExpenditureData,
};
