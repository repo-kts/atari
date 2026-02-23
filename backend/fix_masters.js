const prisma = require('./config/prisma.js');

async function ensureMasters() {
    console.log("Ensuring master data for OFT...");

    try {
        // 1. Ensure KVK exists
        let kvk = await prisma.kvk.findFirst();
        if (!kvk) {
            console.log("Creating default KVK...");
            await prisma.$queryRawUnsafe(`
                INSERT INTO kvk (kvk_name, kvk_code, zone_id, state_id, district_id)
                VALUES ('Default KVK', 'DKVK001', 1, 1, 1)
            `);
            kvk = await prisma.kvk.findFirst();
        }
        const kvkId = kvk.kvkId;

        // 2. Ensure Season exists
        let season = await prisma.season.findFirst();
        if (!season) {
            console.log("Creating default Season...");
            await prisma.$queryRawUnsafe(`INSERT INTO season (season_name) VALUES ('Kharif')`);
            await prisma.$queryRawUnsafe(`INSERT INTO season (season_name) VALUES ('Rabi')`);
            await prisma.$queryRawUnsafe(`INSERT INTO season (season_name) VALUES ('Summer')`);
        }

        // 3. Ensure Discipline exists
        let discipline = await prisma.discipline.findFirst();
        if (!discipline) {
            console.log("Creating default Discipline...");
            await prisma.$queryRawUnsafe(`INSERT INTO discipline (discipline_name) VALUES ('Agronomy')`);
        }

        // 4. Ensure Sanctioned Post exists
        let post = await prisma.sanctionedPost.findFirst();
        if (!post) {
            console.log("Creating default Sanctioned Post...");
            await prisma.$queryRawUnsafe(`INSERT INTO sanctioned_post (post_name, post_code) VALUES ('Senior Scientist', 'SS001')`);
        }

        // 5. Ensure OFT Subject exists
        let subject = await prisma.oftSubject.findFirst();
        if (!subject) {
            console.log("Creating default OFT Subject...");
            await prisma.$queryRawUnsafe(`INSERT INTO oft_subject (oft_subject_name) VALUES ('Others')`);
            subject = await prisma.oftSubject.findFirst();
        }

        // 6. Ensure OFT Thematic Area exists
        let ta = await prisma.oftThematicArea.findFirst();
        if (!ta && subject) {
            console.log("Creating default OFT Thematic Area...");
            await prisma.$queryRawUnsafe(`
                INSERT INTO oft_thematic_area (oft_thematic_area_name, oft_subject_id)
                VALUES ('General', $1)
            `, subject.oftSubjectId);
        }

        console.log("Master data ensured successfully.");
    } catch (e) {
        console.error("Master data ensuring failed:", e);
    } finally {
        process.exit(0);
    }
}

ensureMasters();
