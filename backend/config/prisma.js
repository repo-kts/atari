require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
}

const STRICT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[Tt].*)?$/;
const YEAR_PATTERN = /^\d{4}$/;

const DUAL_REPORTING_YEAR_MODEL_CONFIG = {
    KvkBudgetUtilization: { yearField: 'year', dateField: 'reportingYearDate' },
    BeneficiariesDetails: { yearField: 'year', dateField: 'reportingYearDate' },
    SoilDataInformation: { yearField: 'year', dateField: 'reportingYearDate' },
    FinancialInformation: { yearField: 'year', dateField: 'reportingYearDate' },
    PpvFraPlantVarieties: { yearField: 'reportingYear', dateField: 'reportingYearDate' },
    Target: { yearField: 'reportingYear', dateField: 'reportingYearDate' },
    ModuleImage: { yearField: 'reportingYear', dateField: 'reportingYearDate' },
};

function isPresent(value) {
    return value !== undefined && value !== null && value !== '';
}

function parseDateInput(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value === 'number' && Number.isInteger(value) && value >= 1900 && value <= 3000) {
        return new Date(Date.UTC(value, 0, 1));
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) return null;

    if (YEAR_PATTERN.test(trimmed)) {
        return new Date(Date.UTC(parseInt(trimmed, 10), 0, 1));
    }

    if (!STRICT_DATE_PATTERN.test(trimmed)) {
        return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseYearInput(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value.getUTCFullYear();
    }

    if (typeof value === 'number') {
        if (Number.isInteger(value) && value >= 1900 && value <= 3000) return value;
        return null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) return null;

    if (YEAR_PATTERN.test(trimmed)) {
        return parseInt(trimmed, 10);
    }

    if (!STRICT_DATE_PATTERN.test(trimmed)) {
        return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCFullYear();
}

function getModelConfig(model) {
    return DUAL_REPORTING_YEAR_MODEL_CONFIG[model] || null;
}

function normalizeDualReportingYearData(data, config, mode) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return data;
    }

    const normalized = { ...data };
    const { yearField, dateField } = config;

    if (yearField === 'year' && !isPresent(normalized.year) && isPresent(normalized.reportingYear)) {
        normalized.year = normalized.reportingYear;
    }

    if (yearField === 'reportingYear' && !isPresent(normalized.reportingYear) && isPresent(normalized.year)) {
        normalized.reportingYear = normalized.year;
    }

    const rawDateInput = isPresent(normalized[dateField]) ? normalized[dateField] : normalized.reportingYearDate;
    const rawYearInput = isPresent(normalized[yearField])
        ? normalized[yearField]
        : (isPresent(normalized.reportingYear) ? normalized.reportingYear : normalized.year);

    const parsedDate = parseDateInput(rawDateInput) || parseDateInput(rawYearInput);
    const parsedYear = parseYearInput(rawYearInput) ?? (parsedDate ? parsedDate.getUTCFullYear() : null);

    if (parsedDate) {
        normalized[dateField] = parsedDate;
    } else if (
        mode === 'create' &&
        parsedYear !== null &&
        !isPresent(normalized[dateField]) &&
        !isPresent(normalized.reportingYearDate)
    ) {
        normalized[dateField] = new Date(Date.UTC(parsedYear, 0, 1));
    }

    if (parsedYear !== null) {
        normalized[yearField] = parsedYear;
    }

    // During update, when only numeric year is sent, preserve existing stored date.
    if (mode === 'update' && !parseDateInput(rawDateInput) && !parseDateInput(rawYearInput)) {
        delete normalized[dateField];
    }

    if (yearField !== 'year') {
        delete normalized.year;
    }
    if (yearField !== 'reportingYear') {
        delete normalized.reportingYear;
    }
    if (dateField !== 'reportingYearDate') {
        delete normalized.reportingYearDate;
    }

    return normalized;
}

function normalizeArgsForModel(model, args, mode) {
    const config = getModelConfig(model);
    if (!config || !args || !args.data) return args;

    if (Array.isArray(args.data)) {
        args.data = args.data.map((entry) => normalizeDualReportingYearData(entry, config, mode));
        return args;
    }

    args.data = normalizeDualReportingYearData(args.data, config, mode);
    return args;
}

// Check if using Prisma Accelerate or direct connection
const isAccelerate = process.env.DATABASE_URL.startsWith('prisma+');

let prisma;

if (isAccelerate) {
    // Using Prisma Accelerate
    console.log('🚀 Using Prisma Accelerate connection');
    prisma = new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
} else {
    // Create a PostgreSQL connection pool configured for Neon serverless
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
        max: 20,
        min: 0, // Don't maintain idle connections — Neon suspends them
        idleTimeoutMillis: 20000, // Release idle connections before Neon drops them
        connectionTimeoutMillis: 20000,
        allowExitOnIdle: true, // Allow pool to wind down when idle
        keepAlive: true, // Keep connections alive to prevent unexpected drops
        keepAliveInitialDelayMillis: 10000,
        statement_timeout: 60000, // INCREASED: Allow 60s for multi-image uploads
        query_timeout: 60000,     // INCREASED: Allow 60s
    });

    // Handle pool errors (e.g. Neon/serverless closes idle connections)
    // Do NOT call process.exit() — the pool removes bad clients and creates new ones on next query.
    pool.on('error', (err) => {
        console.error('Pool idle client error (non-fatal):', err.message);
    });

    // Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    // Create PrismaClient with the adapter
    prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
}

prisma = prisma.$extends({
    name: 'reportingYearBridge',
    query: {
        $allModels: {
            create({ model, args, query }) {
                return query(normalizeArgsForModel(model, args, 'create'));
            },
            createMany({ model, args, query }) {
                return query(normalizeArgsForModel(model, args, 'create'));
            },
            update({ model, args, query }) {
                return query(normalizeArgsForModel(model, args, 'update'));
            },
            updateMany({ model, args, query }) {
                return query(normalizeArgsForModel(model, args, 'update'));
            },
            upsert({ model, args, query }) {
                const config = getModelConfig(model);
                if (config && args) {
                    if (args.create) {
                        args.create = normalizeDualReportingYearData(args.create, config, 'create');
                    }
                    if (args.update) {
                        args.update = normalizeDualReportingYearData(args.update, config, 'update');
                    }
                }
                return query(args);
            },
        },
    },
});

module.exports = prisma;
