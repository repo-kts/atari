const { getNaturalFarmingPhysicalInfoData } = require('./physicalInfoReportRepository.js');
const { getNaturalFarmingDemonstrationData } = require('./demonstrationInfoReportRepository.js');
const { getNaturalFarmingFarmersPracticingData } = require('./farmersPracticingReportRepository.js');
const { getNaturalFarmingSoilData } = require('./soilDataReportRepository.js');
const { getNaturalFarmingBudgetExpenditureData } = require('./budgetExpenditureReportRepository.js');
const prisma = require('../../../config/prisma.js');

function yearRange(year) {
    const y = Number(year);
    if (!Number.isFinite(y)) return null;
    return {
        start: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

function applyDateRange(where, fieldName, filters = {}) {
    if (!(filters.startDate || filters.endDate || filters.year || filters.reportingYearFrom || filters.reportingYearTo)) return;
    where[fieldName] = {};
    if (filters.year && !filters.startDate && !filters.endDate && !filters.reportingYearFrom && !filters.reportingYearTo) {
        const yr = yearRange(filters.year);
        if (yr) {
            where[fieldName].gte = yr.start;
            where[fieldName].lte = yr.end;
        }
        return;
    }
    if (filters.startDate || filters.reportingYearFrom) {
        const from = new Date(filters.startDate || filters.reportingYearFrom);
        if (!isNaN(from)) {
            from.setHours(0, 0, 0, 0);
            where[fieldName].gte = from;
        }
    }
    if (filters.endDate || filters.reportingYearTo) {
        const to = new Date(filters.endDate || filters.reportingYearTo);
        if (!isNaN(to)) {
            to.setHours(23, 59, 59, 999);
            where[fieldName].lte = to;
        }
    }
}

async function getNaturalFarmingGeographicalData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    applyDateRange(where, 'reportingYear', filters);

    return prisma.geographicalInfo.findMany({
        where,
        include: { kvk: { select: { kvkName: true, state: { select: { stateName: true } } } } },
        orderBy: [{ reportingYear: 'asc' }, { geographicalInfoId: 'asc' }],
    });
}

async function getNaturalFarmingBeneficiariesData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    applyDateRange(where, 'reportingYearDate', filters);

    return prisma.beneficiariesDetails.findMany({
        where,
        include: { kvk: { select: { kvkName: true, state: { select: { stateName: true } } } } },
        orderBy: [{ reportingYearDate: 'asc' }, { beneficiariesDetailsId: 'asc' }],
    });
}

module.exports = {
	getNaturalFarmingGeographicalData,
	getNaturalFarmingPhysicalInfoData,
	getNaturalFarmingDemonstrationData,
	getNaturalFarmingFarmersPracticingData,
	getNaturalFarmingBeneficiariesData,
	getNaturalFarmingSoilData,
	getNaturalFarmingBudgetExpenditureData,
};
