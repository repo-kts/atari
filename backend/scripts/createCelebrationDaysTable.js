/**
 * Migration: Create important_day and kvk_important_day_celebration tables
 * Based on imp_days_celebration_schema.prisma
 */

const prisma = require('../config/prisma');

async function migrate() {
    console.log('🔧 Creating important_day table...');
    try {
        // 1. Create the important_day lookup table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS important_day (
                important_day_id SERIAL PRIMARY KEY,
                day_name         TEXT NOT NULL UNIQUE
            );
        `);
        console.log('✅ Table important_day created (or already exists)');

        // Seed the important days from the form dropdown
        const days = [
            'World Soil Day',
            "International Women's Day",
            'World Environment Day',
            'Kisan Diwas',
            'Parthenium Awareness Week',
            'Others',
        ];
        for (const name of days) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO important_day (day_name) VALUES ($1)
                ON CONFLICT (day_name) DO NOTHING;
            `, name);
        }
        console.log('✅ important_day seeded with', days.length, 'entries');

        // 2. Create the main table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_important_day_celebration (
                celebration_id           SERIAL PRIMARY KEY,
                "kvkId"                  INTEGER NOT NULL REFERENCES kvk(kvk_id),
                event_date               TIMESTAMP NOT NULL,
                "importantDayId"         INTEGER NOT NULL REFERENCES important_day(important_day_id),
                number_of_activities     INTEGER NOT NULL DEFAULT 0,
                farmers_general_m        INTEGER NOT NULL DEFAULT 0,
                farmers_general_f        INTEGER NOT NULL DEFAULT 0,
                farmers_obc_m            INTEGER NOT NULL DEFAULT 0,
                farmers_obc_f            INTEGER NOT NULL DEFAULT 0,
                farmers_sc_m             INTEGER NOT NULL DEFAULT 0,
                farmers_sc_f             INTEGER NOT NULL DEFAULT 0,
                farmers_st_m             INTEGER NOT NULL DEFAULT 0,
                farmers_st_f             INTEGER NOT NULL DEFAULT 0,
                officials_general_m      INTEGER NOT NULL DEFAULT 0,
                officials_general_f      INTEGER NOT NULL DEFAULT 0,
                officials_obc_m          INTEGER NOT NULL DEFAULT 0,
                officials_obc_f          INTEGER NOT NULL DEFAULT 0,
                officials_sc_m           INTEGER NOT NULL DEFAULT 0,
                officials_sc_f           INTEGER NOT NULL DEFAULT 0,
                officials_st_m           INTEGER NOT NULL DEFAULT 0,
                officials_st_f           INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('✅ Table kvk_important_day_celebration created (or already exists)');

        // 3. Indexes
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_cel_kvk_id        ON kvk_important_day_celebration ("kvkId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_cel_imp_day_id    ON kvk_important_day_celebration ("importantDayId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_cel_event_date    ON kvk_important_day_celebration (event_date);`);
        console.log('✅ Indexes created');

        const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM kvk_important_day_celebration;`);
        console.log(`📋 kvk_important_day_celebration ready — rows: ${rows[0].count}`);
        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
