const prisma = require('../config/prisma.js');

async function main() {
    try {
        console.log('Creating table kvk_world_soil_celebration...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_world_soil_celebration (
                world_soil_celebration_id SERIAL PRIMARY KEY,
                "kvkId" INTEGER NOT NULL REFERENCES kvk(kvk_id),
                activities_conducted INTEGER DEFAULT 0,
                soil_health_card_distributed INTEGER DEFAULT 0,
                vip_names TEXT,
                participants INTEGER DEFAULT 0,
                general_m INTEGER DEFAULT 0,
                general_f INTEGER DEFAULT 0,
                obc_m INTEGER DEFAULT 0,
                obc_f INTEGER DEFAULT 0,
                sc_m INTEGER DEFAULT 0,
                sc_f INTEGER DEFAULT 0,
                st_m INTEGER DEFAULT 0,
                st_f INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table kvk_world_soil_celebration created successfully.');

        // Also add an index for kvkId if it doesn't exist
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_world_soil_kvk ON kvk_world_soil_celebration("kvkId");
        `);

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
