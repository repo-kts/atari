const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'hrd_program'
            ORDER BY ordinal_position
        `);
        console.log(`\nTable: hrd_program`);
        console.table(res.rows);
    } catch (err) {
        console.error(`Error describing hrd_program:`, err);
    } finally {
        await pool.end();
    }
}

run();
