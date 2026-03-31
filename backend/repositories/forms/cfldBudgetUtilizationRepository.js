const prisma = require('../../config/prisma.js');
const { removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { mapCommonRelations } = require('../../utils/responseMapper.js');

const parseYearFromInput = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const formatYearAsDate = (yearValue) => {
    const year = parseYearFromInput(yearValue, null);
    return year === null ? '' : `${year}-01-01`;
};

const cfldBudgetUtilizationRepository = {
    create: async (data, opts, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        // Resolve cropId
        let cropId = data.cropId ? parseInt(data.cropId) : null;
        if (data.crop) {
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                // CFLD category/subcategory creation logic...
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    const sectors = await prisma.$queryRawUnsafe("SELECT sector_id FROM sector ORDER BY sector_id LIMIT 1");
                    const sId = sectors.length > 0 ? sectors[0].sector_id : 1;
                    const catRows = await prisma.$queryRawUnsafe(`
                        INSERT INTO category (category_name, "sectorId", created_at, updated_at) 
                        VALUES ('CFLD', $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                        RETURNING category_id
                    `, sId);
                    category = { categoryId: catRows[0].category_id, sectorId: sId };
                }
                let subcategory = await prisma.fldSubcategory.findFirst({ where: { subCategoryName: 'CFLD' } });
                if (!subcategory) {
                    const subRows = await prisma.$queryRawUnsafe(`
                        INSERT INTO sub_category (sub_category_name, "categoryId", "sectorId", created_at, updated_at) 
                        VALUES ('CFLD', $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                        RETURNING sub_category_id
                    `, category.categoryId, category.sectorId || 1);
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

        // Fetch budget items to map by name
        const budgetItemsMaster = await prisma.budgetItem.findMany();
        const getItemIdByPattern = (pattern) => {
            const item = budgetItemsMaster.find(i => i.itemName.toLowerCase().includes(pattern.toLowerCase()));
            return item ? item.budgetItemId : null;
        };

        const budgetItemsToInsert = [
            { id: getItemIdByPattern('Critical Input'), r: data.criticalInputReceived, u: data.criticalInputUtilized },
            { id: getItemIdByPattern('TA/DA'), r: data.taDaReceived, u: data.taDaUtilized },
            { id: getItemIdByPattern('Extension Activities'), r: data.extensionActivitiesReceived, u: data.extensionActivitiesUtilized },
            { id: getItemIdByPattern('Publication'), r: data.publicationReceived, u: data.publicationUtilized }
        ].filter(item => item.id !== null);

        const rawYear = data.reportingYear || data.year;
        const numericYear = parseYearFromInput(rawYear, new Date().getFullYear());

        const insertResult = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_budget_utilization (
                "kvkId", year, "seasonId", "cropId",
                overall_crop_wise_fund_allocation,
                area_ha_allotted, area_ha_achieved,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING budget_id
        `, kvkId, numericYear, parseInt(data.seasonId || 1), cropId,
            parseFloat(data.overallFundAllocation || 0),
            parseFloat(data.areaAllotted || 0),
            parseFloat(data.areaAchieved || 0)
        );
        const newBudgetId = insertResult[0].budget_id;

        for (const item of budgetItemsToInsert) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO kvk_budget_utilization_item (
                    "budgetId", "budgetItemId", budget_received, budget_utilization
                ) VALUES ($1, $2, $3, $4)
            `, newBudgetId, item.id, parseFloat(item.r || 0), parseFloat(item.u || 0));
        }

        return cfldBudgetUtilizationRepository.findById(newBudgetId);
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
        const existing = await prisma.kvkBudgetUtilization.findUnique({
            where: { budgetId: parseInt(id) },
            include: { items: true }
        });
        if (!existing) throw new Error('Record not found');
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
            throw new Error('Unauthorized');
        }

        const updateData = {};
        const rawYear = data.reportingYear || data.year;
        if (rawYear !== undefined) {
            const parsed = parseYearFromInput(rawYear, null);
            if (parsed !== null) updateData.year = parsed;
        }
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);

        if (data.crop) {
            // ... crop resolution logic ...
            let crop = await prisma.fldCrop.findFirst({
                where: { cropName: { equals: data.crop, mode: 'insensitive' } }
            });
            if (!crop) {
                let category = await prisma.fldCategory.findFirst({ where: { categoryName: 'CFLD' } });
                if (!category) {
                    const catRows = await prisma.$queryRawUnsafe(`
                        INSERT INTO category (category_name, "sectorId", created_at, updated_at) 
                        VALUES ('CFLD', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                        RETURNING category_id
                    `);
                    category = { categoryId: catRows[0].category_id };
                }
                const subRows = await prisma.$queryRawUnsafe(`
                    INSERT INTO sub_category (sub_category_name, "categoryId", "sectorId", created_at, updated_at) 
                    VALUES ('CFLD', $1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                    RETURNING sub_category_id
                `, category.categoryId);
                const cropRows = await prisma.$queryRawUnsafe(
                    "INSERT INTO crop (crop_name, \"categoryId\", \"subCategoryId\", created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING crop_id",
                    data.crop, category.categoryId, subRows[0].sub_category_id
                );
                updateData.cropId = cropRows[0].crop_id;
            } else {
                updateData.cropId = crop.cropId;
            }
        }

        if (data.overallFundAllocation !== undefined) updateData.overallFundAllocation = parseFloat(data.overallFundAllocation);
        if (data.areaAllotted !== undefined) updateData.areaAllotted = parseFloat(data.areaAllotted);
        if (data.areaAchieved !== undefined) updateData.areaAchieved = parseFloat(data.areaAchieved);

        // Budget items update
        const budgetItemsMaster = await prisma.budgetItem.findMany();
        const getItemIdByPattern = (pattern) => {
            const item = budgetItemsMaster.find(i => i.itemName.toLowerCase().includes(pattern.toLowerCase()));
            return item ? item.budgetItemId : null;
        };

        const budgetItemsInRequest = [
            { id: getItemIdByPattern('Critical Input'), r: data.criticalInputReceived, u: data.criticalInputUtilized },
            { id: getItemIdByPattern('TA/DA'), r: data.taDaReceived, u: data.taDaUtilized },
            { id: getItemIdByPattern('Extension Activities'), r: data.extensionActivitiesReceived, u: data.extensionActivitiesUtilized },
            { id: getItemIdByPattern('Publication'), r: data.publicationReceived, u: data.publicationUtilized }
        ].filter(item => item.id !== null && (item.r !== undefined || item.u !== undefined));

        if (budgetItemsInRequest.length > 0) {
            updateData.items = {
                deleteMany: {},
                create: budgetItemsInRequest.map(item => ({
                    budgetItemId: item.id,
                    budgetReceived: parseFloat(item.r || 0),
                    budgetUtilized: parseFloat(item.u || 0),
                }))
            };
        }

        const finalUpdate = removeIdFieldsForUpdate(updateData, ['budgetId', 'id']);
        const result = await prisma.kvkBudgetUtilization.update({
            where: { budgetId: parseInt(id) },
            data: finalUpdate,
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } },
                crop: { select: { cropName: true } },
                items: { include: { budgetItem: { select: { itemName: true } } } }
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        await prisma.kvkBudgetUtilizationItem.deleteMany({ where: { budgetId: parseInt(id) } });
        return await prisma.kvkBudgetUtilization.delete({ where: { budgetId: parseInt(id) } });
    }
};

function _mapResponse(r) {
    if (!r) return null;

    const findItem = (pattern) => {
        const item = (r.items || []).find(i => i.budgetItem?.itemName.toLowerCase().includes(pattern.toLowerCase()));
        return item || { budgetReceived: 0, budgetUtilized: 0 };
    };

    // Map common relations using utility function
    const relations = mapCommonRelations(r, {
        includeKvk: true,
        includeCrop: true,
        includeSeason: true,
    });

    return {
        id: r.budgetId,
        budgetId: r.budgetId,
        kvkId: r.kvkId,
        ...relations,
        year: r.year,
        reportingYear: formatYearAsDate(r.year),
        overallFundAllocation: r.overallFundAllocation,
        areaAllotted: r.areaAllotted,
        areaAchieved: r.areaAchieved,

        criticalInputReceived: findItem('Critical Input').budgetReceived,
        criticalInputUtilized: findItem('Critical Input').budgetUtilized,
        taDaReceived: findItem('TA/DA').budgetReceived,
        taDaUtilized: findItem('TA/DA').budgetUtilized,
        extensionActivitiesReceived: findItem('Extension Activities').budgetReceived,
        extensionActivitiesUtilized: findItem('Extension Activities').budgetUtilized,
        publicationReceived: findItem('Publication').budgetReceived,
        publicationUtilized: findItem('Publication').budgetUtilized,
    };
}

module.exports = cfldBudgetUtilizationRepository;
