const prisma = require('../../../config/prisma.js');

/**
 * Rainwater Harvesting Report Repository
 * Handles data retrieval for Rainwater Harvesting (Section 10.14)
 */
class RainwaterHarvestingReportRepository {
    /**
     * Get Rainwater Harvesting data for a KVK
     */
    async getRainwaterHarvestingData(kvkId, filters = {}) {
        const where = {};
        
        if (kvkId) {
            where.kvkId = parseInt(kvkId);
        }

        // Handle date range filters
        if (filters.startDate && filters.endDate) {
            where.createdAt = {
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

        const records = await prisma.rainwaterHarvesting.findMany({
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
                id: record.rainwaterHarvestingId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                reportingYear: record.reportingYear ? new Date(record.reportingYear).getFullYear() : '-',
                trainingProgrammes: record.trainingProgrammes || 0,
                demonstrations: record.demonstrations || 0,
                plantMaterial: record.plantMaterial || 0,
                farmerVisits: record.farmerVisits || 0,
                officialVisits: record.officialVisits || 0,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        });
    }
}

module.exports = new RainwaterHarvestingReportRepository();
