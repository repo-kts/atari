const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT user_id, email, role_id, kvk_id FROM users');
        console.log('Current Users:');
        console.table(res.rows);

        const roles = await pool.query('SELECT role_id, role_name FROM roles');
        console.log('Available Roles:');
        console.table(roles.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
