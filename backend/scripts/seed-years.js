const prisma = require('../config/prisma');

const years = [
    '2020-21',
    '2021-22',
    '2022-23',
    '2023-24',
    '2024-25',
    '2025-26'
];

async function seedYears() {
    console.log('🌱 Seeding years...');
    for (const yearName of years) {
        await prisma.yearMaster.upsert({
            where: { yearName },
            update: {},
            create: { yearName },
        });
        console.log(`   ✅ Seeded year: ${yearName}`);
    }
}

seedYears()
    .then(() => {
        console.log('✨ Years seeded successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Error seeding years:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
