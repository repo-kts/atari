const prisma = require('../../../config/prisma.js');

/**
 * Staff Quarters Utilization Report Repository
 * Handles data retrieval for Staff Quarters (Section 10.13)
 */
class StaffQuartersUtilizationReportRepository {
    /**
     * Get Staff Quarters Utilization data for a KVK
     */
    async getStaffQuartersUtilizationData(kvkId, filters = {}) {
        const where = {
            kvkId: parseInt(kvkId)
        };

        // Handle date range filters
        if (filters.startDate && filters.endDate) {
            where.dateOfCompletion = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate)
            };
        } else if (filters.year) {
            const yearStr = String(filters.year);
            where.dateOfCompletion = {
                gte: new Date(`${yearStr}-01-01`),
                lte: new Date(`${yearStr}-12-31T23:59:59.999Z`)
            };
        }

        const records = await prisma.staffQuartersUtilization.findMany({
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

            // Parse occupancyData JSON safely
            let occupancyData = null;
            if (record.occupancyData) {
                try {
                    occupancyData = typeof record.occupancyData === 'string'
                        ? JSON.parse(record.occupancyData)
                        : record.occupancyData;
                } catch {
                    occupancyData = null;
                }
            }

            return {
                id: record.staffQuartersUtilizationId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                // Pass raw value — template's formatDate() handles ISO string / Date object
                dateOfCompletion: record.dateOfCompletion,
                isCompleted: record.isCompleted || '-',
                numberOfQuarters: record.numberOfQuarters || 0,
                occupancyDetails: record.occupancyDetails || '-',
                occupancyData,
                remark: record.remark || '-',
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        });
    }
}

module.exports = new StaffQuartersUtilizationReportRepository();
