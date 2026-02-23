const prisma = require('../config/prisma.js');

async function createTables() {
    console.log('Creating soil water testing tables...');

    try {
        // Create soil_water_analysis table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS soil_water_analysis (
                soil_water_analysis_id SERIAL PRIMARY KEY,
                analysis_name VARCHAR(255) NOT NULL UNIQUE
            );
        `);
        console.log('✅ soil_water_analysis table created');

        // Create kvk_soil_water_equipment table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_soil_water_equipment (
                soil_water_equipment_id SERIAL PRIMARY KEY,
                "kvkId" INTEGER NOT NULL,
                reporting_year INTEGER NOT NULL,
                soil_water_analysis_id INTEGER NOT NULL,
                equipment_name VARCHAR(500) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                CONSTRAINT fk_kwse_kvk FOREIGN KEY ("kvkId") REFERENCES kvk(kvk_id) ON DELETE CASCADE,
                CONSTRAINT fk_kwse_analysis FOREIGN KEY (soil_water_analysis_id) REFERENCES soil_water_analysis(soil_water_analysis_id) ON DELETE RESTRICT
            );
        `);
        console.log('✅ kvk_soil_water_equipment table created');

        // Seed default analysis types
        await prisma.$executeRawUnsafe(`
            INSERT INTO soil_water_analysis (analysis_name) VALUES
                ('Soil Analysis'),
                ('Water Analysis'),
                ('Plant Analysis'),
                ('Manure Analysis'),
                ('Other Analysis')
            ON CONFLICT (analysis_name) DO NOTHING;
        `);
        console.log('✅ Default analysis types seeded');

        console.log('\n✅ ALL DONE — tables ready!');
    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTables();
