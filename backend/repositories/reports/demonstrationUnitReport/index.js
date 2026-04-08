const prisma = require('../../../config/prisma.js');

/**
 * Demonstration Unit Report Repository
 * Handles data retrieval for Performance of Demonstration Units (Section 10.8)
 */
class DemonstrationUnitReportRepository {
    /**
     * Get Demonstration Unit data for a KVK
     */
    async getDemonstrationUnitData(kvkId, filters = {}) {
        const where = {
            kvkId: parseInt(kvkId)
        };

        // Handle date range filters
        if (filters.startDate && filters.endDate) {
            where.reportingYear = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate)
            };
        } else if (filters.year) {
            const yearStr = String(filters.year);
            where.reportingYear = {
                gte: new Date(`${yearStr}-01-01`),
                lte: new Date(`${yearStr}-12-31T23:59:59.999Z`)
            };
        }

        const records = await prisma.demonstrationUnit.findMany({
            where,
            include: {
                kvk: {
                    include: {
                        state: true,
                        district: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Normalize response fields
        return records.map(record => {
            const kvk = record.kvk || {};
            const state = kvk.state || {};
            const district = kvk.district || {};

            return {
                id: record.demonstrationUnitId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                reportingYear: record.reportingYear,
                demoUnitName: record.demoUnitName || '-',
                yearOfEstablishment: record.yearOfEstablishment || '-',
                area: record.area || 0,
                varietyBreed: record.varietyBreed || '-',
                produce: record.produce || '-',
                quantity: record.quantity || 0,
                costOfInputs: record.costOfInputs || 0,
                grossIncome: record.grossIncome || 0,
                remarks: record.remarks || '-',
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        });
    }
}

module.exports = new DemonstrationUnitReportRepository();
