const prisma = require('../../config/prisma.js');

const cfldTechnicalParameterRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : parseInt(data.kvkId || 1);
        let cropId = data.cropId ? parseInt(data.cropId) : null;
        if (data.crop && (!cropId || cropId < 100)) {
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    category = await prisma.fldCategory.create({
                        data: { categoryName: 'CFLD', sectorId: 1 }
                    }).catch(() => prisma.fldCategory.findFirst());
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    subcategory = await prisma.fldSubcategory.create({
                        data: { subCategoryName: 'CFLD', categoryId: category.categoryId, sectorId: 1 }
                    }).catch(() => prisma.fldSubcategory.findFirst());
                }
                crop = await prisma.fldCrop.create({
                    data: {
                        cropName: data.crop,
                        categoryId: category.categoryId,
                        subCategoryId: subcategory.subCategoryId
                    }
                });
            }
            cropId = crop.cropId;
        }
        const seasonId = data.seasonId ? parseInt(data.seasonId) : null;

        // Handle month conversion if it's a string like "January"
        let monthDate = new Date();
        if (data.month) {
            if (typeof data.month === 'string' && isNaN(Date.parse(data.month))) {
                // It might be a month name, try to parse it
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const monthIdx = monthNames.indexOf(data.month);
                if (monthIdx !== -1) {
                    monthDate.setMonth(monthIdx);
                }
            } else {
                monthDate = new Date(data.month);
            }
        }

        const query = `
            INSERT INTO "cfl cfld_technical_parameter" (
                "kvkId", "cropId", month, type, "seasonId", 
                variety_name, area_in_ha, technology_demonstrated, 
                existing_farmer_practice, farmer_yield, demo_yield_max, 
                demo_yield_min, demo_yield_avg, percent_increase, 
                district_yield, state_yield, potential_yield, 
                yield_gap_district_minimized, yield_gap_state_minimized, 
                yield_gap_potential_minimized, general_m, general_f, 
                obc_m, obc_f, sc_m, sc_f, st_m, st_f, 
                training_photo_path, quality_action_photo_path,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        await prisma.$executeRawUnsafe(query,
            kvkId, cropId, monthDate, data.type || data.typeName || 'OILSEED', seasonId,
            data.varietyName || '', parseFloat(data.areaHectare || data.areaInHa || 0),
            data.technologyDemonstrated || '', data.existingFarmerPractice || '',
            parseFloat(data.yieldFarmerField || data.farmerYield || 0),
            parseFloat(data.yieldMax || data.demoYieldMax || 0),
            parseFloat(data.yieldMin || data.demoYieldMin || 0),
            parseFloat(data.yieldAvg || data.demoYieldAvg || 0),
            parseFloat(data.yieldIncreasePercent || data.percentIncrease || 0),
            parseFloat(data.yieldGapDistrict || data.districtYield || 0),
            parseFloat(data.yieldGapState || data.stateYield || 0),
            parseFloat(data.yieldGapPotential || data.potentialYield || 0),
            parseFloat(data.yieldGapMinimisedDistrict || data.yieldGapDistrictMinimized || 0),
            parseFloat(data.yieldGapMinimisedState || data.yieldGapStateMinimized || 0),
            parseFloat(data.yieldGapMinimisedPotential || data.yieldGapPotentialMinimized || 0),
            parseInt(data.genM || data.generalM || 0),
            parseInt(data.genF || data.generalF || 0),
            parseInt(data.obcM || 0),
            parseInt(data.obcF || 0),
            parseInt(data.scM || 0),
            parseInt(data.scF || 0),
            parseInt(data.stM || 0),
            parseInt(data.stF || 0),
            data.trainingPhotoPath || null,
            data.qualityActionPhotoPath || null
        );

        const result = await prisma.cfldTechnicalParameter.findFirst({
            where: {
                kvkId,
                cropId,
                type: data.type || data.typeName || 'OILSEED',
                seasonId
            },
            include: {
                kvk: { select: { kvkName: true } },
                crop: { select: { cropName: true } },
                season: { select: { seasonName: true } },
            },
            orderBy: { cfldTechId: 'desc' }
        });
        return _mapResponse(result);
        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        // Strict isolation for KVK roles
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.cfldTechnicalParameter.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                crop: { select: { cropName: true } },
                season: { select: { seasonName: true } },
            },
            orderBy: { cfldTechId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.cfldTechnicalParameter.findUnique({
            where: { cfldTechId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                crop: { select: { cropName: true } },
                season: { select: { seasonName: true } },
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const cfldTechId = parseInt(id);
        const existing = await prisma.cfldTechnicalParameter.findUnique({
            where: { cfldTechId }
        });
        if (!existing) throw new Error("Record not found");

        const updateData = {};
        if (data.crop) {
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    category = await prisma.fldCategory.create({
                        data: { categoryName: 'CFLD', sectorId: 1 }
                    }).catch(() => prisma.fldCategory.findFirst());
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    subcategory = await prisma.fldSubcategory.create({
                        data: { subCategoryName: 'CFLD', categoryId: category.categoryId, sectorId: 1 }
                    }).catch(() => prisma.fldSubcategory.findFirst());
                }
                crop = await prisma.fldCrop.create({
                    data: {
                        cropName: data.crop,
                        categoryId: category.categoryId,
                        subCategoryId: subcategory.subCategoryId
                    }
                });
            }
            updateData.cropId = crop.cropId;
        } else if (data.cropId) {
            updateData.cropId = parseInt(data.cropId);
        }

        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);
        if (data.month) updateData.month = new Date(data.month);
        if (data.type || data.typeName) updateData.type = data.type || data.typeName;

        const merge = (val, exist) => val !== undefined ? val : exist;

        await prisma.$executeRawUnsafe(`
            UPDATE "cfl cfld_technical_parameter"
            SET 
                "cropId" = $1, "seasonId" = $2, month = $3, type = $4,
                variety_name = $5, area_in_ha = $6, technology_demonstrated = $7,
                existing_farmer_practice = $8, farmer_yield = $9, demo_yield_max = $10,
                demo_yield_min = $11, demo_yield_avg = $12, percent_increase = $13,
                district_yield = $14, state_yield = $15, potential_yield = $16,
                yield_gap_district_minimized = $17, yield_gap_state_minimized = $18,
                yield_gap_potential_minimized = $19, general_m = $20, general_f = $21,
                obc_m = $22, obc_f = $23, sc_m = $24, sc_f = $25, st_m = $26, st_f = $27,
                training_photo_path = $28, quality_action_photo_path = $29,
                updated_at = CURRENT_TIMESTAMP
            WHERE cfl_cfld_tech_id = $30
        `,
            updateData.cropId ?? existing.cropId,
            updateData.seasonId ?? existing.seasonId,
            updateData.month ?? existing.month,
            updateData.type ?? existing.type,
            data.varietyName ?? existing.varietyName,
            parseFloat(data.areaHectare ?? data.areaInHa ?? existing.areaInHa),
            data.technologyDemonstrated ?? existing.technologyDemonstrated,
            data.existingFarmerPractice ?? existing.existingFarmerPractice,
            parseFloat(data.yieldFarmerField ?? data.farmerYield ?? existing.farmerYield),
            parseFloat(data.yieldMax ?? data.demoYieldMax ?? existing.demoYieldMax),
            parseFloat(data.yieldMin ?? data.demoYieldMin ?? existing.demoYieldMin),
            parseFloat(data.yieldAvg ?? data.demoYieldAvg ?? existing.demoYieldAvg),
            parseFloat(data.yieldIncreasePercent ?? data.percentIncrease ?? existing.percentIncrease),
            parseFloat(data.yieldGapDistrict ?? data.districtYield ?? existing.districtYield),
            parseFloat(data.yieldGapState ?? data.stateYield ?? existing.stateYield),
            parseFloat(data.yieldGapPotential ?? data.potentialYield ?? existing.potentialYield),
            parseFloat(data.yieldGapMinimisedDistrict ?? data.yieldGapDistrictMinimized ?? existing.yieldGapDistrictMinimized),
            parseFloat(data.yieldGapMinimisedState ?? data.yieldGapStateMinimized ?? existing.yieldGapStateMinimized),
            parseFloat(data.yieldGapMinimisedPotential ?? data.yieldGapPotentialMinimized ?? existing.yieldGapPotentialMinimized),
            parseInt(data.genM ?? data.generalM ?? existing.generalM),
            parseInt(data.genF ?? data.generalF ?? existing.generalF),
            parseInt(data.obcM ?? existing.obcM),
            parseInt(data.obcF ?? existing.obcF),
            parseInt(data.scM ?? existing.scM),
            parseInt(data.scF ?? existing.scF),
            parseInt(data.stM ?? existing.stM),
            parseInt(data.stF ?? existing.stF),
            data.trainingPhotoPath ?? existing.trainingPhotoPath,
            data.qualityActionPhotoPath ?? existing.qualityActionPhotoPath,
            cfldTechId
        );

        const result = await prisma.cfldTechnicalParameter.findUnique({
            where: { cfldTechId },
            include: {
                kvk: { select: { kvkName: true } },
                crop: { select: { cropName: true } },
                season: { select: { seasonName: true } },
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.cfldTechnicalParameter.delete({
            where: { cfldTechId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.cfldTechId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        cropId: r.cropId,
        cropName: r.crop ? r.crop.cropName : undefined,
        month: r.month,
        type: r.type,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        varietyName: r.varietyName,
        areaHectare: r.areaInHa,
        technologyDemonstrated: r.technologyDemonstrated,
        existingFarmerPractice: r.existingFarmerPractice,
        yieldFarmerField: r.farmerYield,
        yieldMax: r.demoYieldMax,
        yieldMin: r.demoYieldMin,
        yieldAvg: r.demoYieldAvg,
        yieldIncreasePercent: r.percentIncrease,
        yieldGapDistrict: r.districtYield,
        yieldGapState: r.stateYield,
        yieldGapPotential: r.potentialYield,
        yieldGapMinimisedDistrict: r.yieldGapDistrictMinimized,
        yieldGapMinimisedState: r.yieldGapStateMinimized,
        yieldGapMinimisedPotential: r.yieldGapPotentialMinimized,
        genM: r.generalM,
        genF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        trainingPhotoPath: r.trainingPhotoPath,
        qualityActionPhotoPath: r.qualityActionPhotoPath,
    };
}

module.exports = cfldTechnicalParameterRepository;
