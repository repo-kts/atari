require('dotenv').config();
const prisma = require('../config/prisma');

async function main() {
    console.log('Seeding CFLD Masters...');

    // Seed Seasons
    const seasons = ['Rabi', 'Kharif', 'Summer'];
    for (const seasonName of seasons) {
        await prisma.season.upsert({
            where: { seasonName },
            update: {},
            create: { seasonName },
        });
        console.log(`Seeded season: ${seasonName}`);
    }

    // Seed CropTypes
    const cropTypes = ['Pulses', 'Oilseed'];
    for (const typeName of cropTypes) {
        await prisma.cropType.upsert({
            where: { typeName },
            update: {},
            create: { typeName },
        });
        console.log(`Seeded crop type: ${typeName}`);
    }

    console.log('CFLD Masters seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
