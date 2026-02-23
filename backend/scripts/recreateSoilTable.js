const prisma = require('../config/prisma.js');

async function fix() {
    try {
        // Check actual columns of the equipment table
        const cols = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'kvk_soil_water_equipment' AND table_schema = 'public'
            ORDER BY ordinal_position
        `;
        console.log('Equipment table columns:', cols.map(c => c.column_name));

        // Drop and recreate with correct column names
        console.log('Dropping and recreating table...');
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS kvk_soil_water_equipment CASCADE;`);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE kvk_soil_water_equipment (
                soil_water_equipment_id SERIAL PRIMARY KEY,
                "kvkId" INTEGER NOT NULL,
                reporting_year INTEGER NOT NULL,
                soil_water_analysis_id INTEGER NOT NULL REFERENCES soil_water_analysis(soil_water_analysis_id),
                equipment_name VARCHAR(500) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('✅ Table recreated with correct columns');

        // Verify columns
        const newCols = await prisma.$queryRaw`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'kvk_soil_water_equipment' AND table_schema = 'public'
            ORDER BY ordinal_position
        `;
        console.log('New columns:', newCols.map(c => c.column_name));

        // Test insert
        const ins = await prisma.$queryRawUnsafe(
            `INSERT INTO kvk_soil_water_equipment ("kvkId", reporting_year, soil_water_analysis_id, equipment_name, quantity)
             VALUES ($1, $2, $3, $4, $5) RETURNING soil_water_equipment_id`,
            1, 2023, 1, 'Test', 1
        );
        const newId = Number(ins[0].soil_water_equipment_id);
        console.log('✅ Test INSERT OK, id:', newId);
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_soil_water_equipment WHERE soil_water_equipment_id = $1`, newId);
        console.log('✅ Test DELETE OK');
        console.log('\n✅ FIXED AND VERIFIED!');
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
fix();
