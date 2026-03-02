const prisma = require('../../config/prisma.js');

const csisaRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        // Prepare crop details - handle both nested array and flattened root fields
        let cropDetails = [];
        if (Array.isArray(data.cropDetails) && data.cropDetails.length > 0) {
            cropDetails = data.cropDetails.map(crop => ({
                cropName: crop.cropName || '',
                technologyOption: crop.technologyOption || crop.techOptions || '',
                varietyName: crop.varietyName || '',
                durationDays: parseInt(crop.durationDays) || 0,
                sowingDate: crop.sowingDate ? new Date(crop.sowingDate) : new Date(),
                harvestingDate: crop.harvestingDate ? new Date(crop.harvestingDate) : new Date(),
                daysOfMaturity: parseInt(crop.daysOfMaturity) || 0,
                grainYieldQPerHa: parseFloat(crop.grainYieldQPerHa || crop.grainYield) || 0,
                costOfCultivation: parseFloat(crop.costOfCultivation || crop.costOfCultivation_per_ha) || 0,
                grossReturn: parseFloat(crop.grossReturn || crop.gross_return_per_ha) || 0,
                netReturn: parseFloat(crop.netReturn || crop.net_return_per_ha) || 0,
                bcr: parseFloat(crop.bcr) || 0,
            }));
        } else if (data.cropName) {
            // Frontend typical case: single crop flattened at root
            cropDetails = [{
                cropName: data.cropName || '',
                technologyOption: data.techOptions || data.technologyOption || '',
                varietyName: data.varietyName || '',
                durationDays: parseInt(data.durationDays) || 0,
                sowingDate: data.sowingDate ? new Date(data.sowingDate) : new Date(),
                harvestingDate: data.harvestingDate ? new Date(data.harvestingDate) : new Date(),
                daysOfMaturity: parseInt(data.daysOfMaturity) || 0,
                grainYieldQPerHa: parseFloat(data.grainYield) || 0,
                costOfCultivation: parseFloat(data.costOfCultivation) || 0,
                grossReturn: parseFloat(data.grossReturn) || 0,
                netReturn: parseFloat(data.netReturn) || 0,
                bcr: parseFloat(data.bcr) || 0,
            }];
        }

        const reportingYear = parseInt(data.yearId || data.reportingYear) || new Date().getFullYear();
        const seasonId = parseInt(data.seasonId) || 1;
        const villagesCovered = parseInt(data.villageCovered || data.villagesCovered) || 0;
        const blocksCovered = parseInt(data.blockCovered || data.blocksCovered) || 0;
        const districtsCovered = parseInt(data.districtCovered || data.districtsCovered) || 0;
        const respondents = parseInt(data.respondent || data.respondents) || 0;
        const trialName = data.trialName || '';
        const areaCoveredHa = parseFloat(data.areaCovered || data.areaCoveredHa || data.area) || 0;

        const [csisaRecord] = await prisma.$queryRawUnsafe(`
            INSERT INTO csisa (
                "kvkId", reporting_year, "seasonId", 
                villages_covered, blocks_covered, districts_covered, 
                respondents, trial_name, area_covered_ha,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, kvkId, reportingYear, seasonId, villagesCovered, blocksCovered, districtsCovered,
            respondents, trialName, areaCoveredHa);

        const csisaId = csisaRecord.csisa_id;

        for (const crop of cropDetails) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO csisa_crop_detail (
                    "csisaId", crop_name, technology_option, variety_name, 
                    duration_days, sowing_date, harvesting_date, days_of_maturity, 
                    grain_yield_q_per_ha, cost_of_cultivation_per_ha, gross_return_per_ha, net_return_per_ha, bcr,
                    created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, csisaId, crop.cropName, crop.technologyOption, crop.varietyName,
                crop.durationDays, crop.sowingDate, crop.harvestingDate, crop.daysOfMaturity,
                crop.grainYieldQPerHa, crop.costOfCultivation, crop.grossReturn, crop.netReturn, crop.bcr);
        }

        const result = await prisma.csisa.findUnique({
            where: { csisaId },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                cropDetails: true
            }
        });

        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYear) {
            where.reportingYear = parseInt(filters.reportingYear);
        }

        const results = await prisma.csisa.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                cropDetails: true
            },
            orderBy: { csisaId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { csisaId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.csisa.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                cropDetails: true
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const csisaId = parseInt(id);
        const whereSpec = { csisaId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereSpec.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.csisa.findFirst({ where: whereSpec });
        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        if (data.yearId !== undefined || data.reportingYear !== undefined)
            updateData.reportingYear = parseInt(data.yearId ?? data.reportingYear);
        if (data.seasonId !== undefined) updateData.seasonId = parseInt(data.seasonId);
        if (data.villageCovered !== undefined || data.villagesCovered !== undefined)
            updateData.villagesCovered = parseInt(data.villageCovered ?? data.villagesCovered);
        if (data.blockCovered !== undefined || data.blocksCovered !== undefined)
            updateData.blocksCovered = parseInt(data.blockCovered ?? data.blocksCovered);
        if (data.districtCovered !== undefined || data.districtsCovered !== undefined)
            updateData.districtsCovered = parseInt(data.districtCovered ?? data.districtsCovered);
        if (data.respondent !== undefined || data.respondents !== undefined)
            updateData.respondents = parseInt(data.respondent ?? data.respondents);
        if (data.trialName !== undefined) updateData.trialName = data.trialName;
        if (data.areaCovered !== undefined || data.areaCoveredHa !== undefined || data.area !== undefined)
            updateData.areaCoveredHa = parseFloat(data.areaCovered ?? data.areaCoveredHa ?? data.area);

        // Handle crop details update
        let cropDetailsToCreate = null;
        if (data.cropDetails && Array.isArray(data.cropDetails) && data.cropDetails.length > 0) {
            cropDetailsToCreate = data.cropDetails.map(crop => ({
                cropName: crop.cropName || '',
                technologyOption: crop.technologyOption || crop.techOptions || '',
                varietyName: crop.varietyName || '',
                durationDays: parseInt(crop.durationDays) || 0,
                sowingDate: crop.sowingDate ? new Date(crop.sowingDate) : new Date(),
                harvestingDate: crop.harvestingDate ? new Date(crop.harvestingDate) : new Date(),
                daysOfMaturity: parseInt(crop.daysOfMaturity) || 0,
                grainYieldQPerHa: parseFloat(crop.grainYieldQPerHa || crop.grainYield) || 0,
                costOfCultivation: parseFloat(crop.costOfCultivation) || 0,
                grossReturn: parseFloat(crop.grossReturn) || 0,
                netReturn: parseFloat(crop.netReturn) || 0,
                bcr: parseFloat(crop.bcr) || 0,
            }));
        } else if (data.cropName) {
            cropDetailsToCreate = [{
                cropName: data.cropName || '',
                technologyOption: data.techOptions || data.technologyOption || '',
                varietyName: data.varietyName || '',
                durationDays: parseInt(data.durationDays) || 0,
                sowingDate: data.sowingDate ? new Date(data.sowingDate) : new Date(),
                harvestingDate: data.harvestingDate ? new Date(data.harvestingDate) : new Date(),
                daysOfMaturity: parseInt(data.daysOfMaturity) || 0,
                grainYieldQPerHa: parseFloat(data.grainYield) || 0,
                costOfCultivation: parseFloat(data.costOfCultivation) || 0,
                grossReturn: parseFloat(data.grossReturn) || 0,
                netReturn: parseFloat(data.netReturn) || 0,
                bcr: parseFloat(data.bcr) || 0,
            }];
        }

        await prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`
                UPDATE csisa 
                SET 
                    reporting_year = $1, "seasonId" = $2, villages_covered = $3, 
                    blocks_covered = $4, districts_covered = $5, respondents = $6, 
                    trial_name = $7, area_covered_ha = $8, updated_at = CURRENT_TIMESTAMP
                WHERE csisa_id = $9
            `,
                updateData.reportingYear ?? existing.reportingYear,
                updateData.seasonId ?? existing.seasonId,
                updateData.villagesCovered ?? existing.villagesCovered,
                updateData.blocksCovered ?? existing.blocksCovered,
                updateData.districtsCovered ?? existing.districtsCovered,
                updateData.respondents ?? existing.respondents,
                updateData.trialName ?? existing.trialName,
                updateData.areaCoveredHa ?? existing.areaCoveredHa,
                csisaId
            );

            if (cropDetailsToCreate) {
                await tx.$executeRawUnsafe(`DELETE FROM csisa_crop_detail WHERE "csisaId" = $1`, csisaId);
                for (const crop of cropDetailsToCreate) {
                    await tx.$executeRawUnsafe(`
                        INSERT INTO csisa_crop_detail (
                            "csisaId", crop_name, technology_option, variety_name, 
                            duration_days, sowing_date, harvesting_date, days_of_maturity, 
                            grain_yield_q_per_ha, cost_of_cultivation_per_ha, gross_return_per_ha, net_return_per_ha, bcr,
                            created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `, csisaId, crop.cropName, crop.technologyOption, crop.varietyName,
                        crop.durationDays, crop.sowingDate, crop.harvestingDate, crop.daysOfMaturity,
                        crop.grainYieldQPerHa, crop.costOfCultivation, crop.grossReturn, crop.netReturn, crop.bcr);
                }
            }
        });

        const result = await prisma.csisa.findUnique({
            where: { csisaId },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                cropDetails: true
            }
        });

        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const csisaId = parseInt(id);
        const whereSpec = { csisaId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereSpec.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.csisa.findFirst({ where: whereSpec });
        if (!existing) throw new Error("Record not found or unauthorized");

        // Delete related crop details first (if not cascading)
        await prisma.csisaCropDetail.deleteMany({
            where: { csisaId }
        });

        await prisma.csisa.delete({
            where: { csisaId }
        });

        return { success: true };
    }
};

function _mapResponse(r) {
    if (!r) return null;

    const mapped = {
        id: r.csisaId,
        csisaId: r.csisaId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYear: r.reportingYear,
        yearId: r.reportingYear,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        villagesCovered: r.villagesCovered,
        villageCovered: r.villagesCovered,
        blocksCovered: r.blocksCovered,
        blockCovered: r.blocksCovered,
        districtsCovered: r.districtsCovered,
        districtCovered: r.districtsCovered,
        respondents: r.respondents,
        respondent: r.respondents,
        trialName: r.trialName,
        areaCoveredHa: r.areaCoveredHa,
        areaCovered: r.areaCoveredHa,
        cropDetails: r.cropDetails || [],

        // Frontend friendly table labels (matching routeConfig.ts and the image)
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Year': r.reportingYear,
        'Season': r.season ? r.season.seasonName : undefined,
        'Trial Name': r.trialName,
        'Crop': r.cropDetails?.[0]?.cropName || '-',
        'Variety': r.cropDetails?.[0]?.varietyName || '-',
        'Village Covered(no.)': r.villagesCovered,
        'Block Covered(no.)': r.blocksCovered,
        'District Covered(no.)': r.districtsCovered
    };

    // Add flattened crop fields for editing
    if (r.cropDetails?.[0]) {
        const c = r.cropDetails[0];
        Object.assign(mapped, {
            cropName: c.cropName,
            techOptions: c.technologyOption,
            varietyName: c.varietyName,
            durationDays: c.durationDays,
            sowingDate: c.sowingDate ? c.sowingDate.toISOString().split('T')[0] : '',
            harvestingDate: c.harvestingDate ? c.harvestingDate.toISOString().split('T')[0] : '',
            daysOfMaturity: c.daysOfMaturity,
            grainYield: c.grainYieldQPerHa,
            costOfCultivation: c.costOfCultivation_per_ha || c.costOfCultivation,
            grossReturn: c.gross_return_per_ha || c.grossReturn,
            netReturn: c.net_return_per_ha || c.netReturn,
            bcr: c.bcr
        });
    }

    return mapped;
}

module.exports = csisaRepository;
