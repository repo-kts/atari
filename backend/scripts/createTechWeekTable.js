/**
 * Migration: Create kvk_technology_week_celebration table
 * Based on tech_week_celebration_schema.prisma
 */

const prisma = require('../config/prisma');

async function migrate() {
    console.log('🔧 Creating kvk_technology_week_celebration table...');
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_technology_week_celebration (
                tech_week_id              SERIAL PRIMARY KEY,
                "kvkId"                   INTEGER NOT NULL REFERENCES kvk(kvk_id),
                start_date                TIMESTAMP NOT NULL,
                end_date                  TIMESTAMP NOT NULL,
                type_of_activities        TEXT NOT NULL DEFAULT '',
                number_of_activities      INTEGER NOT NULL DEFAULT 0,
                related_crop_livestock_technology TEXT NOT NULL DEFAULT 'n/a',
                farmers_general_m         INTEGER NOT NULL DEFAULT 0,
                farmers_general_f         INTEGER NOT NULL DEFAULT 0,
                farmers_obc_m             INTEGER NOT NULL DEFAULT 0,
                farmers_obc_f             INTEGER NOT NULL DEFAULT 0,
                farmers_sc_m              INTEGER NOT NULL DEFAULT 0,
                farmers_sc_f              INTEGER NOT NULL DEFAULT 0,
                farmers_st_m              INTEGER NOT NULL DEFAULT 0,
                farmers_st_f              INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('✅ Table kvk_technology_week_celebration created (or already exists)');

        // Create indexes
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_tech_week_kvk_id   ON kvk_technology_week_celebration ("kvkId");
        `);
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_tech_week_start_date ON kvk_technology_week_celebration (start_date);
        `);
        console.log('✅ Indexes created');

        // Verify
        const rows = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM kvk_technology_week_celebration;`
        );
        console.log(`\n📋 Table ready — current row count: ${rows[0].count}`);
        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
