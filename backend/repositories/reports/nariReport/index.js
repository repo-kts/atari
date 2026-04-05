const { getNariNutritionGardenData } = require('./nariNutritionGardenReportRepository.js');
const { getNariBioFortifiedData }    = require('./nariBioFortifiedReportRepository.js');
const { getNariValueAdditionData }   = require('./nariValueAdditionReportRepository.js');
const { getNariTrainingData }        = require('./nariTrainingReportRepository.js');
const { getNariExtensionData }       = require('./nariExtensionReportRepository.js');

module.exports = {
    getNariNutritionGardenData,
    getNariBioFortifiedData,
    getNariValueAdditionData,
    getNariTrainingData,
    getNariExtensionData,
};
