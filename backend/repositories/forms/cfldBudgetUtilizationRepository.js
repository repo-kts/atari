const prisma = require('../../config/prisma.js');

const cfldBudgetUtilizationRepository = {
    create: async (data, opts, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        // Resolve cropId using prisma.fldCrop (maps to 'crop' table)
        let cropId = data.cropId ? parseInt(data.cropId) : null;
        if (data.crop) {
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                // Find or create CFLD category (maps to 'category' table, sectorId optional via raw)
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    const sectors = await prisma.$queryRawUnsafe("SELECT sector_id FROM sector ORDER BY sector_id LIMIT 1");
                    const sId = sectors.length > 0 ? sectors[0].sector_id : 1;
                    const catRows = await prisma.$queryRawUnsafe(
                        `INSERT INTO category (category_name, "sectorId", created_at, updated_at) VALUES ('CFLD', ${sId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING category_id`
                    );
                    category = { categoryId: catRows[0].category_id, sectorId: sId };
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    const subRows = await prisma.$queryRawUnsafe(
                        `INSERT INTO sub_category (sub_category_name, "categoryId", "sectorId", created_at, updated_at) VALUES ('CFLD', ${category.categoryId}, ${category.sectorId || 1}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING sub_category_id`
                    );
                    subcategory = { subCategoryId: subRows[0].sub_category_id };
                }
                const cropRows = await prisma.$queryRawUnsafe(
                    "INSERT INTO crop (crop_name, \"categoryId\", \"subCategoryId\", created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING crop_id",
                    data.crop, category.categoryId, subcategory.subCategoryId
                );
                cropId = cropRows[0].crop_id;
            } else {
                cropId = crop.cropId;
            }
        }
        if (!cropId) throw new Error('Crop is required');

        // Fetch actual budget_item IDs from DB (in insertion order)
        const budgetItemRows = await prisma.$queryRawUnsafe("SELECT budget_item_id FROM budget_item ORDER BY budget_item_id");
        const itemIds = budgetItemRows.map(r => r.budget_item_id);
        const budgetItems = [
            { id: itemIds[0], r: data.criticalInputReceived, u: data.criticalInputUtilized },
            { id: itemIds[1], r: data.taDaReceived, u: data.taDaUtilized },
            { id: itemIds[2], r: data.extensionActivitiesReceived, u: data.extensionActivitiesUtilized },
            { id: itemIds[3], r: data.publicationReceived, u: data.publicationUtilized }
        ].filter(item => item.id && (item.r !== undefined || item.u !== undefined));

        // yearId from frontend may be the string year value (e.g. "2024-25" or "2024") or a numeric year
        const rawYear = data.yearId || data.year;
        let numericYear = new Date().getFullYear();
        if (rawYear) {
            const parsed = parseInt(String(rawYear));
            numericYear = isNaN(parsed) ? new Date().getFullYear() : parsed;
        }

        // Use raw SQL to include created_at/updated_at (not in Prisma model but NOT NULL in DB)
        const insertResult = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_budget_utilization (
                "kvkId", year, "seasonId", "cropId",
                overall_crop_wise_fund_allocation,
                area_ha_allotted, area_ha_achieved,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING budget_id
        `,
            kvkId,
            numericYear,
            parseInt(data.seasonId || 1),
            cropId,
            parseFloat(data.overallFundAllocation || 0),
            parseFloat(data.areaAllotted || 0),
            parseFloat(data.areaAchieved || 0)
        );
        const newBudgetId = insertResult[0].budget_id;

        // Insert budget items
        for (const item of budgetItems) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO kvk_budget_utilization_item (
                    "budgetId", "budgetItemId", budget_received, budget_utilization
                ) VALUES ($1, $2, $3, $4)
            `, newBudgetId, item.id, parseFloat(item.r || 0), parseFloat(item.u || 0));
        }

        const result = await prisma.kvkBudgetUtilization.findUnique({
            where: { budgetId: newBudgetId },
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

    update: async (id, data, user) => {
        // Verify ownership for kvk scoped users
        const existing = await prisma.kvkBudgetUtilization.findUnique({
            where: { budgetId: parseInt(id) },
            select: { budgetId: true, kvkId: true }
        });
        if (!existing) throw new Error('Record not found');
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        const updateData = {};
        // Parse year from frontend yearId (may be string like "2024-25")
        const rawYear = data.yearId || data.year;
        if (rawYear !== undefined) {
            const parsed = parseInt(String(rawYear));
            if (!isNaN(parsed)) updateData.year = parsed;
        }
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);

        if (data.crop) {
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    const sectors = await prisma.$queryRawUnsafe("SELECT sector_id FROM sector ORDER BY sector_id LIMIT 1");
                    const sId = sectors.length > 0 ? sectors[0].sector_id : 1;
                    const catRows = await prisma.$queryRawUnsafe(
                        `INSERT INTO category (category_name, "sectorId", created_at, updated_at) VALUES ('CFLD', ${sId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING category_id`
                    );
                    category = { categoryId: catRows[0].category_id, sectorId: sId };
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    const subRows = await prisma.$queryRawUnsafe(
                        `INSERT INTO sub_category (sub_category_name, "categoryId", "sectorId", created_at, updated_at) VALUES ('CFLD', ${category.categoryId}, ${category.sectorId || 1}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING sub_category_id`
                    );
                    subcategory = { subCategoryId: subRows[0].sub_category_id };
                }
                const cropRows = await prisma.$queryRawUnsafe(
                    "INSERT INTO crop (crop_name, \"categoryId\", \"subCategoryId\", created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING crop_id",
                    data.crop, category.categoryId, subcategory.subCategoryId
                );
                updateData.cropId = cropRows[0].crop_id;
            } else {
                updateData.cropId = crop.cropId;
            }
        } else if (data.cropId) {
            updateData.cropId = parseInt(data.cropId);
        }

        if (data.overallFundAllocation !== undefined) updateData.overallFundAllocation = parseFloat(data.overallFundAllocation);
        if (data.areaAllotted !== undefined) updateData.areaAllotted = parseFloat(data.areaAllotted);
        if (data.areaAchieved !== undefined) updateData.areaAchieved = parseFloat(data.areaAchieved);

        // Fetch actual budget_item IDs from DB
        const budgetItemRows = await prisma.$queryRawUnsafe("SELECT budget_item_id FROM budget_item ORDER BY budget_item_id");
        const itemIds = budgetItemRows.map(r => r.budget_item_id);
        const budgetItems = [
            { id: itemIds[0], r: data.criticalInputReceived, u: data.criticalInputUtilized },
            { id: itemIds[1], r: data.taDaReceived, u: data.taDaUtilized },
            { id: itemIds[2], r: data.extensionActivitiesReceived, u: data.extensionActivitiesUtilized },
            { id: itemIds[3], r: data.publicationReceived, u: data.publicationUtilized }
        ].filter(item => item.id && (item.r !== undefined || item.u !== undefined));

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
