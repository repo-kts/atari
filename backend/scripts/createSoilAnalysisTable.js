const prisma = require('../config/prisma.js');

async function createTable() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_soil_water_analysis (
                soil_water_analysis_id SERIAL PRIMARY KEY,
                "kvkId" INTEGER NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                analysis_id INTEGER NOT NULL REFERENCES soil_water_analysis(soil_water_analysis_id),
                samples_analysed_through VARCHAR(255) NOT NULL DEFAULT '',
                samples_analysed INTEGER NOT NULL DEFAULT 0,
                number_of_villages INTEGER NOT NULL DEFAULT 0,
                amount_realized INTEGER NOT NULL DEFAULT 0,
                general_m INTEGER NOT NULL DEFAULT 0,
                general_f INTEGER NOT NULL DEFAULT 0,
                obc_m INTEGER NOT NULL DEFAULT 0,
                obc_f INTEGER NOT NULL DEFAULT 0,
                sc_m INTEGER NOT NULL DEFAULT 0,
                sc_f INTEGER NOT NULL DEFAULT 0,
                st_m INTEGER NOT NULL DEFAULT 0,
                st_f INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('✅ kvk_soil_water_analysis table created');
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
createTable();
