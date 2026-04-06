const prisma = require('../../../config/prisma.js');

/**
 * KVK Impact Activity Report Repository
 * Handles data retrieval for Impact of KVK activities (Section 10.1)
 */
class KvkImpactActivityReportRepository {
    /**
     * Get Impact of KVK Activity data for a KVK
     */
    async getKvkImpactActivityData(kvkId, filters = {}) {
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

        const records = await prisma.kvkImpactActivity.findMany({
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

        // Normalize response fields with defensive fallback to KVK level data if needed
        return records.map(record => {
            const kvk = record.kvk || {};
            const state = kvk.state || {};
            const district = kvk.district || {};
            
            return {
                id: record.impactActivityId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                reportingYear: record.reportingYear,
                specificArea: record.specificArea || '-',
                briefDetails: record.briefDetails || '-',
                farmersBenefitted: record.farmersBenefitted || 0,
                horizontalSpread: record.horizontalSpread || '0',
                adoptionPercentage: record.adoptionPercentage || 0,
                qualitativeImpact: record.qualitativeImpact || '-',
                quantitativeImpact: record.quantitativeImpact || '-',
                incomeBefore: record.incomeBefore || 0,
                incomeAfter: record.incomeAfter || 0,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        });
    }
}

module.exports = new KvkImpactActivityReportRepository();
