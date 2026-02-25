const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const res = await pool.query("SELECT kvk_staff_id, staff_name, \"kvkId\" FROM kvk_staff");
    console.log('Staff records:', res.rows);
    await pool.end();
}
run();
