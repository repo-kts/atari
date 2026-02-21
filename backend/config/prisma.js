require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
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
    // Using direct connection - use pg adapter for better serverless support
    console.log('🔌 Using direct PostgreSQL connection with pg adapter');
    
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
        statement_timeout: 10000, // 10 second query timeout
        query_timeout: 10000, // 10 second query timeout
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

module.exports = prisma;
