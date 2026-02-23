const prisma = require('../config/prisma.js');

async function fix() {
    try {
        // Check kvk table columns
        const kvkCols = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'kvk' AND table_schema = 'public'
            ORDER BY ordinal_position
            LIMIT 5
        `;
        console.log('KVK columns:', JSON.stringify(kvkCols));

        // Check if kvk_soil_water_equipment exists
        const exists = await prisma.$queryRaw`
            SELECT COUNT(*) as cnt 
            FROM information_schema.tables 
            WHERE table_name = 'kvk_soil_water_equipment' AND table_schema = 'public'
        `;
        console.log('kvk_soil_water_equipment exists:', JSON.stringify(exists));

        // Create kvk_soil_water_equipment WITHOUT FK constraint to avoid column name issues
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_soil_water_equipment (
                soil_water_equipment_id SERIAL PRIMARY KEY,
                "kvkId" INTEGER NOT NULL,
                reporting_year INTEGER NOT NULL,
                soil_water_analysis_id INTEGER NOT NULL REFERENCES soil_water_analysis(soil_water_analysis_id),
                equipment_name VARCHAR(500) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('✅ kvk_soil_water_equipment created');

        // Verify
        const count = await prisma.$queryRaw`SELECT COUNT(*) FROM kvk_soil_water_equipment`;
        console.log('Row count:', JSON.stringify(count));

    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
fix();
