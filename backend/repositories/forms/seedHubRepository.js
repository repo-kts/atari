const prisma = require('../../config/prisma.js');

const seedHubRepository = {
    findAll: async (filters = {}, user) => {
        const { kvkId, year, reportingYearId } = filters;
        const where = {};

        // Role-based filtering
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (kvkId) {
            where.kvkId = parseInt(kvkId);
        }

        if (reportingYearId) {
            where.reportingYearId = parseInt(reportingYearId);
        } else if (year) {
            where.reportingYearId = parseInt(year);
        }

        const results = await prisma.kvkSeedHubProgram.findMany({
            where,
            include: {
                kvk: {
                    select: { kvkName: true }
                },
                season: {
                    select: { seasonName: true }
                },
                reportingYear: { select: { yearId: true, yearName: true } }
            },
            orderBy: { seedHubId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { seedHubId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkSeedHubProgram.findFirst({
            where,
            include: {
                kvk: {
                    select: { kvkName: true }
                },
                season: {
                    select: { seasonName: true }
                },
                reportingYear: { select: { yearId: true, yearName: true } }
            }
        });
        return result ? _mapResponse(result) : null;
    },

    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        // Field mappings from frontend
        const reportingYearId = parseInt(data.reportingYearId || data.yearId) || null;
        const seasonId = parseInt(data.seasonId) || 1;
        const cropName = data.cropName || '';
        const varietyName = data.varietyName || data.variety || '';
        const areaCoveredHa = parseFloat(data.areaCovered || data.areaCoveredHa || data.area || 0);
        const yieldQPerHa = parseFloat(data.yield || data.yieldQPerHa || 0);
        const quantityProducedQ = parseFloat(data.quantityProduced || data.quantityProducedQ || 0);
        const quantitySaleOutQ = parseFloat(data.quantitySold || data.quantitySaleOutQ || 0);
        const farmersPurchased = parseInt(data.farmersCount || data.farmersPurchased || 0);
        const quantitySaleToFarmersQ = parseFloat(data.quantitySoldFarmers || data.quantitySaleToFarmersQ || 0);
        const villagesCovered = parseInt(data.villagesCovered || 0);
        const quantitySaleToOtherOrgQ = parseFloat(data.quantitySoldOrg || data.quantitySaleToOtherOrgQ || 0);
        const amountGeneratedLakh = parseFloat(data.amountGenerated || data.amountGeneratedLakh || 0);
        const totalAmountPresentLakh = parseFloat(data.totalAmountPresently || data.totalAmountPresentLakh || 0);

        await prisma.$executeRawUnsafe(`
            INSERT INTO kvk_seed_hub_program (
                "kvkId", reporting_year_id, "seasonId", crop_name, variety_name, 
                area_covered_ha, yield_q_per_ha, quantity_produced_q, 
                quantity_sale_out_q, farmers_purchased, quantity_sale_to_farmers_q, 
                villages_covered, quantity_sale_to_other_org_q, amount_generated_lakh, 
                total_amount_present_lakh, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, reportingYearId, seasonId, cropName, varietyName, areaCoveredHa,
            yieldQPerHa, quantityProducedQ, quantitySaleOutQ, farmersPurchased,
            quantitySaleToFarmersQ, villagesCovered, quantitySaleToOtherOrgQ,
            amountGeneratedLakh, totalAmountPresentLakh);

        const result = await prisma.kvkSeedHubProgram.findFirst({
            where: {
                kvkId,
                reportingYearId: reportingYearId,
                cropName,
                varietyName
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
            },
            orderBy: { seedHubId: 'desc' }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { seedHubId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkSeedHubProgram.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        // Extract fields with logical fallbacks to existing values
        const reportingYearId = parseInt(data.reportingYearId || data.yearId || existing.reportingYearId);
        const seasonId = parseInt(data.seasonId || existing.seasonId);
        const cropName = data.cropName || existing.cropName;
        const varietyName = data.varietyName || data.variety || existing.varietyName;
        const areaCoveredHa = parseFloat(data.areaCovered || data.areaCoveredHa || data.area || existing.areaCoveredHa);
        const yieldQPerHa = parseFloat(data.yield || data.yieldQPerHa || existing.yieldQPerHa);
        const quantityProducedQ = parseFloat(data.quantityProduced || data.quantityProducedQ || existing.quantityProducedQ);
        const quantitySaleOutQ = parseFloat(data.quantitySold || data.quantitySaleOutQ || existing.quantitySaleOutQ);
        const farmersPurchased = parseInt(data.farmersCount || data.farmersPurchased || existing.farmersPurchased);
        const quantitySaleToFarmersQ = parseFloat(data.quantitySoldFarmers || data.quantitySaleToFarmersQ || existing.quantitySaleToFarmersQ);
        const villagesCovered = parseInt(data.villagesCovered || existing.villagesCovered);
        const quantitySaleToOtherOrgQ = parseFloat(data.quantitySoldOrg || data.quantitySaleToOtherOrgQ || existing.quantitySaleToOtherOrgQ);
        const amountGeneratedLakh = parseFloat(data.amountGenerated || data.amountGeneratedLakh || existing.amountGeneratedLakh);
        const totalAmountPresentLakh = parseFloat(data.totalAmountPresently || data.totalAmountPresentLakh || existing.totalAmountPresentLakh);

        await prisma.$executeRawUnsafe(`
            UPDATE kvk_seed_hub_program 
            SET 
                reporting_year_id = $1, "seasonId" = $2, crop_name = $3, variety_name = $4, 
                area_covered_ha = $5, yield_q_per_ha = $6, quantity_produced_q = $7, 
                quantity_sale_out_q = $8, farmers_purchased = $9, 
                quantity_sale_to_farmers_q = $10, villages_covered = $11, 
                quantity_sale_to_other_org_q = $12, amount_generated_lakh = $13, 
                total_amount_present_lakh = $14, updated_at = CURRENT_TIMESTAMP
            WHERE seed_hub_id = $15
        `,
            reportingYearId,
            seasonId,
            cropName,
            varietyName,
            areaCoveredHa,
            yieldQPerHa,
            quantityProducedQ,
            quantitySaleOutQ,
            farmersPurchased,
            quantitySaleToFarmersQ,
            villagesCovered,
            quantitySaleToOtherOrgQ,
            amountGeneratedLakh,
            totalAmountPresentLakh,
            parseInt(id)
        );

        const updated = await prisma.kvkSeedHubProgram.findUnique({
            where: { seedHubId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
            }
        });
        return updated ? _mapResponse(updated) : null;
    },

    delete: async (id, user) => {
        const where = { seedHubId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkSeedHubProgram.deleteMany({
            where
        });

        if (result.count === 0) throw new Error('Record not found or unauthorized');

        return { success: true };
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.seedHubId,
        kvkId: r.kvkId,
        reportingYearId: r.reportingYearId,
        yearId: r.reportingYearId, // Frontend alias
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        reportingYear: r.reportingYear ? r.reportingYear.yearName : undefined, // Display year name
        cropName: r.cropName,
        varietyName: r.varietyName,
        variety: r.varietyName,

        // Field mappings to match SeedHubForms.tsx
        areaCovered: r.areaCoveredHa,
        areaCoveredHa: r.areaCoveredHa,
        area: r.areaCoveredHa,

        yield: r.yieldQPerHa,
        yieldQPerHa: r.yieldQPerHa,

        quantityProduced: r.quantityProducedQ,
        quantityProducedQ: r.quantityProducedQ,

        quantitySold: r.quantitySaleOutQ,
        quantitySaleOutQ: r.quantitySaleOutQ,

        farmersCount: r.farmersPurchased,
        farmersPurchased: r.farmersPurchased,

        quantitySoldFarmers: r.quantitySaleToFarmersQ,
        quantitySaleToFarmersQ: r.quantitySaleToFarmersQ,

        villagesCovered: r.villagesCovered,

        quantitySoldOrg: r.quantitySaleToOtherOrgQ,
        quantitySaleToOtherOrgQ: r.quantitySaleToOtherOrgQ,

        amountGenerated: r.amountGeneratedLakh,
        amountGeneratedLakh: r.amountGeneratedLakh,

        totalAmountPresently: r.totalAmountPresentLakh,
        totalAmountPresentLakh: r.totalAmountPresentLakh,
    };
}

module.exports = seedHubRepository;
