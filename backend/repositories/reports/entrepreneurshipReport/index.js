const prisma = require('../../../config/prisma.js');

/**
 * Entrepreneurship Report Repository
 * Handles data retrieval for Entrepreneurship reports (Section 10.2)
 */
class EntrepreneurshipReportRepository {
    /**
     * Get Entrepreneurship data for a KVK
     */
    async getEntrepreneurshipData(kvkId, filters = {}) {
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

        const records = await prisma.entrepreneurship.findMany({
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
            id: record.entrepreneurshipId,
            kvkId: record.kvkId,
            kvkName: record.kvk?.kvkName || '-',
            stateName: record.kvk?.state?.stateName || '-',
            districtName: record.kvk?.district?.districtName || '-',
            reportingYear: record.reportingYear,
            entrepreneurName: record.entrepreneurName || '-',
            registeredAddress: record.registeredAddress || '-',
            yearOfEstablishment: record.yearOfEstablishment || '-',
            enterpriseType: record.enterpriseType || '-',
            membersAssociated: record.membersAssociated || 0,
            registrationDetails: record.registrationDetails || '-',
            technicalComponents: record.technicalComponents || '-',
            kvkRole: record.kvkRole || '-',
            annualIncome: record.annualIncome || 0,
            developmentTimeline: record.developmentTimeline || '-',
            statusBeforeAfter: record.statusBeforeAfter || '-',
            presentWorkingCondition: record.presentWorkingCondition || '-',
            majorAchievements: record.majorAchievements || '-',
            majorConstraints: record.majorConstraints || '-',
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }
}

module.exports = new EntrepreneurshipReportRepository();
