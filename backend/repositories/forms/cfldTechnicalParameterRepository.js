const prisma = require('../../config/prisma.js');

const cfldTechnicalParameterRepository = {
    create: async (data, opts, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : parseInt(data.kvkId || 1);
        const cropId = data.cropId ? parseInt(data.cropId) : null;
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

        const result = await prisma.cfldTechnicalParameter.create({
            data: {
                kvkId,
                cropId,
                month: monthDate,
                type: data.type || data.typeName || 'OILSEED',
                seasonId,
                varietyName: data.varietyName || '',
                areaInHa: parseFloat(data.areaHectare || data.areaInHa || 0),
                technologyDemonstrated: data.technologyDemonstrated || '',
                existingFarmerPractice: data.existingFarmerPractice || '',
                farmerYield: parseFloat(data.yieldFarmerField || data.farmerYield || 0),
                demoYieldMax: parseFloat(data.yieldMax || data.demoYieldMax || 0),
                demoYieldMin: parseFloat(data.yieldMin || data.demoYieldMin || 0),
                demoYieldAvg: parseFloat(data.yieldAvg || data.demoYieldAvg || 0),
                percentIncrease: parseFloat(data.yieldIncreasePercent || data.percentIncrease || 0),
                districtYield: parseFloat(data.yieldGapDistrict || data.districtYield || 0),
                stateYield: parseFloat(data.yieldGapState || data.stateYield || 0),
                potentialYield: parseFloat(data.yieldGapPotential || data.potentialYield || 0),
                yieldGapDistrictMinimized: parseFloat(data.yieldGapMinimisedDistrict || data.yieldGapDistrictMinimized || 0),
                yieldGapStateMinimized: parseFloat(data.yieldGapMinimisedState || data.yieldGapStateMinimized || 0),
                yieldGapPotentialMinimized: parseFloat(data.yieldGapMinimisedPotential || data.yieldGapPotentialMinimized || 0),
                generalM: parseInt(data.genM || data.generalM || 0),
                generalF: parseInt(data.genF || data.generalF || 0),
                obcM: parseInt(data.obcM || 0),
                obcF: parseInt(data.obcF || 0),
                scM: parseInt(data.scM || 0),
                scF: parseInt(data.scF || 0),
                stM: parseInt(data.stM || 0),
                stF: parseInt(data.stF || 0),
                trainingPhotoPath: data.trainingPhotoPath || null,
                qualityActionPhotoPath: data.qualityActionPhotoPath || null,
            },
            include: {
                kvk: { select: { kvkName: true } },
                crop: { select: { cropName: true } },
                season: { select: { seasonName: true } },
            }
        });
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
        const updateData = {};
        if (data.cropId) updateData.cropId = parseInt(data.cropId);
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);
        if (data.month) updateData.month = new Date(data.month);
        if (data.type || data.typeName) updateData.type = data.type || data.typeName;
        if (data.varietyName !== undefined) updateData.varietyName = data.varietyName;
        if (data.areaHectare !== undefined || data.areaInHa !== undefined) updateData.areaInHa = parseFloat(data.areaHectare || data.areaInHa);
        if (data.technologyDemonstrated !== undefined) updateData.technologyDemonstrated = data.technologyDemonstrated;
        if (data.existingFarmerPractice !== undefined) updateData.existingFarmerPractice = data.existingFarmerPractice;
        if (data.yieldFarmerField !== undefined || data.farmerYield !== undefined) updateData.farmerYield = parseFloat(data.yieldFarmerField || data.farmerYield);
        if (data.yieldMax !== undefined || data.demoYieldMax !== undefined) updateData.demoYieldMax = parseFloat(data.yieldMax || data.demoYieldMax);
        if (data.yieldMin !== undefined || data.demoYieldMin !== undefined) updateData.demoYieldMin = parseFloat(data.yieldMin || data.demoYieldMin);
        if (data.yieldAvg !== undefined || data.demoYieldAvg !== undefined) updateData.demoYieldAvg = parseFloat(data.yieldAvg || data.demoYieldAvg);
        if (data.yieldIncreasePercent !== undefined || data.percentIncrease !== undefined) updateData.percentIncrease = parseFloat(data.yieldIncreasePercent || data.percentIncrease);
        if (data.yieldGapDistrict !== undefined || data.districtYield !== undefined) updateData.districtYield = parseFloat(data.yieldGapDistrict || data.districtYield);
        if (data.yieldGapState !== undefined || data.stateYield !== undefined) updateData.stateYield = parseFloat(data.yieldGapState || data.stateYield);
        if (data.yieldGapPotential !== undefined || data.potentialYield !== undefined) updateData.potentialYield = parseFloat(data.yieldGapPotential || data.potentialYield);
        if (data.yieldGapMinimisedDistrict !== undefined || data.yieldGapDistrictMinimized !== undefined) updateData.yieldGapDistrictMinimized = parseFloat(data.yieldGapMinimisedDistrict || data.yieldGapDistrictMinimized);
        if (data.yieldGapMinimisedState !== undefined || data.yieldGapStateMinimized !== undefined) updateData.yieldGapStateMinimized = parseFloat(data.yieldGapMinimisedState || data.yieldGapStateMinimized);
        if (data.yieldGapMinimisedPotential !== undefined || data.yieldGapPotentialMinimized !== undefined) updateData.yieldGapPotentialMinimized = parseFloat(data.yieldGapMinimisedPotential || data.yieldGapPotentialMinimized);

        if (data.genM !== undefined || data.generalM !== undefined) updateData.generalM = parseInt(data.genM || data.generalM);
        if (data.genF !== undefined || data.generalF !== undefined) updateData.generalF = parseInt(data.genF || data.generalF);
        if (data.obcM !== undefined) updateData.obcM = parseInt(data.obcM);
        if (data.obcF !== undefined) updateData.obcF = parseInt(data.obcF);
        if (data.scM !== undefined) updateData.scM = parseInt(data.scM);
        if (data.scF !== undefined) updateData.scF = parseInt(data.scF);
        if (data.stM !== undefined) updateData.stM = parseInt(data.stM);
        if (data.stF !== undefined) updateData.stF = parseInt(data.stF);

        if (data.trainingPhotoPath !== undefined) updateData.trainingPhotoPath = data.trainingPhotoPath;
        if (data.qualityActionPhotoPath !== undefined) updateData.qualityActionPhotoPath = data.qualityActionPhotoPath;

        const result = await prisma.cfldTechnicalParameter.update({
            where: { cfldTechId: parseInt(id) },
            data: updateData,
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
