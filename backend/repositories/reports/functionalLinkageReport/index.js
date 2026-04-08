const prisma = require('../../../config/prisma.js');

/**
 * Functional Linkage Report Repository
 * Handles data retrieval for Functional Linkage reports (Section 2.14)
 */
class FunctionalLinkageReportRepository {
    /**
     * Get Functional Linkage data for a KVK
     */
    async getFunctionalLinkageData(kvkId, filters = {}) {
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

        const records = await prisma.functionalLinkage.findMany({
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
        return records.map(record => ({
            id: record.functionalLinkageId,
            kvkId: record.kvkId,
            kvkName: record.kvk?.kvkName || '-',
            stateName: record.kvk?.state?.stateName || '-',
            districtName: record.kvk?.district?.districtName || '-',
            reportingYear: record.reportingYear,
            organizationName: record.organizationName || '-',
            natureOfLinkage: record.natureOfLinkage || '-',
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }
}

module.exports = new FunctionalLinkageReportRepository();
