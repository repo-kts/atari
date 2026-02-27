const prisma = require('../../config/prisma.js');

const cfldBudgetUtilizationRepository = {
    create: async (data, opts, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

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
                    }).catch(() => prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } }));
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    subcategory = await prisma.fldSubcategory.create({
                        data: { subCategoryName: 'CFLD', categoryId: category.categoryId, sectorId: 1 }
                    }).catch(() => prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD', categoryId: category.categoryId } }));
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

        const budgetItems = [
            { id: 1, r: data.criticalInputReceived, u: data.criticalInputUtilized },
            { id: 2, r: data.taDaReceived, u: data.taDaUtilized },
            { id: 3, r: data.extensionActivitiesReceived, u: data.extensionActivitiesUtilized },
            { id: 4, r: data.publicationReceived, u: data.publicationUtilized }
        ].filter(item => item.r !== undefined || item.u !== undefined);

        const result = await prisma.kvkBudgetUtilization.create({
            data: {
                kvkId,
                year: parseInt(data.yearId || data.year || new Date().getFullYear()),
                seasonId: parseInt(data.seasonId || 1),
                cropId: cropId || 1,
                overallFundAllocation: parseFloat(data.overallFundAllocation || 0),
                areaAllotted: parseFloat(data.areaAllotted || 0),
                areaAchieved: parseFloat(data.areaAchieved || 0),
                items: {
                    create: budgetItems.map(item => ({
                        budgetItemId: item.id,
                        budgetReceived: parseFloat(item.r || 0),
                        budgetUtilized: parseFloat(item.u || 0),
                    }))
                }
            },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                crop: { select: { cropName: true } },
                items: {
                    include: {
                        budgetItem: { select: { itemName: true } }
                    }
                }
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

        const results = await prisma.kvkBudgetUtilization.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                crop: { select: { cropName: true } },
                items: {
                    include: {
                        budgetItem: { select: { itemName: true } }
                    }
                }
            },
            orderBy: { budgetId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.kvkBudgetUtilization.findUnique({
            where: { budgetId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                crop: { select: { cropName: true } },
                items: {
                    include: {
                        budgetItem: { select: { itemName: true } }
                    }
                }
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const updateData = {};
        if (data.yearId || data.year) updateData.year = parseInt(data.yearId || data.year);
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);

        if (data.crop) {
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                // Find or create default CFLD category/subcategory
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    category = await prisma.fldCategory.create({
                        data: { categoryName: 'CFLD', sectorId: 1 }
                    }).catch(() => prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } }));
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    subcategory = await prisma.fldSubcategory.create({
                        data: { subCategoryName: 'CFLD', categoryId: category.categoryId, sectorId: 1 }
                    }).catch(() => prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD', categoryId: category.categoryId } }));
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

        if (data.overallFundAllocation !== undefined) updateData.overallFundAllocation = parseFloat(data.overallFundAllocation);
        if (data.areaAllotted !== undefined) updateData.areaAllotted = parseFloat(data.areaAllotted);
        if (data.areaAchieved !== undefined) updateData.areaAchieved = parseFloat(data.areaAchieved);

        const budgetItems = [
            { id: 1, r: data.criticalInputReceived, u: data.criticalInputUtilized },
            { id: 2, r: data.taDaReceived, u: data.taDaUtilized },
            { id: 3, r: data.extensionActivitiesReceived, u: data.extensionActivitiesUtilized },
            { id: 4, r: data.publicationReceived, u: data.publicationUtilized }
        ].filter(item => item.r !== undefined || item.u !== undefined);

        if (budgetItems.length > 0) {
            updateData.items = {
                deleteMany: {},
                create: budgetItems.map(item => ({
                    budgetItemId: item.id,
                    budgetReceived: parseFloat(item.r || 0),
                    budgetUtilized: parseFloat(item.u || 0),
                }))
            };
        }

        const result = await prisma.kvkBudgetUtilization.update({
            where: { budgetId: parseInt(id) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                crop: { select: { cropName: true } },
                items: {
                    include: {
                        budgetItem: { select: { itemName: true } }
                    }
                }
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        await prisma.kvkBudgetUtilizationItem.deleteMany({
            where: { budgetId: parseInt(id) }
        });
        return await prisma.kvkBudgetUtilization.delete({
            where: { budgetId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;

    // Reverse mapping for frontend
    const items = r.items || [];
    const getItem = (id) => items.find(i => i.budgetItemId === id) || {};

    return {
        id: r.budgetId,
        budgetId: r.budgetId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        year: r.year,
        yearId: r.year,
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        cropId: r.cropId,
        crop: r.crop ? r.crop.cropName : undefined,
        overallFundAllocation: r.overallFundAllocation,
        areaAllotted: r.areaAllotted,
        areaAchieved: r.areaAchieved,

        criticalInputReceived: getItem(1).budgetReceived,
        criticalInputUtilized: getItem(1).budgetUtilized,
        taDaReceived: getItem(2).budgetReceived,
        taDaUtilized: getItem(2).budgetUtilized,
        extensionActivitiesReceived: getItem(3).budgetReceived,
        extensionActivitiesUtilized: getItem(3).budgetUtilized,
        publicationReceived: getItem(4).budgetReceived,
        publicationUtilized: getItem(4).budgetUtilized,

        // Frontend friendly aliases
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Crop': r.crop ? r.crop.cropName : undefined,
        'Season': r.season ? r.season.seasonName : undefined,
        'Overall Fund Allocation': r.overallFundAllocation
    };
}

module.exports = cfldBudgetUtilizationRepository;
