const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 Final System Restoration (Safe Mode v3)...');

        const hashedPassword = await bcrypt.hash('Gaya@123', 10);

        // 1. Hierarchy
        const getOrInsert = async (table, nameCol, nameVal, extra = {}) => {
            const tableEscaped = table.includes('Master') ? `"${table}"` : table;
            const res = await pool.query(`SELECT * FROM ${tableEscaped} WHERE ${nameCol} = $1`, [nameVal]);
            if (res.rows.length > 0) return res.rows[0];

            const cols = [nameCol, ...Object.keys(extra)];
            const vals = [nameVal, ...Object.values(extra)];
            const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
            const insertRes = await pool.query(
                `INSERT INTO ${tableEscaped} (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`,
                vals
            );
            return insertRes.rows[0];
        };

        const zone = await getOrInsert('zone', 'zone_name', 'Zone IV - Patna');
        const state = await getOrInsert('stateMaster', 'state_name', 'Bihar', { zoneId: zone.zone_id });
        const district = await getOrInsert('districtMaster', 'district_name', 'Gaya', { stateId: state.state_id, zoneId: zone.zone_id });
        const org = await getOrInsert('orgMaster', 'org_name', 'ICAR', { districtId: district.district_id });

        // 2. KVK Gaya
        console.log('Ensuring KVK Gaya exists...');
        let kvk = (await pool.query("SELECT * FROM kvk WHERE kvk_name = 'KVK Gaya'")).rows[0];
        if (!kvk) {
            kvk = (await pool.query(`
                INSERT INTO kvk (kvk_name, "zoneId", "stateId", "districtId", org_id, host_org_name, mobile, email, address, year_of_sanction)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, ['KVK Gaya', zone.zone_id, state.state_id, district.district_id, org.org_id, 'ICAR', '0123456789', 'kvkgaya@atari.gov.in', 'Gaya, Bihar', 2000])).rows[0];
        }

        // 3. Role
        const role = (await pool.query("SELECT role_id FROM roles WHERE role_name = 'kvk_admin'")).rows[0];
        if (!role) throw new Error('Role kvk_admin not found.');

        // 4. Users
        console.log('Updating user accounts...');
        const emails = ['kvkgaya@atari.gov.in', 'kvkuser@atari.gov.in'];
        const now = new Date();
        for (const email of emails) {
            const existing = (await pool.query("SELECT * FROM users WHERE email = $1", [email])).rows[0];
            if (existing) {
                await pool.query(
                    'UPDATE users SET password_hash = $1, kvk_id = $2, role_id = $3, updated_at = $4 WHERE email = $5',
                    [hashedPassword, kvk.kvk_id, role.role_id, now, email]
                );
            } else {
                await pool.query(
                    'INSERT INTO users (name, email, password_hash, role_id, kvk_id, zone_id, state_id, district_id, org_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                    [email.split('@')[0], email, hashedPassword, role.role_id, kvk.kvk_id, zone.zone_id, state.state_id, district.district_id, org.org_id, now, now]
                );
            }
        }

        // 5. Staff
        console.log('Restoring Staff with mandatory fields...');
        const post = (await pool.query("SELECT sanctioned_post_id FROM sanctioned_post LIMIT 1")).rows[0];
        const disc = (await pool.query("SELECT discipline_id FROM discipline LIMIT 1")).rows[0];
        const dob = new Date('1985-01-01');
        const doj = new Date('2015-01-01');

        const staff = ['Dr. Ramesh Kumar', 'Shri. Sunil Singh', 'Dr. Anita Kumari'];
        let pos = 1;
        for (const s of staff) {
            const exists = (await pool.query('SELECT * FROM kvk_staff WHERE staff_name = $1 AND "kvkId" = $2', [s, kvk.kvk_id])).rows[0];
            if (!exists) {
                await pool.query(
                    'INSERT INTO kvk_staff ("kvkId", staff_name, email, mobile, "sanctionedPostId", "disciplineId", transfer_status, date_of_birth, date_of_joining, position_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    [kvk.kvk_id, s, `${s.toLowerCase().replace(/ /g, '.')}@example.com`, '9876543210', post?.sanctioned_post_id || 1, disc?.discipline_id || 1, 'ACTIVE', dob, doj, pos++]
                );
            }
        }

        // 6. Years
        await pool.query("INSERT INTO year_master (year_name) VALUES ('2023-24'), ('2024-25'), ('2025-26') ON CONFLICT DO NOTHING");

        console.log('\n✅ RESTORATION SUCCESSFUL');
        console.log('LOGIN: kvkgaya@atari.gov.in');
        console.log('PASS: Gaya@123');

    } catch (err) {
        console.error('❌ FATAL ERROR:', err);
    } finally {
        await pool.end();
    }
}

run();
