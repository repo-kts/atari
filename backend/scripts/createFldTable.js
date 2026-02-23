/**
 * Migration: Create kvk_fld_introduction table
 * Based on fld_schema.prisma
 * Depends on: kvk, kvk_staff, season, fld_sector, fld_thematic_area, fld_category, fld_subcategory, fld_crop
 */
const prisma = require('../config/prisma');

async function migrate() {
    console.log('🔧 Creating kvk_fld_introduction table...');
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS kvk_fld_introduction (
                kvk_fld_id              SERIAL PRIMARY KEY,
                "kvkId"                 INTEGER NOT NULL REFERENCES kvk(kvk_id),
                "kvkStaffId"            INTEGER NOT NULL REFERENCES kvk_staff(kvk_staff_id),
                "seasonId"              INTEGER NOT NULL REFERENCES season(season_id),
                "sectorId"              INTEGER NOT NULL REFERENCES fld_sector(fld_sector_id),
                "thematicAreaId"        INTEGER NOT NULL REFERENCES fld_thematic_area(fld_thematic_area_id),
                "categoryId"            INTEGER NOT NULL REFERENCES fld_category(fld_category_id),
                "subCategoryId"         INTEGER NOT NULL REFERENCES fld_subcategory(fld_subcategory_id),
                "cropId"                INTEGER NOT NULL REFERENCES fld_crop(fld_crop_id),
                fld_name                TEXT NOT NULL DEFAULT '',
                no_of_demonstration     INTEGER NOT NULL DEFAULT 0,
                area_ha                 FLOAT NOT NULL DEFAULT 0,
                start_date              TIMESTAMP NOT NULL,
                general_m               INTEGER NOT NULL DEFAULT 0,
                general_f               INTEGER NOT NULL DEFAULT 0,
                obc_m                   INTEGER NOT NULL DEFAULT 0,
                obc_f                   INTEGER NOT NULL DEFAULT 0,
                sc_m                    INTEGER NOT NULL DEFAULT 0,
                sc_f                    INTEGER NOT NULL DEFAULT 0,
                st_m                    INTEGER NOT NULL DEFAULT 0,
                st_f                    INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('✅ Table kvk_fld_introduction created (or already exists)');

        // Indexes
        const idxs = [
            `CREATE INDEX IF NOT EXISTS idx_fld_kvk_id         ON kvk_fld_introduction ("kvkId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_staff_id        ON kvk_fld_introduction ("kvkStaffId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_season_id       ON kvk_fld_introduction ("seasonId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_sector_id       ON kvk_fld_introduction ("sectorId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_thematic_id     ON kvk_fld_introduction ("thematicAreaId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_category_id     ON kvk_fld_introduction ("categoryId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_subcategory_id  ON kvk_fld_introduction ("subCategoryId");`,
            `CREATE INDEX IF NOT EXISTS idx_fld_crop_id         ON kvk_fld_introduction ("cropId");`,
        ];
        for (const sql of idxs) await prisma.$executeRawUnsafe(sql);
        console.log('✅ Indexes created');

        const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM kvk_fld_introduction;`);
        console.log(`📋 Table ready — rows: ${rows[0].count}`);
        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
