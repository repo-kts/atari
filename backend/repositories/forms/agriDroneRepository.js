const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const { normalizeOptionalIndianMobile } = require('../../utils/validation.js');
const {
    ValidationError,
    UnauthorizedError,
    translatePrismaError,
} = require('../../utils/errorHandler.js');

const KVK_SCOPED_ROLES = ['kvk_admin', 'kvk_user'];
const PRISMA_RESOURCE = 'Agri drone introduction';

function isKvkScopedUser(user) {
    return Boolean(user && KVK_SCOPED_ROLES.includes(user.roleName));
}

function isPrismaClientError(error) {
    return typeof error?.code === 'string' && /^P\d{4}$/.test(error.code);
}

/**
 * Maps Prisma and unexpected errors to app errors; rethrows domain errors as-is.
 */
async function withAgriDroneRepoErrors(operation, fn) {
    try {
        return await fn();
    } catch (error) {
        if (
            error instanceof ValidationError ||
            error instanceof UnauthorizedError ||
            (typeof error.statusCode === 'number' && error.statusCode < 500)
        ) {
            throw error;
        }
        if (isPrismaClientError(error)) {
            throw translatePrismaError(error, PRISMA_RESOURCE, operation);
        }
        throw error;
    }
}

function parseRequiredKvkId(data, user) {
    const source = isKvkScopedUser(user) ? user.kvkId : data.kvkId;
    const kvkId = source !== undefined && source !== null ? parseInt(source, 10) : NaN;
    if (Number.isNaN(kvkId) || kvkId < 1) {
        throw new ValidationError('Valid kvkId is required', 'kvkId');
    }
    return kvkId;
}

/** @returns {number} positive integer DB id */
function parseAgriDroneId(id) {
    if (id === undefined || id === null || id === '') {
        throw new ValidationError('Valid agriDroneId is required', 'agriDroneId');
    }
    const n = parseInt(id, 10);
    if (Number.isNaN(n) || n < 1) {
        throw new ValidationError('Valid agriDroneId is required', 'agriDroneId');
    }
    return n;
}

function accessWhereForAgriDroneId(id, user) {
    const where = { agriDroneId: parseAgriDroneId(id) };
    if (isKvkScopedUser(user)) {
        const kvkId = parseInt(user.kvkId, 10);
        if (Number.isNaN(kvkId) || kvkId < 1) {
            throw new ValidationError('Valid kvkId is required', 'kvkId');
        }
        where.kvkId = kvkId;
    }
    return where;
}

function normalizePilotContact(rawPilot) {
    if (String(rawPilot ?? '').trim() === '') {
        return '';
    }
    try {
        return normalizeOptionalIndianMobile(rawPilot, 'Pilot contact') || '';
    } catch (e) {
        if (e instanceof ValidationError) {
            throw e;
        }
        throw new ValidationError(e.message || 'Invalid pilot contact', 'pilotContact');
    }
}

function parseNonNegativeInt(value, defaultValue, field) {
    const raw = value === undefined || value === null || value === '' ? defaultValue : value;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) {
        throw new ValidationError(`${field} must be a valid whole number`, field);
    }
    if (n < 0) {
        throw new ValidationError(`${field} cannot be negative`, field);
    }
    return n;
}

function parseNonNegativeFloat(value, defaultValue, field) {
    const raw = value === undefined || value === null || value === '' ? defaultValue : value;
    const n = parseFloat(raw);
    if (Number.isNaN(n)) {
        throw new ValidationError(`${field} must be a valid number`, field);
    }
    if (n < 0) {
        throw new ValidationError(`${field} cannot be negative`, field);
    }
    return n;
}

function parseOptionalNonNegativeInt(value, field) {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) {
        throw new ValidationError(`${field} must be a valid whole number`, field);
    }
    if (n < 0) {
        throw new ValidationError(`${field} cannot be negative`, field);
    }
    return n;
}

function parseOptionalNonNegativeFloat(value, field) {
    const n = parseFloat(value);
    if (Number.isNaN(n)) {
        throw new ValidationError(`${field} must be a valid number`, field);
    }
    if (n < 0) {
        throw new ValidationError(`${field} cannot be negative`, field);
    }
    return n;
}

function buildCreateData(data, kvkId, reportingYear) {
    return {
        kvkId,
        reportingYear,
        projectImplementingCentre: data.picName ?? data.projectImplementingCentre ?? '',
        dronesSanctioned: parseNonNegativeInt(data.dronesSanctioned, 0, 'dronesSanctioned'),
        dronesPurchased: parseNonNegativeInt(data.dronesPurchased, 0, 'dronesPurchased'),
        amountSanctioned: parseNonNegativeFloat(data.amountSanctioned, 0, 'amountSanctioned'),
        costPerDrone: parseNonNegativeFloat(data.droneCost ?? data.costPerDrone, 0, 'costPerDrone'),
        droneCompany: data.droneCompany ?? '',
        droneModel: data.droneModel ?? '',
        pilotName: data.pilotName ?? '',
        pilotContact: normalizePilotContact(data.pilotContact ?? ''),
        targetAreaHa: parseNonNegativeFloat(data.targetArea ?? data.targetAreaHa, 0, 'targetAreaHa'),
        demoAmountSanctioned: parseNonNegativeFloat(data.demoAmountSanctioned, 0, 'demoAmountSanctioned'),
        demoAmountUtilised: parseNonNegativeFloat(data.demoAmountUtilised, 0, 'demoAmountUtilised'),
        operationType: data.operations ?? data.operationType ?? '',
        advantagesObserved: data.advantages ?? data.advantagesObserved ?? '',
    };
}

function buildUpdateData(data) {
    const prismaData = {};

    if (data.reportingYear !== undefined) {
        const reportingYearDate = parseReportingYearDate(data.reportingYear);
        ensureNotFutureDate(reportingYearDate);
        prismaData.reportingYear = reportingYearDate;
    }

    const picName = data.picName ?? data.projectImplementingCentre;
    if (picName !== undefined) {
        prismaData.projectImplementingCentre = picName;
    }
    if (data.dronesSanctioned !== undefined) {
        prismaData.dronesSanctioned = parseOptionalNonNegativeInt(data.dronesSanctioned, 'dronesSanctioned');
    }
    if (data.dronesPurchased !== undefined) {
        prismaData.dronesPurchased = parseOptionalNonNegativeInt(data.dronesPurchased, 'dronesPurchased');
    }
    if (data.amountSanctioned !== undefined) {
        prismaData.amountSanctioned = parseOptionalNonNegativeFloat(data.amountSanctioned, 'amountSanctioned');
    }
    const droneCost = data.droneCost ?? data.costPerDrone;
    if (droneCost !== undefined) {
        prismaData.costPerDrone = parseOptionalNonNegativeFloat(droneCost, 'costPerDrone');
    }
    if (data.droneCompany !== undefined) {
        prismaData.droneCompany = data.droneCompany;
    }
    if (data.droneModel !== undefined) {
        prismaData.droneModel = data.droneModel;
    }
    if (data.pilotName !== undefined) {
        prismaData.pilotName = data.pilotName;
    }
    if (data.pilotContact !== undefined) {
        if (String(data.pilotContact ?? '').trim() === '') {
            prismaData.pilotContact = '';
        } else {
            prismaData.pilotContact = normalizePilotContact(data.pilotContact);
        }
    }
    const targetArea = data.targetArea ?? data.targetAreaHa;
    if (targetArea !== undefined) {
        prismaData.targetAreaHa = parseOptionalNonNegativeFloat(targetArea, 'targetAreaHa');
    }
    if (data.demoAmountSanctioned !== undefined) {
        prismaData.demoAmountSanctioned = parseOptionalNonNegativeFloat(
            data.demoAmountSanctioned,
            'demoAmountSanctioned'
        );
    }
    if (data.demoAmountUtilised !== undefined) {
        prismaData.demoAmountUtilised = parseOptionalNonNegativeFloat(
            data.demoAmountUtilised,
            'demoAmountUtilised'
        );
    }
    const operationType = data.operations ?? data.operationType;
    if (operationType !== undefined) {
        prismaData.operationType = operationType;
    }
    const advantages = data.advantages ?? data.advantagesObserved;
    if (advantages !== undefined) {
        prismaData.advantagesObserved = advantages;
    }

    return prismaData;
}

const kvkNameSelect = { kvk: { select: { kvkName: true } } };

const agriDroneRepository = {
    create: async (data, user) =>
        withAgriDroneRepoErrors('create', async () => {
            const kvkId = parseRequiredKvkId(data, user);
            const reportingYear = parseReportingYearDate(data.reportingYear);
            ensureNotFutureDate(reportingYear);

            const created = await prisma.kvkAgriDrone.create({
                data: buildCreateData(data, kvkId, reportingYear),
                include: kvkNameSelect,
            });

            return agriDroneRepository._mapResponse(created);
        }),

    findAll: async (filters = {}, user) =>
        withAgriDroneRepoErrors('findMany', async () => {
            const where = {};
            if (isKvkScopedUser(user)) {
                const kvkId = parseInt(user.kvkId, 10);
                if (Number.isNaN(kvkId) || kvkId < 1) {
                    throw new ValidationError('Valid kvkId is required', 'kvkId');
                }
                where.kvkId = kvkId;
            } else if (filters.kvkId !== undefined && filters.kvkId !== null && filters.kvkId !== '') {
                const k = parseInt(filters.kvkId, 10);
                if (Number.isNaN(k) || k < 1) {
                    throw new ValidationError('Valid kvkId is required', 'kvkId');
                }
                where.kvkId = k;
            }

            const records = await prisma.kvkAgriDrone.findMany({
                where,
                include: kvkNameSelect,
                orderBy: { agriDroneId: 'desc' },
            });

            return records.map((r) => agriDroneRepository._mapResponse(r));
        }),

    findById: async (id, user) =>
        withAgriDroneRepoErrors('findFirst', async () => {
            const record = await prisma.kvkAgriDrone.findFirst({
                where: accessWhereForAgriDroneId(id, user),
                include: kvkNameSelect,
            });
            return agriDroneRepository._mapResponse(record);
        }),

    update: async (id, data, user) =>
        withAgriDroneRepoErrors('update', async () => {
            const where = accessWhereForAgriDroneId(id, user);

            const existing = await prisma.kvkAgriDrone.findFirst({
                where,
                select: { agriDroneId: true },
            });

            if (!existing) {
                throw new UnauthorizedError('Record not found or unauthorized');
            }

            const prismaData = buildUpdateData(data);
            if (Object.keys(prismaData).length > 0) {
                await prisma.kvkAgriDrone.update({
                    where: { agriDroneId: existing.agriDroneId },
                    data: prismaData,
                });
            }

            return agriDroneRepository.findById(id, user);
        }),

    delete: async (id, user) =>
        withAgriDroneRepoErrors('delete', async () => {
            const result = await prisma.kvkAgriDrone.deleteMany({
                where: accessWhereForAgriDroneId(id, user),
            });

            if (result.count === 0) {
                throw new UnauthorizedError('Record not found or unauthorized');
            }

            return { success: true };
        }),

    _mapResponse: (r) => {
        if (!r) return null;
        return {
            ...r,
            id: r.agriDroneId,
            reportingYear: r.reportingYear,
            yearName: formatReportingYear(r.reportingYear),
            projectImplementingCentre: r.projectImplementingCentre,
            droneCompany: r.droneCompany,
            droneModel: r.droneModel,
            dronesSanctioned: r.dronesSanctioned,
            dronesPurchased: r.dronesPurchased,
            amountSanctioned: r.amountSanctioned,
            pilotName: r.pilotName,
            pilotContact: r.pilotContact,
            targetAreaHa: r.targetAreaHa,
            demoAmountSanctioned: r.demoAmountSanctioned,
            demoAmountUtilised: r.demoAmountUtilised,
            operationType: r.operationType,
            advantagesObserved: r.advantagesObserved,
        };
    },
};

module.exports = agriDroneRepository;
