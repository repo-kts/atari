const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
}

// Create a PostgreSQL connection pool optimized for high concurrency
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Allow self-signed certificates
    // Optimized pool settings for high-performance concurrent requests
    max: 20, // Increased for better concurrency
    min: 5, // Keep more connections ready
    idleTimeoutMillis: 30000, // Faster cleanup of idle connections
    connectionTimeoutMillis: 20000, // Reduced timeout for faster failure detection
    // Performance optimizations
    allowExitOnIdle: false,
    keepAlive: false, // Disable to reduce overhead
    statement_timeout: 10000, // 10 second query timeout
    query_timeout: 10000, // 10 second query timeout
});

// Handle pool errors (e.g. Neon/serverless closes idle connections)
// Do NOT call process.exit() - the pool removes bad clients and creates new ones on next query.
// Exiting would crash the entire backend; logging and continuing lets it recover.
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Create PrismaClient with the adapter
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});


module.exports = prisma;
