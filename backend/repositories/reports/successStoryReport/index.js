const prisma = require('../../../config/prisma.js');

/**
 * Success Story Report Repository
 * Handles data retrieval for Success Story reports (Section 10.3)
 */
class SuccessStoryReportRepository {
    /**
     * Get Success Story data for a KVK
     */
    async getSuccessStoryData(kvkId, filters = {}) {
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

        const records = await prisma.successStory.findMany({
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
            id: record.successStoryId,
            kvkId: record.kvkId,
            kvkName: record.kvk?.kvkName || '-',
            stateName: record.kvk?.state?.stateName || '-',
            districtName: record.kvk?.district?.districtName || '-',
            reportingYear: record.reportingYear,
            farmerName: record.farmerName || '-',
            dateOfBirth: record.dateOfBirth,
            education: record.education || '-',
            experience: record.experience || '-',
            contact: record.contact || '-',
            fullAddress: record.fullAddress || '-',
            professionalMembership: record.professionalMembership || 'NA',
            awardsReceived: record.awardsReceived || 'NA',
            majorAchievement: record.majorAchievement || '-',
            storyTitle: record.storyTitle || '-',
            problemStatement: record.problemStatement || '-',
            kvkIntervention: record.kvkIntervention || '-',
            practicesFollowed: record.practicesFollowed || '-',
            results: record.results || '-',
            impact: record.impact || '-',
            futurePlans: record.futurePlans || 'NA',
            enterprise: record.enterprise || '-',
            grossIncome: record.grossIncome || 0,
            netIncome: record.netIncome || 0,
            costBenefitRatio: record.costBenefitRatio || 0,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }
}

module.exports = new SuccessStoryReportRepository();
