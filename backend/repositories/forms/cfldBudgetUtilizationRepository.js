const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const { mapCommonRelations } = require('../../utils/responseMapper.js');

const CFLD_BUDGET_MODEL = Prisma.dmmf.datamodel.models.find(
    (model) => model.name === 'KvkBudgetUtilization'
);
const MODEL_SCALAR_FIELDS = (CFLD_BUDGET_MODEL?.fields || []).filter(
    (field) => field.kind === 'scalar'
);
const SCALAR_FIELD_SET = new Set(MODEL_SCALAR_FIELDS.map((field) => field.name));
const SCALAR_FIELD_TYPE = new Map(
    MODEL_SCALAR_FIELDS.map((field) => [field.name, field.type])
);
const IMMUTABLE_FIELDS = new Set(['budgetId', 'createdAt', 'updatedAt']);
const NON_MODEL_PAYLOAD_KEYS = new Set([
    'id',
    'budgetId',
    'crop',
    'cropName',
    'season',
    'seasonName',
    'kvkName',
    'budgetItems',
    'items',
    'budgetUtilizationItems',
    'utilizationItems',
    'reportingYear',
]);
const BASE_RESPONSE_EXCLUDED_SCALARS = new Set([
    'budgetId',
    'kvkId',
    'year',
    'reportingYearDate',
    'seasonId',
    'cropId',
    'createdAt',
    'updatedAt',
]);

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

const normalizeBudgetItemName = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const toCamelCaseKey = (value) => {
    const normalized = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    if (!normalized) return '';
    const [first, ...rest] = normalized.split(/\s+/);
    return first + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
};

const toSafeFloat = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const toSafeInt = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseInt(String(value).trim(), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const toSafeDate = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? fallback : value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const normalizeScalarValue = (fieldName, rawValue, fallback = undefined) => {
    const fieldType = SCALAR_FIELD_TYPE.get(fieldName);
    if (!fieldType) return fallback;

    if (fieldType === 'Int') return toSafeInt(rawValue, fallback);
    if (fieldType === 'Float' || fieldType === 'Decimal') return toSafeFloat(rawValue, fallback);
    if (fieldType === 'DateTime') return toSafeDate(rawValue, fallback);
    if (fieldType === 'Boolean') {
        if (rawValue === undefined || rawValue === null || rawValue === '') return fallback;
        return Boolean(rawValue);
    }
    if (fieldType === 'String') {
        if (rawValue === undefined || rawValue === null) return fallback;
        return String(rawValue);
    }
    return rawValue;
};

const buildDynamicBudgetScalarData = (payload, { includeMissingAsUndefined = true } = {}) => {
    const scalarData = {};

    for (const [key, value] of Object.entries(payload || {})) {
        if (NON_MODEL_PAYLOAD_KEYS.has(key)) continue;
        if (/(Received|Utilized)$/i.test(key)) continue;
        if (!SCALAR_FIELD_SET.has(key)) continue;
        if (IMMUTABLE_FIELDS.has(key)) continue;

        scalarData[key] = normalizeScalarValue(
            key,
            value,
            includeMissingAsUndefined ? undefined : null
        );
    }

    return scalarData;
};

const resolveBudgetItemId = (rawItem, itemIdByNormalizedName, itemIdSet) => {
    if (rawItem === undefined || rawItem === null || rawItem === '') return null;

    if (typeof rawItem === 'number' || /^\d+$/.test(String(rawItem).trim())) {
        const parsedId = parseInt(String(rawItem).trim(), 10);
        return itemIdSet.has(parsedId) ? parsedId : null;
    }

    return itemIdByNormalizedName.get(normalizeBudgetItemName(rawItem)) || null;
};

const getFirstDefined = (obj, keys) => {
    for (const key of keys) {
        if (obj[key] !== undefined) return obj[key];
    }
    return undefined;
};

const buildDynamicItemCandidates = (data) => {
    const candidates = [];
    let hasArrayPayload = false;

    // Dynamic array payloads from frontend (preferred format going forward)
    const arraySources = ['items', 'budgetItems', 'budgetUtilizationItems', 'utilizationItems'];
    for (const sourceKey of arraySources) {
        const list = data[sourceKey];
        if (!Array.isArray(list)) continue;
        hasArrayPayload = true;

        for (const row of list) {
            if (!row || typeof row !== 'object') continue;
            candidates.push({
                rawId: getFirstDefined(row, ['budgetItemId', 'id', 'budget_item_id']),
                rawName: getFirstDefined(row, ['itemName', 'budgetItemName', 'masterItemName', 'name', 'item']),
                received: getFirstDefined(row, ['budgetReceived', 'received', 'r', 'budget_received']),
                utilized: getFirstDefined(row, ['budgetUtilized', 'utilized', 'u', 'budget_utilization', 'utilised']),
            });
        }
    }

    if (hasArrayPayload) {
        return { candidates, source: 'array' };
    }

    // Legacy flat payload shape: <itemKey>Received / <itemKey>Utilized
    const flatBucket = new Map();
    for (const [key, value] of Object.entries(data || {})) {
        const match = key.match(/^(.+?)(Received|Utilized)$/i);
        if (!match) continue;

        const rawBase = match[1];
        const metric = match[2].toLowerCase();
        const normalizedBase = normalizeBudgetItemName(rawBase);
        if (!normalizedBase) continue;

        const entry = flatBucket.get(normalizedBase) || { rawName: rawBase };
        if (metric === 'received') entry.received = value;
        if (metric === 'utilized') entry.utilized = value;
        flatBucket.set(normalizedBase, entry);
    }
    candidates.push(...flatBucket.values());

    return { candidates, source: 'legacy-flat' };
};

const buildBudgetItemsPayload = (
    data,
    budgetItemsMaster,
    { includeOnlyProvided = false, requireAtLeastOneForCreate = false } = {}
) => {
    const itemIdByName = new Map(
        budgetItemsMaster.map((item) => [normalizeBudgetItemName(item.itemName), item.budgetItemId])
    );
    const itemIdSet = new Set(budgetItemsMaster.map((item) => item.budgetItemId));
    const { candidates, source } = buildDynamicItemCandidates(data);
    const unresolvedItems = [];

    // De-duplicate by budgetItemId, latest value wins.
    const payloadByItemId = new Map();
    for (const candidate of candidates) {
        const hasAnyValue = candidate.received !== undefined || candidate.utilized !== undefined;
        if (!hasAnyValue && includeOnlyProvided) continue;

        const budgetItemId = resolveBudgetItemId(
            candidate.rawId !== undefined ? candidate.rawId : candidate.rawName,
            itemIdByName,
            itemIdSet
        );
        if (!budgetItemId) {
            if (hasAnyValue) {
                unresolvedItems.push(String(candidate.rawName || candidate.rawId || 'unknown item'));
            }
            continue;
        }
        if (includeOnlyProvided && candidate.received === undefined && candidate.utilized === undefined) continue;

        payloadByItemId.set(budgetItemId, {
            budgetItemId,
            budgetReceived: toSafeFloat(candidate.received, 0),
            budgetUtilized: toSafeFloat(candidate.utilized, 0),
        });
    }

    const payload = Array.from(payloadByItemId.values());
    if (unresolvedItems.length > 0) {
        throw new Error(`Unknown budget item(s): ${unresolvedItems.join(', ')}`);
    }
    if (requireAtLeastOneForCreate && payload.length === 0) {
        const guidance = source === 'array'
            ? 'Provide valid budgetItems with budgetItemId/itemName and received/utilized values'
            : 'Provide budgetItems array payload or valid legacy *Received/*Utilized keys';
        throw new Error(`At least one budget item is required. ${guidance}`);
    }

    return payload;
};

const throwRepositoryError = (operation, error) => {
    if (error instanceof Error && (
        error.message === 'Record not found' ||
        error.message === 'Unauthorized' ||
        error.message.startsWith('Valid ') ||
        error.message.startsWith('Unknown budget item') ||
        error.message.startsWith('At least one budget item') ||
        error.message.startsWith('Crop is required')
    )) {
        throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            throw new Error('Record not found');
        }
        if (error.code === 'P2002') {
            throw new Error('Duplicate CFLD budget utilization data');
        }
        if (error.code === 'P2003') {
            throw new Error('Invalid relation reference in CFLD budget utilization data');
        }
        throw new Error(`CFLD budget utilization ${operation} failed`);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
        throw new Error(`CFLD budget utilization ${operation} failed due to invalid data`);
    }
    throw new Error(`CFLD budget utilization ${operation} failed`);
};

const cfldBudgetUtilizationRepository = {
    create: async (data, opts, user) => {
        try {
            const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
            const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
            const kvkId = toSafeInt(kvkIdSource, NaN);

            if (isNaN(kvkId)) {
                throw new Error('Valid kvkId is required');
            }

            // Resolve cropId
            let cropId = toSafeInt(data.cropId, null);
            if (data.crop) {
                cropId = await resolveOrCreateCfldCropId(data.crop);
            }
            if (!cropId) throw new Error('Crop is required');

            const budgetItemsMaster = await prisma.budgetItem.findMany({
                select: { budgetItemId: true, itemName: true },
            });
            const budgetItemsToInsert = buildBudgetItemsPayload(data, budgetItemsMaster, {
                requireAtLeastOneForCreate: true,
            });

            const yearInfo = resolveReportingYearInput(data.reportingYear ?? data.year, new Date().getUTCFullYear(), null);
            const numericYear = yearInfo.year ?? new Date().getUTCFullYear();
            const scalarData = buildDynamicBudgetScalarData(data);
            const createPayload = {
                ...scalarData,
                kvkId,
                cropId,
                year: numericYear,
                reportingYearDate: yearInfo.reportingYearDate,
            };
            if (data.seasonId !== undefined) {
                createPayload.seasonId = toSafeInt(data.seasonId, null);
            } else if (createPayload.seasonId === undefined) {
                createPayload.seasonId = 1;
            }

            const created = await prisma.$transaction(async (tx) => tx.kvkBudgetUtilization.create({
                data: {
                    ...createPayload,
                    items: {
                        create: budgetItemsToInsert,
                    },
                },
                select: { budgetId: true },
            }));

            return cfldBudgetUtilizationRepository.findById(created.budgetId);
        } catch (error) {
            throwRepositoryError('create', error);
        }
    },

    findAll: async (filters = {}, user) => {
        try {
            const where = {};
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                where.kvkId = parseInt(user.kvkId, 10);
            } else if (filters.kvkId) {
                where.kvkId = parseInt(filters.kvkId, 10);
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
        } catch (error) {
            throwRepositoryError('fetch', error);
        }
    },

    findById: async (id) => {
        try {
            const result = await prisma.kvkBudgetUtilization.findUnique({
                where: { budgetId: parseInt(id, 10) },
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
        } catch (error) {
            throwRepositoryError('fetch', error);
        }
    },

    update: async (id, data, user) => {
        try {
            const numericId = parseInt(id, 10);
            const existing = await prisma.kvkBudgetUtilization.findUnique({
                where: { budgetId: numericId },
                include: { items: true }
            });
            if (!existing) throw new Error('Record not found');
            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName) && Number(existing.kvkId) !== Number(user.kvkId)) {
                throw new Error('Unauthorized');
            }

            const updateData = buildDynamicBudgetScalarData(data);
            const rawYear = data.reportingYear ?? data.year;
            if (rawYear !== undefined) {
                const yearInfo = resolveReportingYearInput(rawYear, existing.year, existing.reportingYearDate || null);
                if (yearInfo.year !== null && yearInfo.year !== undefined) updateData.year = yearInfo.year;
                updateData.reportingYearDate = yearInfo.reportingYearDate || null;
            }
            if (data.seasonId !== undefined) updateData.seasonId = toSafeInt(data.seasonId, null);
            if (data.cropId !== undefined) {
                const cropIdFromPayload = toSafeInt(data.cropId, null);
                if (cropIdFromPayload) updateData.cropId = cropIdFromPayload;
            }

            if (data.crop) {
                updateData.cropId = await resolveOrCreateCfldCropId(data.crop);
            }

            const budgetItemsMaster = await prisma.budgetItem.findMany({
                select: { budgetItemId: true, itemName: true },
            });
            const budgetItemsInRequest = buildBudgetItemsPayload(data, budgetItemsMaster, { includeOnlyProvided: true });

            const result = await prisma.$transaction(async (tx) => {
                await tx.kvkBudgetUtilization.update({
                    where: { budgetId: numericId },
                    data: updateData,
                });

                // Merge item updates instead of replacing all rows.
                for (const item of budgetItemsInRequest) {
                    await tx.kvkBudgetUtilizationItem.upsert({
                        where: {
                            budgetId_budgetItemId: {
                                budgetId: numericId,
                                budgetItemId: item.budgetItemId,
                            }
                        },
                        update: {
                            budgetReceived: item.budgetReceived,
                            budgetUtilized: item.budgetUtilized,
                        },
                        create: {
                            budgetId: numericId,
                            budgetItemId: item.budgetItemId,
                            budgetReceived: item.budgetReceived,
                            budgetUtilized: item.budgetUtilized,
                        },
                    });
                }

                return tx.kvkBudgetUtilization.findUnique({
                    where: { budgetId: numericId },
                    include: {
                        kvk: { select: { kvkName: true } },
                        season: { select: { seasonName: true } },
                        crop: { select: { cropName: true } },
                        items: { include: { budgetItem: { select: { itemName: true } } } }
                    }
                });
            });

            return _mapResponse(result);
        } catch (error) {
            throwRepositoryError('update', error);
        }
    },

    delete: async (id) => {
        try {
            const numericId = parseInt(id, 10);
            return await prisma.kvkBudgetUtilization.delete({ where: { budgetId: numericId } });
        } catch (error) {
            throwRepositoryError('delete', error);
        }
    }
};

function _mapResponse(r) {
    if (!r) return null;

    // Map common relations using utility function
    const relations = mapCommonRelations(r, {
        includeKvk: true,
        includeCrop: true,
        includeSeason: true,
    });

    const dynamicItemAliases = {};
    for (const item of (r.items || [])) {
        const baseKey = toCamelCaseKey(item.budgetItem?.itemName);
        if (!baseKey) continue;
        dynamicItemAliases[`${baseKey}Received`] = item.budgetReceived;
        dynamicItemAliases[`${baseKey}Utilized`] = item.budgetUtilized;
    }
    const dynamicScalarFields = {};
    for (const fieldName of SCALAR_FIELD_SET) {
        if (BASE_RESPONSE_EXCLUDED_SCALARS.has(fieldName)) continue;
        if (r[fieldName] !== undefined) {
            dynamicScalarFields[fieldName] = r[fieldName];
        }
    }

    return {
        id: r.budgetId,
        budgetId: r.budgetId,
        kvkId: r.kvkId,
        ...relations,
        year: r.year,
        reportingYear: formatBudgetReportingYear(r.reportingYearDate, r.year),
        ...dynamicScalarFields,
        budgetItems: (r.items || []).map((item) => ({
            budgetItemId: item.budgetItemId,
            itemName: item.budgetItem?.itemName || null,
            budgetReceived: item.budgetReceived,
            budgetUtilized: item.budgetUtilized,
        })),
        ...dynamicItemAliases,
    };
}

module.exports = cfldBudgetUtilizationRepository;
