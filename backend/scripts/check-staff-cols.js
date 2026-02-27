const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'kvk_staff'");
    console.log('Columns in kvk_staff:', res.rows.map(r => r.column_name));
    await pool.end();
}
run();

