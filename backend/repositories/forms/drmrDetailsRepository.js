const prisma = require('../../config/prisma.js');

const drmrDetailsRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);
        const reportingYearId = data.reportingYearId || data.yearId ? parseInt(data.reportingYearId || data.yearId) : null;

        const situation = data.situations || data.situation || '';
        const varietyImprovedPractice = data.varietiesTechImproved || data.varietyImprovedPractice || '';
        const varietyFarmerPractice = data.varietiesFarmerPractise || data.varietyFarmerPractice || '';

        const yieldImprovedKgPerHa = parseFloat(data.yieldImproved || data.yieldImprovedKgPerHa) || 0;
        const yieldFarmerKgPerHa = parseFloat(data.yieldFarmerPractise || data.yieldFarmerKgPerHa) || 0;
        const yieldIncreasePercent = parseFloat(data.yieldIncreasePercent) || 0;

        const costImprovedPerHa = parseFloat(data.costImproved || data.costImprovedPerHa) || 0;
        const costFarmerPerHa = parseFloat(data.costFarmerPractise || data.costFarmerPerHa) || 0;

        const grossReturnImprovedPerHa = parseFloat(data.grossReturnImproved || data.grossReturnImprovedPerHa) || 0;
        const grossReturnFarmerPerHa = parseFloat(data.grossReturnFarmerPractise || data.grossReturnFarmerPerHa) || 0;

        const netReturnImprovedPerHa = parseFloat(data.netReturnImproved || data.netReturnImprovedPerHa) || 0;
        const netReturnFarmerPerHa = parseFloat(data.netReturnFarmerPractise || data.netReturnFarmerPerHa) || 0;

        const bcRatioImproved = parseFloat(data.bcRatioImproved) || 0;
        const bcRatioFarmer = parseFloat(data.bcRatioFarmerPractise || data.bcRatioFarmer) || 0;

        const [insertResult] = await prisma.$queryRawUnsafe(`
            INSERT INTO drmr_details (
                "kvkId", reporting_year_id, situation, variety_improved_practice, 
                variety_farmer_practice, yield_improved_kg_per_ha, yield_farmer_kg_per_ha, 
                yield_increase_percent, cost_improved_per_ha, cost_farmer_per_ha, 
                gross_return_improved_per_ha, gross_return_farmer_per_ha, 
                net_return_improved_per_ha, net_return_farmer_per_ha, 
                bc_ratio_improved, bc_ratio_farmer, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING drmr_details_id
        `, kvkId, reportingYearId, situation, varietyImprovedPractice,
            varietyFarmerPractice, yieldImprovedKgPerHa, yieldFarmerKgPerHa,
            yieldIncreasePercent, costImprovedPerHa, costFarmerPerHa,
            grossReturnImprovedPerHa, grossReturnFarmerPerHa,
            netReturnImprovedPerHa, netReturnFarmerPerHa,
            bcRatioImproved, bcRatioFarmer);

        const newId = insertResult.drmr_details_id;

        return drmrDetailsRepository.findById(newId);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYearId) {
            where.reportingYearId = parseInt(filters.reportingYearId);
        }

        const results = await prisma.drmrDetails.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
            },
            orderBy: { drmrDetailsId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.drmrDetails.findUnique({
            where: { drmrDetailsId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const existing = await prisma.drmrDetails.findUnique({
            where: { drmrDetailsId: parseInt(id) }
        });
        if (!existing) throw new Error("Record not found");

        const updateData = {};
        if (data.reportingYearId !== undefined || data.yearId !== undefined) {
            updateData.reportingYearId = parseInt(data.reportingYearId || data.yearId);
        }
        if (data.situations !== undefined || data.situation !== undefined)
            updateData.situation = data.situations || data.situation;
        if (data.varietiesTechImproved !== undefined || data.varietyImprovedPractice !== undefined)
            updateData.varietyImprovedPractice = data.varietiesTechImproved || data.varietyImprovedPractice;
        if (data.varietiesFarmerPractise !== undefined || data.varietyFarmerPractice !== undefined)
            updateData.varietyFarmerPractice = data.varietiesFarmerPractise || data.varietyFarmerPractice;

        if (data.yieldImproved !== undefined || data.yieldImprovedKgPerHa !== undefined)
            updateData.yieldImprovedKgPerHa = parseFloat(data.yieldImproved || data.yieldImprovedKgPerHa);
        if (data.yieldFarmerPractise !== undefined || data.yieldFarmerKgPerHa !== undefined)
            updateData.yieldFarmerKgPerHa = parseFloat(data.yieldFarmerPractise || data.yieldFarmerKgPerHa);
        if (data.yieldIncreasePercent !== undefined)
            updateData.yieldIncreasePercent = parseFloat(data.yieldIncreasePercent);

        if (data.costImproved !== undefined || data.costImprovedPerHa !== undefined)
            updateData.costImprovedPerHa = parseFloat(data.costImproved || data.costImprovedPerHa);
        if (data.costFarmerPractise !== undefined || data.costFarmerPerHa !== undefined)
            updateData.costFarmerPerHa = parseFloat(data.costFarmerPractise || data.costFarmerPerHa);

        if (data.grossReturnImproved !== undefined || data.grossReturnImprovedPerHa !== undefined)
            updateData.grossReturnImprovedPerHa = parseFloat(data.grossReturnImproved || data.grossReturnImprovedPerHa);
        if (data.grossReturnFarmerPractise !== undefined || data.grossReturnFarmerPerHa !== undefined)
            updateData.grossReturnFarmerPerHa = parseFloat(data.grossReturnFarmerPractise || data.grossReturnFarmerPerHa);

        if (data.netReturnImproved !== undefined || data.netReturnImprovedPerHa !== undefined)
            updateData.netReturnImprovedPerHa = parseFloat(data.netReturnImproved || data.netReturnImprovedPerHa);
        if (data.netReturnFarmerPractise !== undefined || data.netReturnFarmerPerHa !== undefined)
            updateData.netReturnFarmerPerHa = parseFloat(data.netReturnFarmerPractise || data.netReturnFarmerPerHa);

        if (data.bcRatioImproved !== undefined)
            updateData.bcRatioImproved = parseFloat(data.bcRatioImproved);
        if (data.bcRatioFarmerPractise !== undefined || data.bcRatioFarmer !== undefined)
            updateData.bcRatioFarmer = parseFloat(data.bcRatioFarmerPractise || data.bcRatioFarmer);

        await prisma.$executeRawUnsafe(`
            UPDATE drmr_details 
            SET 
                reporting_year_id = $1, situation = $2, variety_improved_practice = $3, 
                variety_farmer_practice = $4, yield_improved_kg_per_ha = $5, yield_farmer_kg_per_ha = $6, 
                yield_increase_percent = $7, cost_improved_per_ha = $8, cost_farmer_per_ha = $9, 
                gross_return_improved_per_ha = $10, gross_return_farmer_per_ha = $11, 
                net_return_improved_per_ha = $12, net_return_farmer_per_ha = $13, 
                bc_ratio_improved = $14, bc_ratio_farmer = $15, 
                updated_at = CURRENT_TIMESTAMP
            WHERE drmr_details_id = $16
        `,
            updateData.reportingYearId ?? existing.reportingYearId,
            updateData.situation ?? existing.situation,
            updateData.varietyImprovedPractice ?? existing.varietyImprovedPractice,
            updateData.varietyFarmerPractice ?? existing.varietyFarmerPractice,
            updateData.yieldImprovedKgPerHa ?? existing.yieldImprovedKgPerHa,
            updateData.yieldFarmerKgPerHa ?? existing.yieldFarmerKgPerHa,
            updateData.yieldIncreasePercent ?? existing.yieldIncreasePercent,
            updateData.costImprovedPerHa ?? existing.costImprovedPerHa,
            updateData.costFarmerPerHa ?? existing.costFarmerPerHa,
            updateData.grossReturnImprovedPerHa ?? existing.grossReturnImprovedPerHa,
            updateData.grossReturnFarmerPerHa ?? existing.grossReturnFarmerPerHa,
            updateData.netReturnImprovedPerHa ?? existing.netReturnImprovedPerHa,
            updateData.netReturnFarmerPerHa ?? existing.netReturnFarmerPerHa,
            updateData.bcRatioImproved ?? existing.bcRatioImproved,
            updateData.bcRatioFarmer ?? existing.bcRatioFarmer,
            parseInt(id)
        );

        return drmrDetailsRepository.findById(id);
    },

    delete: async (id) => {
        return await prisma.drmrDetails.delete({
            where: { drmrDetailsId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.drmrDetailsId,
        drmrDetailsId: r.drmrDetailsId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYearId: r.reportingYearId,
        yearId: r.reportingYearId,
        reportingYear: r.reportingYear ? r.reportingYear.yearName : undefined,
        situation: r.situation,
        situations: r.situation,
        varietyImprovedPractice: r.varietyImprovedPractice,
        varietiesTechImproved: r.varietyImprovedPractice,
        varietyFarmerPractice: r.varietyFarmerPractice,
        varietiesFarmerPractise: r.varietyFarmerPractice,
        yieldImprovedKgPerHa: r.yieldImprovedKgPerHa,
        yieldImproved: r.yieldImprovedKgPerHa,
        yieldFarmerKgPerHa: r.yieldFarmerKgPerHa,
        yieldFarmerPractise: r.yieldFarmerKgPerHa,
        yieldIncreasePercent: r.yieldIncreasePercent,
        costImprovedPerHa: r.costImprovedPerHa,
        costImproved: r.costImprovedPerHa,
        costFarmerPerHa: r.costFarmerPerHa,
        costFarmerPractise: r.costFarmerPerHa,
        grossReturnImprovedPerHa: r.grossReturnImprovedPerHa,
        grossReturnImproved: r.grossReturnImprovedPerHa,
        grossReturnFarmerPerHa: r.grossReturnFarmerPerHa,
        grossReturnFarmerPractise: r.grossReturnFarmerPerHa,
        netReturnImprovedPerHa: r.netReturnImprovedPerHa,
        netReturnImproved: r.netReturnImprovedPerHa,
        netReturnFarmerPerHa: r.netReturnFarmerPerHa,
        netReturnFarmerPractise: r.netReturnFarmerPerHa,
        bcRatioImproved: r.bcRatioImproved,
        bcRatioFarmer: r.bcRatioFarmer,
        bcRatioFarmerPractise: r.bcRatioFarmer,

        // Frontend aliases from routeConfig.ts
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Varieties used in IP': r.varietyImprovedPractice,
        'Situations (Irrigated/ Rainfed)': r.situation,
        'Varieties used in FP': r.varietyFarmerPractice,
        'Net Return Improved Practice(Rs./ha)': r.netReturnImprovedPerHa,
        'Net Return Farmer Practice(Rs./ha)': r.netReturnFarmerPerHa,
    };
}

module.exports = drmrDetailsRepository;
