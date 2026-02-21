require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');


if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
}

// Create a PostgreSQL connection pool configured for Neon serverless
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
    max: 30,
    min: 0, // Don't maintain idle connections — Neon suspends them
    idleTimeoutMillis: 30000, // Release idle connections before Neon drops them
    connectionTimeoutMillis: 30000,
    allowExitOnIdle: true, // Allow pool to wind down when idle
    keepAlive: true, // Keep connections alive to prevent unexpected drops
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 60000, // 60 second query timeout
    query_timeout: 60000, // 60 second query timeout
});

// Handle pool errors (e.g. Neon/serverless closes idle connections)
// Do NOT call process.exit() — the pool removes bad clients and creates new ones on next query.
pool.on('error', (err) => {
    console.error('Pool idle client error (non-fatal):', err.message);
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Create PrismaClient with the adapter
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});


module.exports = prisma;
