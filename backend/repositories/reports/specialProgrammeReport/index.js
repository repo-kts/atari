const prisma = require('../../../config/prisma.js');

/**
 * Special Programme Report Repository
 * Handles data retrieval for Special Programme reports (Section 10.20)
 */
class SpecialProgrammeReportRepository {
    /**
     * Get Special Programme data for a KVK
     * Includes KVK, State, and District relations for normalization
     */
    async getSpecialProgrammeData(kvkId, filters = {}) {
        const where = {
            kvkId: parseInt(kvkId)
        };

        // Handle date range filters
        if (filters.startDate && filters.endDate) {
            where.initiationDate = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate)
            };
        } else if (filters.year) {
            // If year filter is provided, filter by initiationDate year
            const yearStr = String(filters.year);
            where.initiationDate = {
                gte: new Date(`${yearStr}-01-01`),
                lte: new Date(`${yearStr}-12-31T23:59:59.999Z`)
            };
        }

        const records = await prisma.specialProgramme.findMany({
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
                initiationDate: 'asc'
            }
        });

        // Normalize response fields for template and export
        return records.map(record => ({
            id: record.specialProgrammeId,
            kvkId: record.kvkId,
            kvkName: record.kvk?.kvkName || '-',
            stateName: record.kvk?.state?.stateName || '-',
            districtName: record.kvk?.district?.districtName || '-',
            reportingYear: record.reportingYear,
            programmeType: record.programmeType || '-',
            programmeName: record.programmeName || '-',
            programmePurpose: record.programmePurpose || '-',
            initiationDate: record.initiationDate,
            fundingAgency: record.fundingAgency || '-',
            amount: record.amount || 0,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }
}

module.exports = new SpecialProgrammeReportRepository();
