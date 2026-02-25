const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🏗️  Restoring Gaya KVK, Staff, and Users...');

        // 1. Hash passwords
        const gayaPasswordHash = await bcrypt.hash('Gaya@123', 10);
        const userPasswordHash = await bcrypt.hash('Kvkuser@123', 10); // Common default

        // 2. Get Roles
        const roleRes = await pool.query("SELECT role_id FROM roles WHERE role_name = 'kvk_admin'");
        if (roleRes.rows.length === 0) {
            console.error('❌ Role kvk_admin not found.');
            return;
        }
        const roleId = roleRes.rows[0].role_id;

        // 3. Get Hierarchy
        let zoneRes = await pool.query("SELECT zone_id FROM zone WHERE zone_name = 'Zone IV - Patna'");
        if (zoneRes.rows.length === 0) {
            zoneRes = await pool.query("INSERT INTO zone (zone_name) VALUES ('Zone IV - Patna') RETURNING zone_id");
        }
        const zoneId = zoneRes.rows[0].zone_id;

        let stateRes = await pool.query("SELECT state_id FROM \"stateMaster\" WHERE state_name = 'Bihar'");
        if (stateRes.rows.length === 0) {
            stateRes = await pool.query("INSERT INTO \"stateMaster\" (state_name, \"zoneId\") VALUES ('Bihar', $1) RETURNING state_id", [zoneId]);
        }
        const stateId = stateRes.rows[0].state_id;

        let districtRes = await pool.query("SELECT district_id FROM \"districtMaster\" WHERE district_name = 'Gaya'");
        if (districtRes.rows.length === 0) {
            districtRes = await pool.query("INSERT INTO \"districtMaster\" (district_name, \"stateId\", \"zoneId\") VALUES ('Gaya', $1, $2) RETURNING district_id", [stateId, zoneId]);
        }
        const districtId = districtRes.rows[0].district_id;

        let orgRes = await pool.query("SELECT org_id FROM \"orgMaster\" WHERE org_name = 'ICAR'");
        if (orgRes.rows.length === 0) {
            orgRes = await pool.query("INSERT INTO \"orgMaster\" (org_name, \"districtId\") VALUES ('ICAR', $1) RETURNING org_id", [districtId]);
        }
        const orgId = orgRes.rows[0].org_id;

        // 4. Upsert Gaya KVK
        let kvkRes = await pool.query("SELECT kvk_id FROM kvk WHERE kvk_name = 'KVK Gaya'");
        let kvkId;
        if (kvkRes.rows.length === 0) {
            kvkRes = await pool.query(`
                INSERT INTO kvk (kvk_name, "zoneId", "stateId", "districtId", org_id, host_org_name, mobile, email, address, year_of_sanction)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING kvk_id
            `, ['KVK Gaya', zoneId, stateId, districtId, orgId, 'ICAR', '0123456789', 'kvkgaya@atari.gov.in', 'Gaya, Bihar', 2000]);
            kvkId = kvkRes.rows[0].kvk_id;
            console.log('✅ Created Gaya KVK');
        } else {
            kvkId = kvkRes.rows[0].kvk_id;
        }

        // 5. Restore a Staff Member for Gaya
        const disciplineRes = await pool.query("SELECT discipline_id FROM discipline LIMIT 1");
        const postIdRes = await pool.query("SELECT sanctioned_post_id FROM sanctioned_post LIMIT 1");

        if (disciplineRes.rows.length > 0 && postIdRes.rows.length > 0) {
            const discId = disciplineRes.rows[0].discipline_id;
            const postId = postIdRes.rows[0].sanctioned_post_id;

            await pool.query(`
                INSERT INTO kvk_staff ("kvkId", staff_name, email, mobile, date_of_birth, date_of_joining, "sanctionedPostId", "disciplineId", position_order, transfer_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT DO NOTHING
            `, [kvkId, 'Dr. Ramesh Kumar', 'ramesh@example.com', '9876543210', new Date('1980-01-01'), new Date('2010-01-01'), postId, discId, 1, 'ACTIVE']);
            console.log('✅ Restored a staff member: Dr. Ramesh Kumar');
        }

        // 6. Upsert Users
        const now = new Date();
        const usersToCreate = [
            { name: 'KVK Gaya Admin', email: 'kvkgaya@atari.gov.in', hash: gayaPasswordHash },
            { name: 'KVK User', email: 'kvkuser@atari.gov.in', hash: userPasswordHash }
        ];

        for (const u of usersToCreate) {
            await pool.query(`
                INSERT INTO users (name, email, password_hash, role_id, kvk_id, zone_id, state_id, district_id, org_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    kvk_id = EXCLUDED.kvk_id,
                    role_id = EXCLUDED.role_id,
                    updated_at = EXCLUDED.updated_at
            `, [u.name, u.email, u.hash, roleId, kvkId, zoneId, stateId, districtId, orgId, now, now]);
            console.log(`✅ Restored User: ${u.email}`);
        }

    } catch (err) {
        console.error('❌ Error in restoration:', err);
    } finally {
        await pool.end();
    }
}

run();
