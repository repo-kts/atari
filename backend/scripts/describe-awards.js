const { Pool } = require('pg');
require('dotenv').config();

async function describeTable(tableName) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);
        console.log(`\nTable: ${tableName}`);
        console.table(res.rows);
    } catch (err) {
        console.error(`Error describing ${tableName}:`, err);
    } finally {
        await pool.end();
    }
}

async function run() {
    await describeTable('scientist_award');
    await describeTable('farmer_award');
}

run();
