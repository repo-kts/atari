const prisma = require('../../../config/prisma.js');

/**
 * Instructional Farm Livestock Report Repository
 * Handles data retrieval for Performance of Instructional Farm (Livestock) (Section 10.11)
 */
class InstructionalFarmLivestockReportRepository {
    /**
     * Get Instructional Farm Livestock data for a KVK
     */
    async getInstructionalFarmLivestockData(kvkId, filters = {}) {
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

        const records = await prisma.instructionalFarmLivestock.findMany({
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
                id: record.instructionalFarmLivestockId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                reportingYear: record.reportingYear,
                animalName: record.animalName || '-',
                speciesBreed: record.speciesBreed || '-',
                typeOfProduce: record.typeOfProduce || '-',
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

module.exports = new InstructionalFarmLivestockReportRepository();
