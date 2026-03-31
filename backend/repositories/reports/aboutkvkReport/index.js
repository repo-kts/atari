const viewkvkReportRepository = require('./viewkvkReportRepository.js');
const bankAccountsReportRepository = require('./bankAccountsReportRepository.js');
const employeesReportRepository = require('./employeesReportRepository.js');
const infrastructureReportRepository = require('./infrastructureReportRepository.js');
const vehiclesReportRepository = require('./vehiclesReportRepository.js');
const equipmentsReportRepository = require('./equipmentsReportRepository.js');
const farmImplementsReportRepository = require('./farmImplementsReportRepository.js');

module.exports = {
    ...viewkvkReportRepository,
    ...bankAccountsReportRepository,
    ...employeesReportRepository,
    ...infrastructureReportRepository,
    ...vehiclesReportRepository,
    ...equipmentsReportRepository,
    ...farmImplementsReportRepository,
};
