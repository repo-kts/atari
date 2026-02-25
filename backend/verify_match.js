const { comparePassword } = require('./utils/password');
const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query("SELECT email, password_hash FROM users WHERE email = 'kvkgaya@atari.gov.in'");
        const user = res.rows[0];
        console.log(`Checking ${user.email}...`);

        const match = await comparePassword('Atari@123', user.password_hash);
        console.log(`Password match with internal logic: ${match}`);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
