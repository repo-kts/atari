const prisma = require('../../../config/prisma.js');

/**
 * Hostel Utilization Report Repository
 * Handles data retrieval for Hostel Facilities (Section 10.12)
 */
class HostelUtilizationReportRepository {
    /**
     * Get Hostel Utilization data for a KVK
     */
    async getHostelUtilizationData(kvkId, filters = {}) {
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

        const records = await prisma.hostelUtilization.findMany({
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
                id: record.hostelUtilizationId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                reportingYear: record.reportingYear,
                months: record.months || '-',
                traineesStayed: record.traineesStayed || 0,
                traineeDays: record.traineeDays || 0,
                reasonForShortFall: record.reasonForShortFall || '-',
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        });
    }
}

module.exports = new HostelUtilizationReportRepository();
