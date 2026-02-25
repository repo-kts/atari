const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const res = await pool.query("SELECT email, password_hash, kvk_id FROM users");
    console.log('Users in DB:', res.rows);
    await pool.end();
}
run();
