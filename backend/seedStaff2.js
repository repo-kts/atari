const prisma = require('./config/prisma.js');

async function run() {
    const names = [
        'Sri Akhilesh Kumar', 'Dr. Reeta Singh', 'Mr. Rajeev Kumar',
        'Dr. Prakash Chandra Gupta', 'Dr. Pushpam Patel', 'Smt. Sangeetha Kumari',
        'Sri Chandan Kumar', 'Sri Kanhaiya Kumar Rai', 'Sri Bachan Sah', 'Sri Mukesh Kumar'
    ];

    try {
        for (const n of names) {
            const exists = await prisma.$queryRawUnsafe(`SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1`, n);
            if (!exists || exists.length === 0) {
                const kRes = await prisma.$queryRawUnsafe(`SELECT kvk_id FROM kvk WHERE kvk_name ILIKE '%Gaya%' LIMIT 1`);
                const kvkId = (kRes && kRes.length) ? kRes[0].kvk_id : 1;

                const dRes = await prisma.$queryRawUnsafe(`SELECT discipline_id FROM "Discipline" LIMIT 1`);
                const dId = (dRes && dRes.length) ? dRes[0].discipline_id : 1;

                const spRes = await prisma.$queryRawUnsafe(`SELECT sanctioned_post_id FROM "SanctionedPost" LIMIT 1`);
                const spId = (spRes && spRes.length) ? spRes[0].sanctioned_post_id : 1;

                await prisma.$executeRawUnsafe(
                    `INSERT INTO kvk_staff (kvk_id, staff_name, mobile, date_of_birth, sanctioned_post_id, position_order, discipline_id, date_of_joining, category, transfer_status) 
           VALUES ($1, $2, '0000000000', '1980-01-01', $3, 1, $4, '2020-01-01', 'GENERAL', 'ACTIVE')`,
                    kvkId, n, spId, dId
                );
                console.log('Inserted:', n);
            } else {
                console.log('Already exists:', n);
            }
        }
    } catch (e) {
        console.error("DB Error: ", e);
    }
}

run().finally(() => prisma.$disconnect());
