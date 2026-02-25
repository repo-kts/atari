const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🏗️  Hard-resetting both users to Gaya@123 for verification...');

        // 1. Hash password with rounds=10 to match .env
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const passwordHash = await bcrypt.hash('Gaya@123', rounds);

        // 2. Get Gaya KVK ID
        const kvkRes = await pool.query("SELECT kvk_id FROM kvk WHERE kvk_name = 'KVK Gaya'");
        if (kvkRes.rows.length === 0) {
            console.error('❌ KVK Gaya not found. Please run the previous restoration steps.');
            return;
        }
        const kvkId = kvkRes.rows[0].kvk_id;

        // 3. Update both users
        const emails = ['kvkgaya@atari.gov.in', 'kvkuser@atari.gov.in'];
        for (const email of emails) {
            const res = await pool.query(
                "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING user_id",
                [passwordHash, email]
            );
            if (res.rows.length > 0) {
                console.log(`✅ Reset password for ${email} to: Gaya@123`);
            } else {
                console.log(`⚠️ User ${email} not found in database.`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

run();
