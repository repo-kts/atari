const prisma = require('../config/prisma.js');

async function check() {
    try {
        const db = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
        console.log('DB/Schema:', JSON.stringify(db));

        const tables = await prisma.$queryRaw`
            SELECT table_name, table_schema 
            FROM information_schema.tables 
            WHERE table_name LIKE 'kvk%' OR table_name LIKE 'soil%'
            ORDER BY table_name
        `;
        console.log('Relevant tables:', JSON.stringify(tables));
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
check();
