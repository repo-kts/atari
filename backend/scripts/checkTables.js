const prisma = require('../config/prisma.js');
async function check() {
    try {
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('kvk_soil_water_equipment', 'soil_water_analysis') ORDER BY table_name`;
        console.log('Tables found:', JSON.stringify(tables));
        if (tables.length === 0) {
            console.log('NEITHER TABLE EXISTS - need to run migration');
        } else if (tables.length === 1) {
            console.log('Only one table exists:', tables[0].table_name);
        } else {
            console.log('Both tables exist!');
        }
        // Try a test query
        const rows = await prisma.$queryRaw`SELECT COUNT(*) as cnt FROM kvk_soil_water_equipment`;
        console.log('Equipment rows:', JSON.stringify(rows));
    } catch (e) {
        console.error('Error:', e.message);
        console.error('Code:', e.code);
    }
    await prisma.$disconnect();
}
check();
