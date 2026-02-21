const prisma = require('../config/prisma');

async function seed() {
    console.log('🌱 Seeding Extension Masters...');
    try {
        // Ensure a KVK exists (needed for staff)
        let kvk = await prisma.kvk.findFirst();
        if (!kvk) {
            console.log('Creating a default KVK...');
            kvk = await prisma.kvk.create({
                data: {
                    kvkName: 'Default KVK',
                    zoneId: 1, // Assume zone 1 exists from previous seed
                    stateId: 1,
                    districtId: 1,
                    orgId: 1,
                    mobile: '0000000000',
                    email: 'default@kvk.com',
                }
            });
        }

        // Ensure SanctionedPost and Discipline exist
        let post = await prisma.sanctionedPost.findFirst();
        if (!post) {
            post = await prisma.sanctionedPost.create({ data: { postName: 'SMS' } });
        }
        let discipline = await prisma.discipline.findFirst();
        if (!discipline) {
            discipline = await prisma.discipline.create({ data: { disciplineName: 'Agronomy' } });
        }

        // Seed Staff
        const staffNames = ['Dr. Sharma', 'Dr. Patel', 'Mr. Kumar'];
        for (const name of staffNames) {
            await prisma.kvkStaff.upsert({
                where: { kvkStaffId: staffNames.indexOf(name) + 1 }, // This might clash but it's a seed
                update: {},
                create: {
                    kvkStaffId: staffNames.indexOf(name) + 1,
                    staffName: name,
                    kvkId: kvk.kvkId,
                    mobile: '0000000000',
                    dateOfBirth: new Date('1980-01-01'),
                    dateOfJoining: new Date('2010-01-01'),
                    sanctionedPostId: post.sanctionedPostId,
                    disciplineId: discipline.disciplineId,
                    category: 'GENERAL',
                    positionOrder: 1,
                }
            });
        }
        console.log('✅ Staff seeded');

        // Seed Activities (FldActivity)
        const activityNames = [
            'Advisory Services', 'Diagnostic visits', 'Field Day', 'Group meetings',
            'Kisan Ghosthi', 'Kisan Mela', 'Exhibition', 'Film Show',
            'Method Demonstrations', 'Farmers Seminar', 'Workshop'
        ];
        for (const name of activityNames) {
            await prisma.fldActivity.upsert({
                where: { activityName: name },
                update: {},
                create: { activityName: name }
            });
        }
        console.log('✅ Activities seeded');

        // Seed ExtensionActivity (SuperAdmin master) - for good measure
        for (const name of activityNames) {
            await prisma.extensionActivity.upsert({
                where: { extensionName: name },
                update: {},
                create: { extensionName: name }
            });
        }
        console.log('✅ SuperAdmin Activities seeded');

        // Ensure a KvkFldIntroduction exists (required for FK in KvkExtensionActivity)
        let fld = await prisma.kvkFldIntroduction.findFirst();
        if (!fld) {
            fld = await prisma.kvkFldIntroduction.create({
                data: {
                    kvkId: kvk.kvkId,
                    reportingYear: 2024,
                    cropId: 1,
                    seasonId: 1,
                }
            });
        }
        console.log('✅ FLD Introduction ensured');

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
