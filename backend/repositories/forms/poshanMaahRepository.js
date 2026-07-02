const prisma = require('../../config/prisma.js');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler.js');

// Participant category fields that make up "Total Participants".
const PARTICIPANT_FIELDS = [
    'girls',
    'farmWomen',
    'farmers',
    'anganwadiWorkers',
    'govtOfficials',
    'publicRepresentatives',
];

// Non-negative integer count fields (participant categories + other counts).
const COUNT_FIELDS = [
    ...PARTICIPANT_FIELDS,
    'activitiesConducted',
    'saplingsPlanted',
    'vegetableKitsDistributed',
];

/**
 * Resolve the KVK id for the record, preferring the authenticated user's own
 * KVK. KVK users may only ever write to their own KVK.
 */
function resolveKvkId(data, user) {
    if (user && user.kvkId) return parseInt(user.kvkId, 10);
    if (data && data.kvkId != null && `${data.kvkId}`.trim() !== '') {
        const parsed = parseInt(data.kvkId, 10);
        if (Number.isNaN(parsed)) {
            throw new ValidationError('kvkId must be a valid number', 'kvkId');
        }
        return parsed;
    }
    throw new ValidationError('KVK ID is required', 'kvkId');
}

/** Coerce a value to a non-negative integer, throwing on invalid input. */
function toCount(value, field) {
    if (value === undefined || value === null || `${value}`.trim() === '') return 0;
    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
        throw new ValidationError(`${field} must be a whole number`, field);
    }
    if (num < 0) {
        throw new ValidationError(`${field} cannot be negative`, field);
    }
    return num;
}

/** Parse and validate the activity date. */
function toActivityDate(value) {
    if (value === undefined || value === null || `${value}`.trim() === '') {
        throw new ValidationError('Activity date is required', 'activityDate');
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ValidationError('Activity date is invalid', 'activityDate');
    }
    return date;
}

/**
 * Build the validated, normalized data object shared by create & update.
 * When `existing` is provided (update), only the fields present in `data`
 * override the current values.
 */
function buildData(data, existing = null) {
    const out = {};

    // Event name
    if (existing == null || data.eventName !== undefined) {
        const name = (data.eventName ?? existing?.eventName ?? '').toString().trim();
        if (!name) {
            throw new ValidationError('Name of Event/Programme is required', 'eventName');
        }
        out.eventName = name;
    }

    // Activity date
    if (existing == null || data.activityDate !== undefined) {
        out.activityDate = toActivityDate(
            data.activityDate !== undefined ? data.activityDate : existing?.activityDate
        );
    }

    // Count fields
    for (const field of COUNT_FIELDS) {
        if (existing == null || data[field] !== undefined) {
            out[field] = toCount(
                data[field] !== undefined ? data[field] : existing?.[field],
                field
            );
        }
    }

    // Recompute the authoritative total from the effective participant values.
    const effective = { ...existing, ...out };
    out.totalParticipants = PARTICIPANT_FIELDS.reduce(
        (sum, field) => sum + (Number(effective[field]) || 0),
        0
    );

    return out;
}

const poshanMaahRepository = {
    create: async (data, user) => {
        const kvkId = resolveKvkId(data, user);
        const payload = buildData(data);
        return prisma.poshanMaah.create({
            data: { kvkId, ...payload },
            include: { kvk: { select: { kvkName: true } } },
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId, 10);
        } else if (filters.kvkId) {
            const parsed = parseInt(filters.kvkId, 10);
            if (!Number.isNaN(parsed)) where.kvkId = parsed;
        }

        return prisma.poshanMaah.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: [{ activityDate: 'desc' }, { poshanMaahId: 'desc' }],
        });
    },

    findById: async (id, user) => {
        const poshanMaahId = parseInt(id, 10);
        if (Number.isNaN(poshanMaahId)) {
            throw new ValidationError('Invalid record id', 'id');
        }
        const where = { poshanMaahId };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId, 10);

        const record = await prisma.poshanMaah.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } } },
        });
        if (!record) throw new NotFoundError('Poshan Maah record');
        return record;
    },

    update: async (id, data, user) => {
        const poshanMaahId = parseInt(id, 10);
        if (Number.isNaN(poshanMaahId)) {
            throw new ValidationError('Invalid record id', 'id');
        }
        const where = { poshanMaahId };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId, 10);

        const existing = await prisma.poshanMaah.findFirst({ where });
        if (!existing) throw new NotFoundError('Poshan Maah record');

        const payload = buildData(data, existing);
        return prisma.poshanMaah.update({
            where: { poshanMaahId },
            data: payload,
            include: { kvk: { select: { kvkName: true } } },
        });
    },

    delete: async (id, user) => {
        const poshanMaahId = parseInt(id, 10);
        if (Number.isNaN(poshanMaahId)) {
            throw new ValidationError('Invalid record id', 'id');
        }
        const where = { poshanMaahId };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId, 10);

        const existing = await prisma.poshanMaah.findFirst({ where });
        if (!existing) throw new NotFoundError('Poshan Maah record');

        return prisma.poshanMaah.delete({ where: { poshanMaahId } });
    },
};

module.exports = poshanMaahRepository;
