require('dotenv').config();
const { Client } = require('pg');

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();

    const names = [
        'Sri Akhilesh Kumar', 'Dr. Reeta Singh', 'Mr. Rajeev Kumar',
        'Dr. Prakash Chandra Gupta', 'Dr. Pushpam Patel', 'Smt. Sangeetha Kumari',
        'Sri Chandan Kumar', 'Sri Kanhaiya Kumar Rai', 'Sri Bachan Sah', 'Sri Mukesh Kumar'
    ];

    try {
        const kRes = await client.query(`SELECT kvk_id FROM kvk WHERE kvk_name ILIKE '%Gaya%' LIMIT 1`);
        const kvkId = (kRes.rows.length > 0) ? kRes.rows[0].kvk_id : 1;

        const dRes = await client.query(`SELECT discipline_id FROM "Discipline" LIMIT 1`);
        const dId = (dRes.rows.length > 0) ? dRes.rows[0].discipline_id : 1;

        const spRes = await client.query(`SELECT sanctioned_post_id FROM "SanctionedPost" LIMIT 1`);
        const spId = (spRes.rows.length > 0) ? spRes.rows[0].sanctioned_post_id : 1;

        for (const n of names) {
            const exists = await client.query(`SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1`, [n]);
            if (exists.rows.length === 0) {
                await client.query(
                    `INSERT INTO kvk_staff (kvk_id, staff_name, mobile, date_of_birth, sanctioned_post_id, position_order, discipline_id, date_of_joining, category, transfer_status, transfer_count) 
           VALUES ($1, $2, '0000000000', '1980-01-01', $3, 1, $4, '2020-01-01', 'GENERAL', 'ACTIVE', 0)`,
                    [kvkId, n, spId, dId]
                );
                console.log('Inserted:', n);
            } else {
                console.log('Already exists:', n);
            }
        }
    } catch (e) {
        console.error('Error seeding:', e);
    } finally {
        await client.end();
    }
}

seed();
