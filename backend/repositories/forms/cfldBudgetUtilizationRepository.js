const prisma = require('../../config/prisma.js');
const { removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const { mapCommonRelations } = require('../../utils/responseMapper.js');

const parseYearFromInput = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const buildDateFromYear = (yearValue) => {
    const year = parseYearFromInput(yearValue, null);
    return year === null ? null : new Date(Date.UTC(year, 0, 1));
};

const getDefaultSectorId = async () => {
    const sector = await prisma.sector.findFirst({
        select: { sectorId: true },
        orderBy: { sectorId: 'asc' },
    });
    if (sector) {
        return sector.sectorId;
    }

    // Auto-heal empty master-data setup: create a default sector once.
    try {
        const created = await prisma.sector.create({
            data: { sectorName: 'General' },
            select: { sectorId: true },
        });
        return created.sectorId;
    } catch (error) {
        // If another request created it concurrently or name already exists, fetch first again.
        const fallback = await prisma.sector.findFirst({
            select: { sectorId: true },
            orderBy: { sectorId: 'asc' },
        });
        if (fallback) {
            return fallback.sectorId;
        }
        throw error;
    }
};

const resolveOrCreateCfldCropId = async (cropName) => {
    if (!cropName || !String(cropName).trim()) {
        throw new Error('Crop is required');
    }
    const normalizedCropName = String(cropName).trim();

    const existingCrop = await prisma.fldCrop.findFirst({
        where: { cropName: { equals: normalizedCropName, mode: 'insensitive' } },
        select: { cropId: true },
    });
    if (existingCrop) return existingCrop.cropId;

    const sectorId = await getDefaultSectorId();
    let category = await prisma.fldCategory.findFirst({
        where: { categoryName: { equals: 'CFLD', mode: 'insensitive' } },
        select: { categoryId: true, sectorId: true },
    });
    if (!category) {
        category = await prisma.fldCategory.create({
            data: {
                categoryName: 'CFLD',
                sectorId,
            },
            select: { categoryId: true, sectorId: true },
        });
    }

    let subcategory = await prisma.fldSubcategory.findFirst({
        where: {
            categoryId: category.categoryId,
            subCategoryName: { equals: 'CFLD', mode: 'insensitive' },
        },
        select: { subCategoryId: true },
    });
    if (!subcategory) {
        subcategory = await prisma.fldSubcategory.create({
            data: {
                subCategoryName: 'CFLD',
                categoryId: category.categoryId,
                sectorId: category.sectorId,
            },
            select: { subCategoryId: true },
        });
    }

    const createdCrop = await prisma.fldCrop.create({
        data: {
            cropName: normalizedCropName,
            categoryId: category.categoryId,
            subCategoryId: subcategory.subCategoryId,
        },
        select: { cropId: true },
    });
    return createdCrop.cropId;
};

const resolveDateFromYearWithFallback = (yearValue, fallbackDate = null) => {
    const year = parseYearFromInput(yearValue, null);
    if (year === null) return fallbackDate || null;

    if (fallbackDate instanceof Date && !Number.isNaN(fallbackDate.getTime())) {
        if (fallbackDate.getUTCFullYear() === year) {
            return new Date(fallbackDate.getTime());
        }
    }

    return new Date(Date.UTC(year, 0, 1));
};

const resolveReportingYearInput = (rawValue, fallbackYear = null, fallbackDate = null) => {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
        return {
            year: fallbackYear,
            reportingYearDate: fallbackDate || buildDateFromYear(fallbackYear),
        };
    }

    if (rawValue instanceof Date || (typeof rawValue === 'string' && rawValue.trim().includes('-'))) {
        const parsedDate = parseReportingYearDate(rawValue);
        ensureNotFutureDate(parsedDate);
        return {
            year: parsedDate.getUTCFullYear(),
            reportingYearDate: parsedDate,
        };
    }

    const parsedYear = parseYearFromInput(rawValue, fallbackYear);
    return {
        year: parsedYear,
        // For legacy clients that still send only numeric year during update,
        // preserve existing exact date when the year did not change.
        reportingYearDate: resolveDateFromYearWithFallback(parsedYear, fallbackDate),
    };
};

const formatBudgetReportingYear = (reportingYearDate, yearValue) => {
    if (reportingYearDate) return formatReportingYear(reportingYearDate);
    const fallbackDate = buildDateFromYear(yearValue);
    return fallbackDate ? formatReportingYear(fallbackDate) : '';
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
            cropId = await resolveOrCreateCfldCropId(data.crop);
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

        const yearInfo = resolveReportingYearInput(data.reportingYear ?? data.year, new Date().getUTCFullYear(), null);
        const numericYear = yearInfo.year ?? new Date().getUTCFullYear();

        const insertResult = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_budget_utilization (
                "kvkId", year, reporting_year_date, "seasonId", "cropId",
                overall_crop_wise_fund_allocation,
                area_ha_allotted, area_ha_achieved,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING budget_id
        `, kvkId, numericYear, yearInfo.reportingYearDate, parseInt(data.seasonId || 1), cropId,
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
        const rawYear = data.reportingYear ?? data.year;
        if (rawYear !== undefined) {
            const yearInfo = resolveReportingYearInput(rawYear, existing.year, existing.reportingYearDate || null);
            if (yearInfo.year !== null && yearInfo.year !== undefined) updateData.year = yearInfo.year;
            updateData.reportingYearDate = yearInfo.reportingYearDate || null;
        }
        if (data.seasonId) updateData.seasonId = parseInt(data.seasonId);

        if (data.crop) {
            updateData.cropId = await resolveOrCreateCfldCropId(data.crop);
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
        reportingYear: formatBudgetReportingYear(r.reportingYearDate, r.year),
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
