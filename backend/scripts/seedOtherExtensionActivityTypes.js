const prisma = require('../config/prisma');

async function seed() {
    console.log('🌱 Seeding Other Extension Activity Types...');
    try {
        const activityTypes = [
            'Newspaper Coverage',
            'Radio Talks',
            'TV Talks',
            'Popular Articles Published',
            'Extension Literature',
            'Electronic Media',
            'Any Other',
        ];

        for (const name of activityTypes) {
            // Use raw SQL upsert so it works regardless of Prisma client state
            await prisma.$executeRawUnsafe(`
                INSERT INTO other_extension_activity_type (activity_name)
                VALUES ($1)
                ON CONFLICT (activity_name) DO NOTHING;
            `, name);
            console.log(`  ✅ "${name}" seeded`);
        }

        // Verify what was inserted
        const rows = await prisma.$queryRawUnsafe(
            `SELECT activity_type_id, activity_name FROM other_extension_activity_type ORDER BY activity_type_id;`
        );
        console.log('\n📋 Current Other Extension Activity Types in DB:');
        rows.forEach(r => console.log(`  [${r.activity_type_id}] ${r.activity_name}`));

        console.log('\n✅ All Other Extension Activity Types seeded successfully!');
    } catch (err) {
        console.error('❌ Error seeding other extension activity types:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
