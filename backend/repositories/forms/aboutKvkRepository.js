const prisma = require('../../config/prisma.js');
const { sanitizeString, sanitizeInteger, safeGet, removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError, translatePrismaError } = require('../../utils/errorHandler.js');
const { normalizeOptionalIndianMobile, normalizeRequiredIndianMobile } = require('../../utils/validation.js');
const { parseYearOfEstablishment } = require('../../utils/formIntValidation.js');
const { parseReportingYearDate, ensureNotFutureDate, normalizeDateRange } = require('../../utils/reportingYearUtils.js');

/**
 * About KVK Repository
 * Handles data access for KVK related forms
 */

const ENTITY_CONFIG = {
    'kvks': {
        model: 'kvk',
        idField: 'kvkId',
        nameField: 'kvkName',
        includes: {
            zone: {
                select: { zoneId: true, zoneName: true }
            },
            state: {
                select: { stateId: true, stateName: true }
            },
            district: {
                select: { districtId: true, districtName: true }
            },
            org: {
                select: { orgId: true, orgName: true }
            },
            university: {
                select: { universityId: true, universityName: true }
            },
            landDetails: {
                select: {
                    landId: true,
                    item: true,
                    landItemMasterId: true,
                    specifyItemName: true,
                    description: true,
                    areaHa: true,
                    landItemMaster: { select: { landItemId: true, name: true, isOther: true } },
                }
            }
        }
    },
    'kvk-bank-accounts': {
        model: 'kvkBankAccount',
        idField: 'bankAccountId',
        nameField: 'accountNumber',
        includes: {
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true
                }
            },
            bankAccountType: {
                select: { bankAccountTypeId: true, name: true }
            }
        }
    },
    'kvk-employees': {
        model: 'kvkStaff',
        idField: 'kvkStaffId',
        nameField: 'staffName',
        includes: {
            kvk: {
                select: { kvkId: true, kvkName: true }
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true }
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true }
            },
            staffCategory: {
                select: { staffCategoryId: true, categoryName: true }
            },
            payLevel: {
                select: { payLevelId: true, levelName: true }
            },
            payScale: {
                select: { payScaleId: true, scaleName: true }
            },
            jobTypeMaster: {
                select: { jobTypeId: true, name: true }
            }
        }
    },
    // Same model as employees but will be filtered by service
    'kvk-staff-transferred': {
        model: 'kvkStaff',
        idField: 'kvkStaffId',
        nameField: 'staffName',
        includes: {
            kvk: {
                select: { kvkId: true, kvkName: true }
            },
            originalKvk: {
                select: { kvkId: true, kvkName: true }
            },
            sanctionedPost: {
                select: { sanctionedPostId: true, postName: true }
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true }
            },
            staffCategory: {
                select: { staffCategoryId: true, categoryName: true }
            },
            payLevel: {
                select: { payLevelId: true, levelName: true }
            },
            payScale: {
                select: { payScaleId: true, scaleName: true }
            },
            jobTypeMaster: {
                select: { jobTypeId: true, name: true }
            }
        }
    },
    'kvk-infrastructure': {
        model: 'kvkInfrastructure',
        idField: 'infraId',
        nameField: 'infraId',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            infraMaster: { select: { infraMasterId: true, name: true } }
        }
    },
    'kvk-vehicles': {
        model: 'kvkVehicle',
        idField: 'vehicleId',
        nameField: 'vehicleName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            vehicleType: { select: { vehicleTypeId: true, name: true, isOther: true } },
        }
    },
    'kvk-vehicle-details': { // Alias for vehicles
        model: 'kvkVehicleDetail',
        idField: 'vehicleDetailId',
        nameField: 'vehicleId',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            vehicle: {
                select: {
                    vehicleId: true,
                    vehicleName: true,
                    registrationNo: true,
                    yearOfPurchase: true,
                    totalCost: true,
                    vehicleTypeId: true,
                    vehicleTypeOther: true,
                    vehicleType: { select: { vehicleTypeId: true, name: true, isOther: true } },
                },
            },
            vehicleStatus: { select: { vehicleStatusId: true, statusCode: true, statusLabel: true, hideInNextYear: true } },
            assetFundingSource: { select: { assetFundingSourceId: true, name: true } },
        }
    },
    'kvk-equipments': {
        model: 'kvkEquipment',
        idField: 'equipmentId',
        nameField: 'equipmentName',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            equipmentType: { select: { equipmentTypeId: true, name: true } },
            equipmentMaster: { select: { equipmentMasterId: true, name: true } },
            assetFundingSource: { select: { assetFundingSourceId: true, name: true } },
        }
    },
    'kvk-equipment-details': {
        model: 'kvkEquipmentDetail',
        idField: 'equipmentDetailId',
        nameField: 'equipmentId',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            equipment: {
                select: {
                    equipmentId: true, equipmentName: true, companyBrandModel: true, identifierCode: true,
                    yearOfPurchase: true, totalCost: true, equipmentTypeId: true,
                    equipmentType: { select: { equipmentTypeId: true, name: true } },
                }
            },
            equipmentStatus: { select: { equipmentStatusId: true, statusCode: true, statusLabel: true, hideInNextYear: true } },
            assetFundingSource: { select: { assetFundingSourceId: true, name: true } },
        }
    },
    'kvk-land-details': {
        model: 'kvkLandDetail',
        idField: 'landId',
        nameField: 'item',
        includes: {
            kvk: { select: { kvkId: true, kvkName: true } },
            landItemMaster: { select: { landItemId: true, name: true, isOther: true } }
        }
    },
    'staff-transfer-history': {
        model: 'staffTransferHistory',
        idField: 'transferId',
        nameField: 'transferId',
        includes: {
            staff: {
                select: { kvkStaffId: true, staffName: true }
            },
            fromKvk: {
                select: { kvkId: true, kvkName: true }
            },
            toKvk: {
                select: { kvkId: true, kvkName: true }
            },
            transferredByUser: {
                select: { userId: true, name: true, email: true }
            }
        }
    }
};

function getEntityConfig(entityName) {
    const config = ENTITY_CONFIG[entityName];
    if (!config) {
        throw new Error(`Invalid entity name: ${entityName}`);
    }
    return config;
}

async function resolveDetailEntityId(entityName, parsedId) {
    if (entityName === 'kvk-vehicle-details') {
        const byPrimary = await prisma.kvkVehicleDetail.findUnique({
            where: { vehicleDetailId: parsedId },
            select: { vehicleDetailId: true },
        });
        if (byPrimary) return byPrimary.vehicleDetailId;

        const byVehicle = await prisma.kvkVehicleDetail.findFirst({
            where: { vehicleId: parsedId },
            select: { vehicleDetailId: true },
            orderBy: [{ reportingYear: 'desc' }, { vehicleDetailId: 'desc' }],
        });
        return byVehicle?.vehicleDetailId || null;
    }

    if (entityName === 'kvk-equipment-details') {
        const byPrimary = await prisma.kvkEquipmentDetail.findUnique({
            where: { equipmentDetailId: parsedId },
            select: { equipmentDetailId: true },
        });
        if (byPrimary) return byPrimary.equipmentDetailId;

        const byEquipment = await prisma.kvkEquipmentDetail.findFirst({
            where: { equipmentId: parsedId },
            select: { equipmentDetailId: true },
            orderBy: [{ reportingYear: 'desc' }, { equipmentDetailId: 'desc' }],
        });
        return byEquipment?.equipmentDetailId || null;
    }

    return parsedId;
}

// Legacy KvkEquipment rows can have null equipmentTypeId/equipmentMasterId (the
// curated parents). The raw model name lives on companyBrandModel and maps back
// to its parent EquipmentMaster + EquipmentType via EquipmentModelMaster. Recover
// those ids/names so the Equipment Details edit form's Type / Model (Model/Brand)
// dropdowns prefill even when the equipment row never stored the FKs.
const EQUIPMENT_MASTER_SELECT = {
    equipmentMasterId: true,
    name: true,
    equipmentTypeId: true,
    equipmentType: { select: { equipmentTypeId: true, name: true } },
};

async function recoverEquipmentParents(entityName, rows) {
    if (entityName !== 'kvk-equipment-details' && entityName !== 'kvk-equipments') return;
    const list = Array.isArray(rows) ? rows : (rows ? [rows] : []);
    const getEq = (r) => (entityName === 'kvk-equipments' ? r : r?.equipment);
    const rawName = (eq) => String(eq.companyBrandModel || eq.equipmentName || '').trim();
    const targets = list
        .map(getEq)
        .filter((eq) => eq && eq.equipmentMasterId == null && rawName(eq));
    if (targets.length === 0) return;

    const names = [...new Set(targets.map(rawName))];

    // 1) exact match on the migration reverse-lookup table.
    const exact = await prisma.equipmentModelMaster.findMany({
        where: { name: { in: names } },
        select: { name: true, equipmentMaster: { select: EQUIPMENT_MASTER_SELECT } },
    });
    const byName = new Map();
    for (const m of exact) {
        if (m.equipmentMaster && !byName.has(m.name)) byName.set(m.name, m.equipmentMaster);
    }

    // 2) prefix fallback: some raw names carry extra suffixes ("… with accessories
    //    including installation") not present in the table. Match the longest model
    //    name that the raw name starts with.
    const unmatched = names.filter((n) => !byName.has(n));
    if (unmatched.length > 0) {
        const allModels = await prisma.equipmentModelMaster.findMany({
            select: { name: true, equipmentMaster: { select: EQUIPMENT_MASTER_SELECT } },
        });
        const cleaned = allModels
            .filter((m) => m.equipmentMaster && m.name)
            .map((m) => ({ lower: m.name.trim().toLowerCase(), master: m.equipmentMaster }))
            .sort((a, b) => b.lower.length - a.lower.length);
        for (const n of unmatched) {
            const lower = n.toLowerCase();
            const hit = cleaned.find((m) => lower.startsWith(m.lower) || m.lower.startsWith(lower));
            if (hit) byName.set(n, hit.master);
        }
    }

    for (const eq of targets) {
        const master = byName.get(rawName(eq));
        if (!master) continue;
        eq.equipmentMasterId = master.equipmentMasterId;
        eq.equipmentTypeId = master.equipmentTypeId;
        eq.equipmentMaster = { equipmentMasterId: master.equipmentMasterId, name: master.name };
        if (master.equipmentType) {
            eq.equipmentType = {
                equipmentTypeId: master.equipmentType.equipmentTypeId,
                name: master.equipmentType.name,
            };
        }
    }
}

async function findAll(entityName, options = {}, user = null) {
    const config = getEntityConfig(entityName);
    const model = prisma[config.model];
    if (!model) {
        console.warn(`[AboutKVK] Prisma model '${config.model}' not found - schema may need regeneration. Returning empty.`);
        return { data: [], total: 0 };
    }
    const {
        page = 1,
        limit = 10000,
        search = '',
        sortBy,
        sortOrder = 'asc',
        filters = {},
    } = options;

    const defaultOrderBy = getDefaultOrderBy(entityName);
    const actualSortBy = sortBy || config.idField;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 10000);

    if (entityName === 'kvk-staff-transferred') {
        return findTransferredStaffHistoryRows({ filters, search, sortBy, sortOrder, skip, take });
    }

    let where = {};

    // Entity specific filtering - build where clause from scratch for transfer history
    if (entityName === 'staff-transfer-history') {
        // For transfer history: build where clause explicitly
        if (filters.staffId) {
            where.kvkStaffId = filters.staffId;
        }
        if (filters.fromKvkId) {
            where.fromKvkId = filters.fromKvkId;
        }
        if (filters.toKvkId) {
            where.toKvkId = filters.toKvkId;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.transferDate = {};
            if (filters.dateFrom) {
                where.transferDate.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.transferDate.lte = new Date(filters.dateTo);
            }
        }
        if (filters.isReversal !== undefined) {
            where.isReversal = filters.isReversal;
        }
        // Transfer history doesn't use nameField search
    } else {
        // For other entities: use standard filter spreading
        where = { ...filters };
        const { reportingYearFrom, reportingYearTo } = where;
        if (reportingYearFrom !== undefined || reportingYearTo !== undefined) {
            where.reportingYear = normalizeDateRange({
                from: reportingYearFrom,
                to: reportingYearTo,
            });
            delete where.reportingYearFrom;
            delete where.reportingYearTo;
        }

        // Add search filter if nameField is defined
        if (search && config.nameField) {
            // Special handling for non-string fields if needed, but usually search is text
            where[config.nameField] = {
                contains: search,
                mode: 'insensitive',
            };
        }

        // Entity-specific filtering for other entities
        if (entityName === 'kvk-employees') {
            where.transferStatus = 'ACTIVE';
        }
    }

    // Note: Generated Prisma schema may not have 'type' field on KvkEquipment - omit filter if not present
    // if (entityName === 'kvk-equipments' || entityName === 'kvk-equipment-details') {
    //     where.type = 'EQUIPMENT';
    // }

    // For staff-transferred with sourceKvkIds filter, we need to handle JSON array filtering
    // Prisma's JSON filtering varies by database, so we'll fetch and filter if needed
    let data, total;

    if (entityName === 'kvk-staff-transferred' && filters.sourceKvkIds) {
        // Fetch all transferred employees and filter in memory
        // This is less efficient but works across all databases
        const allData = await model.findMany({
            where: {
                transferStatus: 'TRANSFERRED',
                ...(search && config.nameField ? {
                    [config.nameField]: {
                        contains: search,
                        mode: 'insensitive',
                    }
                } : {}),
            },
            include: config.includes,
        });

        // Filter by sourceKvkIds (check if JSON array contains the KVK ID)
        const filteredData = allData.filter(item => {
            if (!item.sourceKvkIds) return false;
            const sourceIds = Array.isArray(item.sourceKvkIds)
                ? item.sourceKvkIds
                : JSON.parse(item.sourceKvkIds);
            return Array.isArray(sourceIds) && sourceIds.includes(filters.sourceKvkIds);
        });

        // Apply pagination
        const sortedData = filteredData.sort((a, b) => compareStaffRows(a, b, sortBy, sortOrder, entityName));

        total = filteredData.length;
        data = sortedData.slice(skip, skip + take);
    } else {
        // Standard query for other cases

        [data, total] = await Promise.all([
            model.findMany({
                where,
                include: config.includes,
                skip,
                take,
                orderBy: sortBy
                    ? { [actualSortBy]: sortOrder }
                    : defaultOrderBy,
            }),
            model.count({ where }),
        ]);

    }

    await recoverEquipmentParents(entityName, data);
    data = normalizeLandDetailRows(entityName, data);

    return { data, total };
}

function getLandDetailItemLabel(row) {
    if (!row) return '';
    const masterName = row.landItemMaster?.name;
    if (row.landItemMaster?.isOther && row.specifyItemName) return row.specifyItemName;
    return masterName || row.item || row.specifyItemName || '';
}

function normalizeLandDetailRows(entityName, rows) {
    if (entityName !== 'kvk-land-details' && entityName !== 'kvks') return rows;
    const normalize = (row) => {
        if (!row || typeof row !== 'object') return row;
        if (entityName === 'kvks' && Array.isArray(row.landDetails)) {
            return {
                ...row,
                landDetails: row.landDetails.map((detail) => ({
                    ...detail,
                    item: getLandDetailItemLabel(detail),
                })),
            };
        }
        return {
            ...row,
            item: getLandDetailItemLabel(row),
        };
    };
    return Array.isArray(rows) ? rows.map(normalize) : normalize(rows);
}

function getDefaultOrderBy(entityName) {
    if (entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') {
        return [
            { kvk: { kvkName: 'asc' } },
            { positionOrder: 'asc' },
            { staffName: 'asc' },
            { kvkStaffId: 'asc' },
        ];
    }
    return undefined;
}

function compareStaffRows(a, b, sortBy, sortOrder, entityName) {
    if (sortBy) {
        const aVal = a?.[sortBy];
        const bVal = b?.[sortBy];
        if (aVal === bVal) return 0;
        if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
    }

    if (entityName !== 'kvk-employees' && entityName !== 'kvk-staff-transferred') {
        return 0;
    }

    const kvkCompare = String(a?.kvk?.kvkName || '').localeCompare(String(b?.kvk?.kvkName || ''));
    if (kvkCompare !== 0) return kvkCompare;
    const positionCompare = Number(a?.positionOrder || 0) - Number(b?.positionOrder || 0);
    if (positionCompare !== 0) return positionCompare;
    const nameCompare = String(a?.staffName || '').localeCompare(String(b?.staffName || ''));
    if (nameCompare !== 0) return nameCompare;
    return Number(a?.kvkStaffId || 0) - Number(b?.kvkStaffId || 0);
}

function parseKvkIdFilter(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function mapTransferHistoryToStaffRow(row) {
    return {
        ...row,
        id: row.transferId,
        transferId: row.transferId,
        kvkStaffId: row.kvkStaffId,
        staffName: row.staff?.staffName || '',
        kvkId: row.toKvkId,
        originalKvkId: row.fromKvkId,
        kvk: row.toKvk,
        originalKvk: row.fromKvk,
        transferStatus: row.isReversal ? 'ACTIVE' : 'TRANSFERRED',
        transferDate: row.transferDate,
        lastTransferDate: row.transferDate,
        transferReason: row.transferReason,
        notes: row.notes,
        transferCount: row.staff?.transferCount || 0,
        transferredByUser: row.transferredByUser,
    };
}

async function findTransferredStaffHistoryRows({ filters = {}, search = '', sortBy, sortOrder = 'asc', skip = 0, take = 10000 }) {
    const where = {};
    const involvedKvkId = parseKvkIdFilter(filters.sourceKvkIds || filters.kvkId || filters.involvedKvkId);

    if (involvedKvkId) {
        where.OR = [
            { fromKvkId: involvedKvkId },
            { toKvkId: involvedKvkId },
        ];
    }
    if (filters.staffId) {
        where.kvkStaffId = Number(filters.staffId);
    }
    if (filters.dateFrom || filters.dateTo) {
        where.transferDate = {};
        if (filters.dateFrom) where.transferDate.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.transferDate.lte = new Date(filters.dateTo);
    }

    const rows = await prisma.staffTransferHistory.findMany({
        where,
        include: {
            staff: {
                select: {
                    kvkStaffId: true,
                    staffName: true,
                    transferCount: true,
                    sanctionedPost: { select: { sanctionedPostId: true, postName: true } },
                    discipline: { select: { disciplineId: true, disciplineName: true } },
                },
            },
            fromKvk: { select: { kvkId: true, kvkName: true } },
            toKvk: { select: { kvkId: true, kvkName: true } },
            transferredByUser: { select: { userId: true, name: true, email: true } },
        },
        orderBy: [{ transferDate: 'desc' }, { transferId: 'desc' }],
    });

    const term = String(search || '').trim().toLowerCase();
    const mapped = rows
        .map(mapTransferHistoryToStaffRow)
        .filter((row) => {
            if (!term) return true;
            return [
                row.staffName,
                row.kvk?.kvkName,
                row.originalKvk?.kvkName,
                row.transferReason,
                row.notes,
            ].some((value) => String(value || '').toLowerCase().includes(term));
        })
        .sort((a, b) => {
            if (!sortBy) return 0;
            const aVal = a?.[sortBy];
            const bVal = b?.[sortBy];
            if (aVal === bVal) return 0;
            if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });

    return {
        data: mapped.slice(skip, skip + take),
        total: mapped.length,
    };
}

async function findById(entityName, id) {
    const config = getEntityConfig(entityName);

    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        throw new Error(`ID is required for ${entityName}. Received: ${id}`);
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
    }

    const resolvedId = await resolveDetailEntityId(entityName, parsedId);
    if (!resolvedId) {
        return null;
    }

    const record = await prisma[config.model].findUnique({
        where: { [config.idField]: resolvedId },
        include: config.includes,
    });
    await recoverEquipmentParents(entityName, record);
    return normalizeLandDetailRows(entityName, record);
}

/**
 * Convert relation ID fields to Prisma relation connect operations for KVK
 * @param {object} data - Data with relation ID fields
 * @returns {object} Data with relation connect operations
 */
function convertRelationFieldsForKvk(data) {
    const converted = { ...data };

    // CRITICAL: Remove all ID field variations first - Prisma doesn't accept them in data object
    const idFieldVariations = ['id', '_id', 'kvkId', 'kvk_id'];
    for (const idField of idFieldVariations) {
        if (converted[idField] !== undefined) {
            delete converted[idField];
        }
    }

    // Required relations - must use connect
    if (converted.zoneId !== undefined && converted.zoneId !== null) {
        converted.zone = { connect: { zoneId: sanitizeInteger(converted.zoneId) } };
        delete converted.zoneId;
    }

    if (converted.stateId !== undefined && converted.stateId !== null) {
        converted.state = { connect: { stateId: sanitizeInteger(converted.stateId) } };
        delete converted.stateId;
    }

    if (converted.districtId !== undefined && converted.districtId !== null) {
        converted.district = { connect: { districtId: sanitizeInteger(converted.districtId) } };
        delete converted.districtId;
    }

    if (converted.orgId !== undefined && converted.orgId !== null) {
        converted.org = { connect: { orgId: sanitizeInteger(converted.orgId) } };
        delete converted.orgId;
    }

    // Optional relation - can be null (disconnect) or connect
    if (converted.universityId !== undefined) {
        if (converted.universityId === null || converted.universityId === '' || converted.universityId === undefined) {
            converted.university = { disconnect: true };
        } else {
            converted.university = { connect: { universityId: sanitizeInteger(converted.universityId) } };
        }
        delete converted.universityId;
    }

    // Handle landDetails nested write (replaces existing records with new list)
    if (converted.landDetails && Array.isArray(converted.landDetails)) {
        converted.landDetails = {
            deleteMany: {},
            create: converted.landDetails.map(item => ({
                item: sanitizeString(item.item),
                landItemMasterId: item.landItemMasterId ? sanitizeInteger(item.landItemMasterId) : null,
                specifyItemName: sanitizeString(item.specifyItemName, { allowEmpty: true }) || null,
                description: sanitizeString(item.description, { allowEmpty: true }) || null,
                areaHa: parseFloat(item.areaHa) || 0
            }))
        };
    }

    return converted;
}

/**
 * Convert relation ID fields to Prisma relation connect operations for kvkStaff
 * @param {object} data - Data with relation ID fields
 * @returns {object} Data with relation connect operations
 */
function convertRelationFieldsForStaff(data) {
    const converted = { ...data };

    // CRITICAL: Remove all ID field variations first - Prisma doesn't accept them in data object
    const idFieldVariations = ['id', '_id', 'kvkStaffId', 'kvk_staff_id'];
    for (const idField of idFieldVariations) {
        if (converted[idField] !== undefined) {
            delete converted[idField];
        }
    }

    // Convert relation ID fields to relation connect operations
    if (converted.sanctionedPostId !== undefined) {
        converted.sanctionedPost = { connect: { sanctionedPostId: converted.sanctionedPostId } };
        delete converted.sanctionedPostId;
    }

    if (converted.disciplineId !== undefined) {
        converted.discipline = { connect: { disciplineId: converted.disciplineId } };
        delete converted.disciplineId;
    }

    if (converted.kvkId !== undefined) {
        converted.kvk = { connect: { kvkId: converted.kvkId } };
        delete converted.kvkId;
    }

    // Handle optional relations (can be null)
    if (converted.staffCategoryId !== undefined) {
        if (converted.staffCategoryId === null || converted.staffCategoryId === '') {
            converted.staffCategory = { disconnect: true };
        } else {
            converted.staffCategory = { connect: { staffCategoryId: converted.staffCategoryId } };
        }
        delete converted.staffCategoryId;
    }

    if (converted.payLevelId !== undefined) {
        if (converted.payLevelId === null || converted.payLevelId === '') {
            converted.payLevel = { disconnect: true };
        } else {
            converted.payLevel = { connect: { payLevelId: converted.payLevelId } };
        }
        delete converted.payLevelId;
    }

    if (converted.payScaleId !== undefined) {
        if (converted.payScaleId === null || converted.payScaleId === '') {
            converted.payScale = { disconnect: true };
        } else {
            converted.payScale = { connect: { payScaleId: converted.payScaleId } };
        }
        delete converted.payScaleId;
    }

    if (converted.jobTypeMasterId !== undefined) {
        if (converted.jobTypeMasterId === null || converted.jobTypeMasterId === '') {
            converted.jobTypeMaster = { disconnect: true };
        } else {
            converted.jobTypeMaster = { connect: { jobTypeId: converted.jobTypeMasterId } };
        }
        delete converted.jobTypeMasterId;
    }

    if (converted.originalKvkId !== undefined) {
        if (converted.originalKvkId === null || converted.originalKvkId === '') {
            converted.originalKvk = { disconnect: true };
        } else {
            converted.originalKvk = { connect: { kvkId: converted.originalKvkId } };
        }
        delete converted.originalKvkId;
    }

    return converted;
}

/**
 * Convert relation ID fields to Prisma relation connect operations for KVK infrastructure
 * @param {object} data - Data with relation ID fields
 * @returns {object} Data with relation connect operations
 */
function convertRelationFieldsForInfrastructure(data) {
    const converted = { ...data };

    if (converted.kvkId !== undefined) {
        converted.kvk = { connect: { kvkId: sanitizeInteger(converted.kvkId) } };
        delete converted.kvkId;
    }

    if (converted.infraMasterId !== undefined) {
        converted.infraMaster = { connect: { infraMasterId: sanitizeInteger(converted.infraMasterId) } };
        delete converted.infraMasterId;
    }

    return converted;
}

const KVK_BANK_ACCOUNT_ALLOWED_FIELDS = [
    'kvkId',
    'bankAccountTypeMasterId',
    'accountTypeOther',
    'accountName',
    'bankName',
    'location',
    'accountNumber',
];

const KVK_STAFF_ALLOWED_FIELDS = [
    'kvkId',
    'staffName',
    'email',
    'mobile',
    'dateOfBirth',
    'photoPath',
    'resumePath',
    'sanctionedPostId',
    'sanctionedPostOther',
    'positionOrder',
    'disciplineId',
    'payScaleId',
    'payScaleOther',
    'dateOfJoining',
    'jobTypeMasterId',
    'jobTypeOther',
    'allowances',
    'transferStatus',
    'sourceKvkIds',
    'originalKvkId',
    'staffCategoryId',
    'staffCategoryOther',
    'payLevelId',
    'payLevelOther',
];

const KVK_INFRA_ALLOWED_FIELDS = [
    'kvkId',
    'infraMasterId',
    'specifyName',
    'notYetStarted',
    'completedPlinthLevel',
    'completedLintelLevel',
    'completedRoofLevel',
    'totallyCompleted',
    'plinthAreaSqM',
    'underUse',
    'sourceOfFunding',
];

function keepOnlyAllowedFields(payload, allowedFields) {
    Object.keys(payload).forEach((field) => {
        if (!allowedFields.includes(field)) {
            delete payload[field];
        }
    });
}


async function executePrismaWrite(entityName, operation, executor, resourceName = entityName) {
    try {
        return await executor();
    } catch (error) {
        throw translatePrismaError(error, resourceName, operation);
    }
}

/**
 * Sanitize data by removing fields that don't exist in the Prisma schema
 * @param {string} entityName - Entity name
 * @param {object} data - Data to sanitize
 * @returns {object} Sanitized data
 */
function sanitizeData(entityName, data) {
    // Validate input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError('Invalid data: must be an object');
    }

    const config = getEntityConfig(entityName);
    const sanitized = { ...data };

    // CRITICAL: Remove ID fields first - Prisma doesn't accept them in data object
    const idFieldVariations = [
        config.idField,
        'id',
        '_id',
        config.idField.toLowerCase(),
        config.idField.replace(/([A-Z])/g, '_$1').toLowerCase(),
    ];

    for (const idField of idFieldVariations) {
        if (sanitized[idField] !== undefined) {
            delete sanitized[idField];
        }
    }

    // Remove fields that don't exist in Prisma schema for KVK
    if (entityName === 'kvks') {
        const allowedFields = [
            'kvkName', 'zoneId', 'stateId', 'districtId', 'orgId', 'universityId',
            'mobile', 'landline', 'fax', 'email', 'address',
            'hostMobile', 'hostLandline', 'hostFax', 'hostEmail', 'hostAddress',
            'yearOfSanction', 'landDetails'
        ];

        // Remove all fields that don't exist in the schema
        Object.keys(sanitized).forEach(field => {
            if (!allowedFields.includes(field)) {
                delete sanitized[field];
            }
        });

        // Sanitize string fields
        if (sanitized.kvkName !== undefined) {
            sanitized.kvkName = sanitizeString(safeGet(data, 'kvkName'), { allowEmpty: false });
        }
        if (sanitized.landline !== undefined) {
            sanitized.landline = sanitizeString(safeGet(data, 'landline'), { allowEmpty: true });
        }
        if (sanitized.fax !== undefined) {
            sanitized.fax = sanitizeString(safeGet(data, 'fax'), { allowEmpty: true });
        }
        if (sanitized.hostMobile !== undefined) {
            const rawHost = safeGet(data, 'hostMobile');
            try {
                sanitized.hostMobile =
                    rawHost === null || rawHost === undefined || String(rawHost).trim() === ''
                        ? null
                        : normalizeOptionalIndianMobile(rawHost, 'Host mobile');
            } catch (e) {
                throw new ValidationError(e.message, 'hostMobile');
            }
        }
        if (sanitized.hostLandline !== undefined) {
            sanitized.hostLandline = sanitizeString(safeGet(data, 'hostLandline'), { allowEmpty: true });
        }
        if (sanitized.hostFax !== undefined) {
            sanitized.hostFax = sanitizeString(safeGet(data, 'hostFax'), { allowEmpty: true });
        }
        if (sanitized.hostEmail !== undefined) {
            sanitized.hostEmail = sanitizeString(safeGet(data, 'hostEmail'), { allowEmpty: true });
        }
        if (sanitized.hostAddress !== undefined) {
            sanitized.hostAddress = sanitizeString(safeGet(data, 'hostAddress'), { allowEmpty: true });
        }
        if (sanitized.mobile !== undefined) {
            try {
                sanitized.mobile = normalizeRequiredIndianMobile(safeGet(data, 'mobile'), 'Mobile');
            } catch (e) {
                throw new ValidationError(e.message, 'mobile');
            }
        }
        if (sanitized.email !== undefined) {
            sanitized.email = sanitizeString(safeGet(data, 'email'), { allowEmpty: true });
        }
        if (sanitized.address !== undefined) {
            sanitized.address = sanitizeString(safeGet(data, 'address'), { allowEmpty: true });
        }
        if (sanitized.yearOfSanction !== undefined) {
            try {
                sanitized.yearOfSanction = parseYearOfEstablishment(
                    safeGet(data, 'yearOfSanction'),
                    'Year of sanction',
                );
            } catch (e) {
                throw new ValidationError(e.message, 'yearOfSanction');
            }
        }

        // Sanitize relation IDs (will be converted to relations in update/create)
        if (sanitized.zoneId !== undefined) {
            sanitized.zoneId = sanitizeInteger(safeGet(data, 'zoneId'));
        }
        if (sanitized.stateId !== undefined) {
            sanitized.stateId = sanitizeInteger(safeGet(data, 'stateId'));
        }
        if (sanitized.districtId !== undefined) {
            sanitized.districtId = sanitizeInteger(safeGet(data, 'districtId'));
        }
        if (sanitized.orgId !== undefined) {
            sanitized.orgId = sanitizeInteger(safeGet(data, 'orgId'));
        }
        if (sanitized.universityId !== undefined) {
            const universityId = safeGet(data, 'universityId');
            sanitized.universityId = (universityId === null || universityId === undefined || universityId === '')
                ? null
                : sanitizeInteger(universityId);
        }
    }

    if (entityName === 'kvk-vehicles') {
        const allowedFields = [
            'kvkId',
            'vehicleTypeId',
            'vehicleTypeOther',
            'vehicleName',
            'registrationNo',
            'yearOfPurchase',
            'totalCost',
        ];

        Object.keys(sanitized).forEach(field => {
            if (!allowedFields.includes(field)) {
                delete sanitized[field];
            }
        });

        if (sanitized.kvkId !== undefined) sanitized.kvkId = sanitizeInteger(sanitized.kvkId);
        if (sanitized.vehicleTypeId !== undefined) {
            sanitized.vehicleTypeId = sanitized.vehicleTypeId == null || sanitized.vehicleTypeId === ''
                ? null
                : sanitizeInteger(sanitized.vehicleTypeId);
        }
        if (sanitized.vehicleTypeOther !== undefined) {
            sanitized.vehicleTypeOther = sanitizeString(sanitized.vehicleTypeOther, { allowEmpty: true });
        }
        if (sanitized.yearOfPurchase !== undefined) sanitized.yearOfPurchase = sanitizeInteger(sanitized.yearOfPurchase);
        if (sanitized.totalCost !== undefined) sanitized.totalCost = Number(sanitized.totalCost);
    }

    if (entityName === 'kvk-equipments') {
        const allowedFields = [
            'kvkId',
            'equipmentTypeId',
            'equipmentTypeOther',
            'equipmentName',
            'companyBrandModel',
            'identifierCode',
            'yearOfPurchase',
            'totalCost',
        ];

        Object.keys(sanitized).forEach(field => {
            if (!allowedFields.includes(field)) {
                delete sanitized[field];
            }
        });

        if (sanitized.kvkId !== undefined) sanitized.kvkId = sanitizeInteger(sanitized.kvkId);
        if (sanitized.equipmentTypeId !== undefined) {
            sanitized.equipmentTypeId = sanitized.equipmentTypeId == null || sanitized.equipmentTypeId === ''
                ? null
                : sanitizeInteger(sanitized.equipmentTypeId);
        }
        if (sanitized.yearOfPurchase !== undefined) sanitized.yearOfPurchase = sanitizeInteger(sanitized.yearOfPurchase);
        if (sanitized.totalCost !== undefined) sanitized.totalCost = Number(sanitized.totalCost);
    }

    if (entityName === 'kvk-bank-accounts') {
        keepOnlyAllowedFields(sanitized, KVK_BANK_ACCOUNT_ALLOWED_FIELDS);

        if (sanitized.kvkId !== undefined) {
            sanitized.kvkId = sanitizeInteger(safeGet(data, 'kvkId'));
        }
        if (sanitized.bankAccountTypeMasterId !== undefined) {
            sanitized.bankAccountTypeMasterId = sanitizeInteger(safeGet(data, 'bankAccountTypeMasterId'));
        }
        if (sanitized.accountName !== undefined) {
            sanitized.accountName = sanitizeString(safeGet(data, 'accountName'), { allowEmpty: false });
        }
        if (sanitized.bankName !== undefined) {
            sanitized.bankName = sanitizeString(safeGet(data, 'bankName'), { allowEmpty: false });
        }
        if (sanitized.location !== undefined) {
            sanitized.location = sanitizeString(safeGet(data, 'location'), { allowEmpty: false });
        }
        if (sanitized.accountNumber !== undefined) {
            sanitized.accountNumber = sanitizeString(safeGet(data, 'accountNumber'), { allowEmpty: false });
        }
    }

    if (entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') {
        keepOnlyAllowedFields(sanitized, KVK_STAFF_ALLOWED_FIELDS);
        if (sanitized.jobTypeMasterId !== undefined) {
            sanitized.jobTypeMasterId = sanitizeInteger(safeGet(data, 'jobTypeMasterId'));
        }
        if (sanitized.mobile !== undefined && sanitized.mobile !== null) {
            try {
                sanitized.mobile = normalizeRequiredIndianMobile(sanitized.mobile, 'Mobile');
            } catch (e) {
                throw new ValidationError(e.message, 'mobile');
            }
        }
    }

    if (entityName === 'kvk-infrastructure') {
        keepOnlyAllowedFields(sanitized, KVK_INFRA_ALLOWED_FIELDS);

        if (sanitized.kvkId !== undefined) {
            sanitized.kvkId = sanitizeInteger(safeGet(data, 'kvkId'));
        }
        if (sanitized.infraMasterId !== undefined) {
            sanitized.infraMasterId = sanitizeInteger(safeGet(data, 'infraMasterId'));
        }
        if (sanitized.sourceOfFunding !== undefined) {
            sanitized.sourceOfFunding = sanitizeString(safeGet(data, 'sourceOfFunding'), { allowEmpty: false });
        }
        if (sanitized.specifyName !== undefined) {
            // Only meaningful when infrastructure is "Others"; store trimmed/null.
            const v = sanitizeString(safeGet(data, 'specifyName'), { allowEmpty: true });
            sanitized.specifyName = v && v.trim() ? v.trim() : null;
        }
        if (sanitized.plinthAreaSqM !== undefined) {
            const numericValue = Number(safeGet(data, 'plinthAreaSqM'));
            sanitized.plinthAreaSqM = Number.isNaN(numericValue) ? 0 : numericValue;
        }
    }

    if (entityName === 'kvk-vehicle-details') {
        const allowedFields = [
            'kvkId',
            'vehicleId',
            'reportingYear',
            'totalRun',
            'repairingCost',
            'assetFundingSourceId',
            'assetFundingSourceOther',
            'vehicleStatusId',
        ];

        Object.keys(sanitized).forEach(field => {
            if (!allowedFields.includes(field)) {
                delete sanitized[field];
            }
        });
    }

    if (entityName === 'kvk-equipment-details') {
        const allowedFields = [
            'kvkId',
            'equipmentId',
            'reportingYear',
            'assetFundingSourceId',
            'assetFundingSourceOther',
            'equipmentStatusId',
        ];

        Object.keys(sanitized).forEach(field => {
            if (!allowedFields.includes(field)) {
                delete sanitized[field];
            }
        });
    }

    if (entityName === 'kvk-land-details') {
        const allowedFields = ['kvkId', 'landItemMasterId', 'item', 'specifyItemName', 'description', 'areaHa'];

        Object.keys(sanitized).forEach((field) => {
            if (!allowedFields.includes(field)) {
                delete sanitized[field];
            }
        });

        if (sanitized.kvkId !== undefined) {
            sanitized.kvkId = sanitizeInteger(safeGet(data, 'kvkId'));
        }
        if (sanitized.item !== undefined) {
            sanitized.item = sanitizeString(safeGet(data, 'item'), { allowEmpty: false });
        }
        if (sanitized.landItemMasterId !== undefined) {
            const value = safeGet(data, 'landItemMasterId');
            sanitized.landItemMasterId = value === null || value === '' ? null : sanitizeInteger(value);
        }
        if (sanitized.specifyItemName !== undefined) {
            sanitized.specifyItemName = sanitizeString(safeGet(data, 'specifyItemName'), { allowEmpty: true });
        }
        if (sanitized.description !== undefined) {
            sanitized.description = sanitizeString(safeGet(data, 'description'), { allowEmpty: true });
        }
        if (sanitized.areaHa !== undefined) {
            const numericValue = Number(safeGet(data, 'areaHa'));
            sanitized.areaHa = Number.isNaN(numericValue) ? 0 : numericValue;
        }
    }

    return sanitized;
}

async function buildLandDetailPayload(data, { partial = false } = {}) {
    const finalData = {};

    if (data.kvkId !== undefined) finalData.kvkId = sanitizeInteger(data.kvkId);
    if (data.areaHa !== undefined) {
        const numericValue = Number(data.areaHa);
        finalData.areaHa = Number.isNaN(numericValue) ? 0 : numericValue;
    }
    if (data.description !== undefined) {
        finalData.description = sanitizeString(data.description, { allowEmpty: true }) || null;
    }

    let landItemMaster = null;
    if (data.landItemMasterId !== undefined) {
        if (data.landItemMasterId === null || data.landItemMasterId === '') {
            finalData.landItemMasterId = null;
        } else {
            const landItemMasterId = sanitizeInteger(data.landItemMasterId);
            landItemMaster = await prisma.landItemMaster.findUnique({
                where: { landItemId: landItemMasterId },
                select: { landItemId: true, name: true, isOther: true },
            });
            if (!landItemMaster) {
                throw new ValidationError(`Invalid land item master ID: ${data.landItemMasterId}`);
            }
            finalData.landItemMasterId = landItemMaster.landItemId;
            finalData.item = landItemMaster.name;
            finalData.specifyItemName = landItemMaster.isOther
                ? (sanitizeString(data.specifyItemName, { allowEmpty: true }) || null)
                : null;
            if (landItemMaster.isOther && !finalData.specifyItemName) {
                throw new ValidationError('specifyItemName is required when land item is Others');
            }
        }
    } else if (data.item !== undefined) {
        finalData.item = sanitizeString(data.item, { allowEmpty: false });
    } else if (!partial) {
        throw new ValidationError('landItemMasterId is required');
    }

    if (data.specifyItemName !== undefined && data.landItemMasterId === undefined) {
        finalData.specifyItemName = sanitizeString(data.specifyItemName, { allowEmpty: true }) || null;
    }

    if (!partial && finalData.item === undefined) {
        finalData.item = landItemMaster?.name || sanitizeString(data.item, { allowEmpty: false });
    }

    return finalData;
}

async function create(entityName, data) {
    // Validate input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError('Invalid data: must be an object');
    }

    const config = getEntityConfig(entityName);

    // Sanitize data to remove fields not in Prisma schema (includes ID removal)
    let sanitizedData = sanitizeData(entityName, data);

    // CRITICAL: Ensure ID fields are removed for create operations too
    sanitizedData = removeIdFieldsForUpdate(sanitizedData, [config.idField]);

    // For KVKs, convert relation IDs to relation connect operations
    if (entityName === 'kvks') {
        const convertedData = convertRelationFieldsForKvk(sanitizedData);
        return executePrismaWrite(entityName, 'create', async () => {
            return await prisma[config.model].create({
                data: convertedData,
                include: config.includes,
            });
        }, 'KVK');
    }

    if (entityName === 'kvk-vehicle-details') {
        const parsedReportingYear = parseReportingYearDate(sanitizedData.reportingYear);
        ensureNotFutureDate(parsedReportingYear);
        const finalData = {
            kvkId: sanitizeInteger(sanitizedData.kvkId),
            vehicleId: sanitizeInteger(sanitizedData.vehicleId),
            reportingYear: parsedReportingYear,
            totalRun: sanitizedData.totalRun ? String(sanitizedData.totalRun) : '',
            repairingCost: sanitizedData.repairingCost !== undefined ? Number(sanitizedData.repairingCost) : null,
            assetFundingSourceId: sanitizedData.assetFundingSourceId != null
                ? sanitizeInteger(sanitizedData.assetFundingSourceId)
                : null,
            assetFundingSourceOther: sanitizeString(sanitizedData.assetFundingSourceOther, { allowEmpty: true }),
            vehicleStatusId: sanitizeInteger(sanitizedData.vehicleStatusId),
        };

        return executePrismaWrite(entityName, 'create', async () => {
            return await prisma[config.model].create({ data: finalData, include: config.includes });
        });
    }

    if (entityName === 'kvk-equipment-details') {
        const parsedReportingYear = parseReportingYearDate(sanitizedData.reportingYear);
        ensureNotFutureDate(parsedReportingYear);
        const equipmentId = sanitizeInteger(sanitizedData.equipmentId);
        const finalData = {
            kvkId: sanitizeInteger(sanitizedData.kvkId),
            equipmentId,
            reportingYear: parsedReportingYear,
            assetFundingSourceId: sanitizedData.assetFundingSourceId != null
                ? sanitizeInteger(sanitizedData.assetFundingSourceId)
                : null,
            assetFundingSourceOther: sanitizeString(sanitizedData.assetFundingSourceOther, { allowEmpty: true }),
            equipmentStatusId: sanitizeInteger(sanitizedData.equipmentStatusId),
        };

        return executePrismaWrite(entityName, 'create', async () => {
            return await prisma[config.model].create({ data: finalData, include: config.includes });
        });
    }

    if (entityName === 'kvk-land-details') {
        const finalData = await buildLandDetailPayload(sanitizedData);
        return executePrismaWrite(entityName, 'create', async () => {
            const created = await prisma[config.model].create({ data: finalData, include: config.includes });
            return normalizeLandDetailRows(entityName, created);
        });
    }

    // For kvk-employees and kvk-staff-transferred, convert relation ID fields to relation connect operations
    if (entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') {
        const convertedData = convertRelationFieldsForStaff(sanitizedData);
        return executePrismaWrite(entityName, 'create', async () => {
            return await prisma[config.model].create({
                data: convertedData,
                include: config.includes,
            });
        });
    }

    if (entityName === 'kvk-infrastructure') {
        const convertedData = convertRelationFieldsForInfrastructure(sanitizedData);
        return executePrismaWrite(entityName, 'create', async () => {
            return await prisma[config.model].create({
                data: convertedData,
                include: config.includes,
            });
        });
    }

    // For kvk-vehicles and kvk-equipments, validate reportingYear DateTime
    if (entityName === 'kvk-vehicles' || entityName === 'kvk-equipments') {
        const convertedData = { ...sanitizedData };

        if (convertedData.reportingYear !== undefined) {
            const parsedReportingYear = parseReportingYearDate(convertedData.reportingYear);
            ensureNotFutureDate(parsedReportingYear);
            convertedData.reportingYear = parsedReportingYear;
        }


        // Ensure ID fields are removed
        const finalData = removeIdFieldsForUpdate(convertedData, [config.idField]);
        return executePrismaWrite(entityName, 'create', async () => {
            return await prisma[config.model].create({
                data: finalData,
                include: config.includes,
            });
        });
    }

    // Generic create path - ensure ID fields are removed
    const finalData = removeIdFieldsForUpdate(sanitizedData, [config.idField]);
    return executePrismaWrite(entityName, 'create', async () => {
        return await prisma[config.model].create({
            data: finalData,
            include: config.includes,
        });
    });
}

async function update(entityName, id, data) {
    // Validate input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new ValidationError('Invalid data: must be an object');
    }

    const config = getEntityConfig(entityName);

    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        throw new ValidationError(`ID is required for ${entityName}. Received: ${id}`);
    }

    const parsedId = sanitizeInteger(id);
    if (!parsedId || parsedId <= 0) {
        throw new ValidationError(`Invalid ID for ${entityName}: ${id}. ID must be a positive integer.`);
    }
    const resolvedId = await resolveDetailEntityId(entityName, parsedId);
    if (!resolvedId) {
        throw new ValidationError(`${entityName} with ID ${id} not found`);
    }

    // Sanitize data to remove fields not in Prisma schema (includes ID removal)
    let sanitizedData = sanitizeData(entityName, data);

    // CRITICAL: Double-check ID fields are removed (defense in depth)
    sanitizedData = removeIdFieldsForUpdate(sanitizedData, [config.idField]);

    // For KVKs, convert relation IDs to relation connect/disconnect operations
    if (entityName === 'kvks') {
        const convertedData = convertRelationFieldsForKvk(sanitizedData);
        return executePrismaWrite(entityName, 'update', async () => {
            return await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: convertedData,
                include: config.includes,
            });
        }, 'KVK');
    }

    if (entityName === 'kvk-vehicle-details') {
        const finalUpdateData = {};
        if (sanitizedData.kvkId !== undefined) finalUpdateData.kvkId = sanitizeInteger(sanitizedData.kvkId);
        if (sanitizedData.vehicleId !== undefined) finalUpdateData.vehicleId = sanitizeInteger(sanitizedData.vehicleId);
        if (sanitizedData.reportingYear !== undefined) {
            const parsedReportingYear = parseReportingYearDate(sanitizedData.reportingYear);
            ensureNotFutureDate(parsedReportingYear);
            finalUpdateData.reportingYear = parsedReportingYear;
        }
        if (sanitizedData.totalRun !== undefined) finalUpdateData.totalRun = String(sanitizedData.totalRun || '');
        if (sanitizedData.repairingCost !== undefined) finalUpdateData.repairingCost = sanitizedData.repairingCost === null ? null : Number(sanitizedData.repairingCost);
        if (sanitizedData.assetFundingSourceId !== undefined) {
            finalUpdateData.assetFundingSourceId = sanitizedData.assetFundingSourceId == null
                ? null
                : sanitizeInteger(sanitizedData.assetFundingSourceId);
        }
        if (sanitizedData.assetFundingSourceOther !== undefined) {
            finalUpdateData.assetFundingSourceOther = sanitizeString(sanitizedData.assetFundingSourceOther, { allowEmpty: true });
        }
        if (sanitizedData.vehicleStatusId !== undefined) finalUpdateData.vehicleStatusId = sanitizeInteger(sanitizedData.vehicleStatusId);

        return executePrismaWrite(entityName, 'update', async () => {
            return await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: finalUpdateData,
                include: config.includes,
            });
        });
    }

    if (entityName === 'kvk-equipment-details') {
        const finalUpdateData = {};
        if (sanitizedData.kvkId !== undefined) finalUpdateData.kvkId = sanitizeInteger(sanitizedData.kvkId);
        if (sanitizedData.equipmentId !== undefined) finalUpdateData.equipmentId = sanitizeInteger(sanitizedData.equipmentId);
        if (sanitizedData.reportingYear !== undefined) {
            const parsedReportingYear = parseReportingYearDate(sanitizedData.reportingYear);
            ensureNotFutureDate(parsedReportingYear);
            finalUpdateData.reportingYear = parsedReportingYear;
        }
        if (sanitizedData.assetFundingSourceId !== undefined) {
            finalUpdateData.assetFundingSourceId = sanitizedData.assetFundingSourceId == null
                ? null
                : sanitizeInteger(sanitizedData.assetFundingSourceId);
        }
        if (sanitizedData.assetFundingSourceOther !== undefined) {
            finalUpdateData.assetFundingSourceOther = sanitizeString(sanitizedData.assetFundingSourceOther, { allowEmpty: true });
        }
        if (sanitizedData.equipmentStatusId !== undefined) finalUpdateData.equipmentStatusId = sanitizeInteger(sanitizedData.equipmentStatusId);

        return executePrismaWrite(entityName, 'update', async () => {
            return await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: finalUpdateData,
                include: config.includes,
            });
        });
    }

    if (entityName === 'kvk-land-details') {
        const finalUpdateData = await buildLandDetailPayload(sanitizedData, { partial: true });
        return executePrismaWrite(entityName, 'update', async () => {
            const updated = await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: finalUpdateData,
                include: config.includes,
            });
            return normalizeLandDetailRows(entityName, updated);
        });
    }

    // For kvk-employees and kvk-staff-transferred, convert relation ID fields to relation connect operations
    if (entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') {
        const convertedData = convertRelationFieldsForStaff(sanitizedData);
        return executePrismaWrite(entityName, 'update', async () => {
            return await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: convertedData,
                include: config.includes,
            });
        });
    }

    if (entityName === 'kvk-infrastructure') {
        const convertedData = convertRelationFieldsForInfrastructure(sanitizedData);
        return executePrismaWrite(entityName, 'update', async () => {
            return await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: convertedData,
                include: config.includes,
            });
        });
    }

    // For kvk-vehicles and kvk-equipments, validate reportingYear DateTime
    if (entityName === 'kvk-vehicles' || entityName === 'kvk-equipments') {
        const convertedData = { ...sanitizedData };

        if (convertedData.reportingYear !== undefined) {
            const parsedReportingYear = parseReportingYearDate(convertedData.reportingYear);
            ensureNotFutureDate(parsedReportingYear);
            convertedData.reportingYear = parsedReportingYear;
        }


        // Ensure ID fields are removed
        const finalData = removeIdFieldsForUpdate(convertedData, [config.idField]);
        return executePrismaWrite(entityName, 'update', async () => {
            return await prisma[config.model].update({
                where: { [config.idField]: resolvedId },
                data: finalData,
                include: config.includes,
            });
        });
    }

    // Generic update path - ensure ID fields are removed
    const finalData = removeIdFieldsForUpdate(sanitizedData, [config.idField]);
    return executePrismaWrite(entityName, 'update', async () => {
        return await prisma[config.model].update({
            where: { [config.idField]: resolvedId },
            data: finalData,
            include: config.includes,
        });
    });
}

/**
 * Check for dependent records before deletion
 */
async function checkDependentRecords(entityName, config, id) {
    // Check _count if available in includes
    if (config.includes && config.includes._count && config.includes._count.select) {
        // Properly structure _count query - Prisma expects _count: { select: {...} }
        const entity = await prisma[config.model].findUnique({
            where: { [config.idField]: id },
            select: {
                _count: {
                    select: config.includes._count.select
                }
            },
        });

        if (entity && entity._count) {
            const dependentCounts = Object.entries(entity._count)
                .filter(([_, count]) => count > 0);

            if (dependentCounts.length > 0) {
                return {
                    hasDependents: true,
                    counts: Object.fromEntries(dependentCounts),
                };
            }
        }
    }

    return { hasDependents: false };
}

async function deleteEntity(entityName, id) {
    const config = getEntityConfig(entityName);

    // Validate ID is provided and is a valid number
    if (id === undefined || id === null || id === '' || id === 'undefined' || id === 'null') {
        throw new Error(`Cannot delete ${entityName}: missing ID field`);
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Cannot delete ${entityName}: invalid ID: ${id}`);
    }
    const resolvedId = await resolveDetailEntityId(entityName, parsedId);
    if (!resolvedId) {
        throw new Error(`${entityName} not found`);
    }

    // Check for dependent records
    const dependentCheck = await checkDependentRecords(entityName, config, resolvedId);
    if (dependentCheck.hasDependents) {
        const dependentNames = Object.keys(dependentCheck.counts).join(', ');
        throw new Error(`Cannot delete ${entityName}: has dependent records (${dependentNames})`);
    }

    return executePrismaWrite(entityName, 'delete', async () => {
        return await prisma[config.model].delete({
            where: { [config.idField]: resolvedId },
        });
    });
}
/**
 * Get all sanctioned posts (for dropdown)
 */
async function getAllSanctionedPosts() {
    return await prisma.sanctionedPost.findMany({
        orderBy: { sanctionedPostId: 'asc' }
    });
}

/**
 * Get all disciplines (for dropdown)
 */
async function getAllDisciplines() {
    return await prisma.discipline.findMany({
        orderBy: { disciplineId: 'asc' }
    });
}

/**
 * Get all infrastructure masters (for dropdown)
 */
async function getAllInfraMasters() {
    return await prisma.kvkInfrastructureMaster.findMany({
        orderBy: { infraMasterId: 'asc' }
    });
}

/**
 * Get KVK staff for dropdown (filtered by kvkId, transferStatus, and sanctionedPost)
 * Only returns staff with SMS or KVK Head positions
 * @param {number} kvkId - KVK ID to filter staff
 * @returns {Promise<Array>} Array of staff with kvkStaffId, staffName, email, and sanctionedPost
 */
async function getStaffForDropdown(kvkId) {
    if (!kvkId || isNaN(parseInt(kvkId))) {
        throw new Error('Valid kvkId is required');
    }

    return await prisma.kvkStaff.findMany({
        where: {
            kvkId: parseInt(kvkId),
            transferStatus: 'ACTIVE', // Only show active staff
            OR: [
                {
                    sanctionedPost: {
                        postName: {
                            contains: 'SMS',
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    sanctionedPost: {
                        postName: {
                            contains: 'Head',
                            mode: 'insensitive'
                        }
                    }
                }
            ]
        },
        select: {
            kvkStaffId: true,
            staffName: true,
            email: true,
            sanctionedPost: {
                select: {
                    sanctionedPostId: true,
                    postName: true,
                }
            }
        },
        orderBy: [
            { positionOrder: 'asc' },
            { staffName: 'asc' },
            { kvkStaffId: 'asc' },
        ]
    });
}

/**
 * Create transfer history record.
 * Caller must supply a valid transferDate (Date object or parseable date value).
 * @param {object} transferData
 * @param {import('@prisma/client').PrismaClient|import('@prisma/client').Prisma.TransactionClient} [dbClient]
 */
async function createTransferHistory(transferData, dbClient = prisma) {
    return await dbClient.staffTransferHistory.create({
        data: {
            kvkStaffId: transferData.kvkStaffId,
            fromKvkId: transferData.fromKvkId,
            toKvkId: transferData.toKvkId,
            transferredBy: transferData.transferredBy,
            transferDate: transferData.transferDate,
            transferReason: transferData.transferReason,
            notes: transferData.notes,
            isReversal: transferData.isReversal || false,
            reversedTransferId: transferData.reversedTransferId,
        },
        include: {
            staff: {
                select: {
                    kvkStaffId: true,
                    staffName: true,
                }
            },
            fromKvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                }
            },
            toKvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                }
            },
            transferredByUser: {
                select: {
                    userId: true,
                    name: true,
                    email: true,
                }
            }
        }
    });
}

/**
 * Returns the most-recent non-reversal transfer record for a staff member.
 * Used by duplicate-consecutive-transfer guard in service layer.
 */
async function getLastTransferRecord(staffId) {
    return prisma.staffTransferHistory.findFirst({
        where: { kvkStaffId: staffId, isReversal: false },
        orderBy: { transferDate: 'desc' },
        select: {
            transferId: true,
            fromKvkId: true,
            toKvkId: true,
            transferDate: true,
        },
    });
}

async function filterAssetsForReportingYear({ kvkId, reportingYear, assetType }) {
    const parsedKvkId = sanitizeInteger(kvkId);
    const targetYearDate = reportingYear ? parseReportingYearDate(reportingYear) : new Date();
    const kvkFilter = parsedKvkId ? { kvkId: parsedKvkId } : {};

    if (assetType === 'vehicle') {
        const hiddenVehicleIds = await prisma.kvkVehicleDetail.findMany({
            where: {
                ...kvkFilter,
                reportingYear: { lt: targetYearDate },
                vehicleStatus: { hideInNextYear: true },
            },
            distinct: ['vehicleId'],
            select: { vehicleId: true },
        });

        return {
            hiddenAssetIds: hiddenVehicleIds.map((item) => item.vehicleId),
            targetYearDate,
        };
    }

    const hiddenEquipmentIds = await prisma.kvkEquipmentDetail.findMany({
        where: {
            ...kvkFilter,
            reportingYear: { lt: targetYearDate },
            equipmentStatus: { hideInNextYear: true },
        },
        distinct: ['equipmentId'],
        select: { equipmentId: true },
    });

    return {
        hiddenAssetIds: hiddenEquipmentIds.map((item) => item.equipmentId),
        targetYearDate,
    };
}

async function getVehiclesForDropdown(kvkId, reportingYear) {
    const parsedKvkId = sanitizeInteger(kvkId);
    const { hiddenAssetIds } = await filterAssetsForReportingYear({
        kvkId: parsedKvkId,
        reportingYear,
        assetType: 'vehicle',
    });

    return prisma.kvkVehicle.findMany({
        where: {
            ...(parsedKvkId ? { kvkId: parsedKvkId } : {}),
            ...(hiddenAssetIds.length ? { vehicleId: { notIn: hiddenAssetIds } } : {}),
        },
        select: {
            vehicleId: true,
            vehicleName: true,
            registrationNo: true,
            vehicleTypeId: true,
            vehicleTypeOther: true,
            vehicleType: { select: { vehicleTypeId: true, name: true, isOther: true } },
        },
        orderBy: { vehicleName: 'asc' },
    });
}

async function getEquipmentsForDropdown(kvkId, reportingYear) {
    const parsedKvkId = sanitizeInteger(kvkId);
    const { hiddenAssetIds } = await filterAssetsForReportingYear({
        kvkId: parsedKvkId,
        reportingYear,
        assetType: 'equipment',
    });

    return prisma.kvkEquipment.findMany({
        where: {
            ...(parsedKvkId ? { kvkId: parsedKvkId } : {}),
            ...(hiddenAssetIds.length ? { equipmentId: { notIn: hiddenAssetIds } } : {}),
        },
        select: {
            equipmentId: true,
            equipmentName: true,
            companyBrandModel: true,
            identifierCode: true,
            equipmentTypeId: true,
            equipmentType: { select: { equipmentTypeId: true, name: true } },
        },
        orderBy: [{ equipmentTypeId: 'asc' }, { equipmentName: 'asc' }],
    });
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteEntity,
    getAllSanctionedPosts,
    getAllDisciplines,
    getAllInfraMasters,
    getStaffForDropdown,
    createTransferHistory,
    getLastTransferRecord,
    filterAssetsForReportingYear,
    getVehiclesForDropdown,
    getEquipmentsForDropdown,
};
