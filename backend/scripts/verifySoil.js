const prisma = require('../config/prisma.js');

async function verify() {
    try {
        // Direct table check
        const tables = await prisma.$queryRaw`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('kvk_soil_water_equipment', 'soil_water_analysis')
        `;
        console.log('Tables:', tables.map(t => t.table_name));

        // Quick INSERT test
        const user = { kvkId: 1 };
        const analysis = await prisma.$queryRawUnsafe(
            `SELECT soil_water_analysis_id FROM soil_water_analysis WHERE analysis_name = $1 LIMIT 1`,
            'Soil Analysis'
        );
        console.log('Analysis lookup:', analysis.map(r => ({ id: Number(r.soil_water_analysis_id) })));

        if (tables.length === 2 && analysis.length > 0) {
            const analysisId = Number(analysis[0].soil_water_analysis_id);
            const ins = await prisma.$queryRawUnsafe(
                `INSERT INTO kvk_soil_water_equipment ("kvkId", reporting_year, soil_water_analysis_id, equipment_name, quantity)
                 VALUES ($1, $2, $3, $4, $5) RETURNING soil_water_equipment_id`,
                1, 2023, analysisId, 'Test', 1
            );
            const newId = Number(ins[0].soil_water_equipment_id);
            console.log('INSERT OK, id:', newId);

            await prisma.$queryRawUnsafe(`DELETE FROM kvk_soil_water_equipment WHERE soil_water_equipment_id = $1`, newId);
            console.log('DELETE OK');
            console.log('\n✅ EVERYTHING WORKS!');
        } else {
            console.log('❌ Tables missing or analysis types not seeded');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
verify();
