const prisma = require('../../../config/prisma.js');

/**
 * Instructional Farm Crop Report Repository
 * Handles data retrieval for Performance of Instructional Farm (Crops) (Section 10.9)
 */
class InstructionalFarmCropReportRepository {
    /**
     * Get Instructional Farm Crop data for a KVK
     */
    async getInstructionalFarmCropData(kvkId, filters = {}) {
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

        const records = await prisma.instructionalFarmCrop.findMany({
            where,
            include: {
                kvk: {
                    include: {
                        state: true,
                        district: true
                    }
                },
                season: {
                    select: { seasonName: true }
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
                id: record.instructionalFarmCropId,
                kvkId: record.kvkId,
                kvkName: kvk.kvkName || '-',
                stateName: state.stateName || '-',
                districtName: district.districtName || '-',
                reportingYear: record.reportingYear,
                seasonName: record.season?.seasonName || '-',
                cropName: record.cropName || '-',
                area: record.area || 0,
                variety: record.variety || '-',
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

module.exports = new InstructionalFarmCropReportRepository();
