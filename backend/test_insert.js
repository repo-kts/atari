const prisma = require('./config/prisma.js');
async function f() {
    try {
        const inserted = await prisma.$queryRawUnsafe(`
        INSERT INTO kvk_staff 
        ("kvkId", staff_name, mobile, date_of_birth, "sanctionedPostId", position_order, "disciplineId", date_of_joining, transfer_status, transfer_count)
        VALUES ($1, $2, '0000000000', '1980-01-01', $3, 1, $4, '2020-01-01', 'ACTIVE', 0)
        RETURNING kvk_staff_id;
    `, 2, 'Test6', 1, 1);
        console.log("Success:", inserted);
    } catch (e) {
        if (e.cause) console.log("CAUSE:", JSON.stringify(e.cause));
        console.log("MSG:", e.message);
    }
}
f().then(() => process.exit(0));
