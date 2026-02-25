const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// The exact function from utils/password.js (replicating to avoid import issues)
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10); // match BCRYPT_ROUNDS=10 in .env
    return await bcrypt.hash(password, salt);
}

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 UNIFIED LOGIN FIX...');

        const universalPass = 'Atari@123';
        const hashedPassword = await hashPassword(universalPass);
        const now = new Date();

        // Ensure Gaya KVK exists
        const kvkRes = await pool.query("INSERT INTO kvk (kvk_name, \"zoneId\", \"stateId\", \"districtId\", org_id, host_org_name, mobile, email, address, year_of_sanction) VALUES ('KVK Gaya', 1, 1, 1, 1, 'ICAR', '0123456789', 'kvkgaya@atari.gov.in', 'Gaya, Bihar', 2000) ON CONFLICT DO NOTHING RETURNING kvk_id");
        const kvkId = (await pool.query("SELECT kvk_id FROM kvk WHERE kvk_name = 'KVK Gaya'")).rows[0].kvk_id;

        const usersToSet = [
            { email: 'superadmin@atari.gov.in', role: 1, name: 'Super Admin' },
            { email: 'kvkgaya@atari.gov.in', role: 6, name: 'Gaya Admin' },
            { email: 'kvkuser@atari.gov.in', role: 7, name: 'Sample KVK User' }
        ];

        for (const u of usersToSet) {
            const exists = (await pool.query("SELECT * FROM users WHERE email = $1", [u.email])).rows[0];
            if (exists) {
                await pool.query(
                    'UPDATE users SET password_hash = $1, role_id = $2, kvk_id = $3, updated_at = $4, deleted_at = NULL WHERE email = $5',
                    [hashedPassword, u.role, u.role === 1 ? null : kvkId, now, u.email]
                );
            } else {
                await pool.query(
                    'INSERT INTO users (name, email, password_hash, role_id, kvk_id, zone_id, state_id, district_id, org_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 1, 1, 1, 1, $6, $7)',
                    [u.name, u.email, hashedPassword, u.role, u.role === 1 ? null : kvkId, now, now]
                );
            }
            console.log(`✅ Set up ${u.email}`);
        }

        // Add dummy staff for Gaya again just in case
        await pool.query(`
            INSERT INTO kvk_staff ("kvkId", staff_name, email, mobile, "sanctionedPostId", "disciplineId", transfer_status, date_of_birth, date_of_joining, position_order)
            VALUES ($1, 'Dr. Ramesh Kumar', 'ramesh@example.com', '9876543210', 1, 1, 'ACTIVE', '1980-01-01', '2010-01-01', 1)
            ON CONFLICT DO NOTHING
        `, [kvkId]);

        console.log('\n✨ ALL LOGINS FIXED.');
        console.log('-------------------------');
        console.log('PASSWORD FOR ALL: Atari@123');
        console.log('-------------------------');
        console.log('Try: superadmin@atari.gov.in or kvkgaya@atari.gov.in');

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
