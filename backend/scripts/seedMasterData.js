/**
 * Seed script for Master Data
 * Adds sample zones, states, districts, and organizations for testing
 */

require('dotenv').config();
const prisma = require('../config/prisma');

async function seedMasterData() {
    console.log('🌱 Seeding master data...');

    try {
        // Create Zones
        console.log('Creating zones...');
        const northZone = await prisma.zone.upsert({
            where: { zoneName: 'North Zone' },
            update: {},
            create: { zoneName: 'North Zone' },
        });

        const southZone = await prisma.zone.upsert({
            where: { zoneName: 'South Zone' },
            update: {},
            create: { zoneName: 'South Zone' },
        });

        const eastZone = await prisma.zone.upsert({
            where: { zoneName: 'East Zone' },
            update: {},
            create: { zoneName: 'East Zone' },
        });

        const westZone = await prisma.zone.upsert({
            where: { zoneName: 'West Zone' },
            update: {},
            create: { zoneName: 'West Zone' },
        });

        console.log('✅ Zones created');

        // Create States
        console.log('Creating states...');
        const punjab = await prisma.stateMaster.upsert({
            where: { stateId: 1 },
            update: {},
            create: { stateName: 'Punjab', zoneId: northZone.zoneId },
        });

        const haryana = await prisma.stateMaster.upsert({
            where: { stateId: 2 },
            update: {},
            create: { stateName: 'Haryana', zoneId: northZone.zoneId },
        });

        const karnataka = await prisma.stateMaster.upsert({
            where: { stateId: 3 },
            update: {},
            create: { stateName: 'Karnataka', zoneId: southZone.zoneId },
        });

        const tamilNadu = await prisma.stateMaster.upsert({
            where: { stateId: 4 },
            update: {},
            create: { stateName: 'Tamil Nadu', zoneId: southZone.zoneId },
        });

        console.log('✅ States created');

        // Create Districts
        console.log('Creating districts...');
        const ludhianaDistrict = await prisma.districtMaster.upsert({
            where: { districtId: 1 },
            update: {},
            create: {
                districtName: 'Ludhiana',
                stateId: punjab.stateId,
                zoneId: northZone.zoneId,
            },
        });

        const amritsarDistrict = await prisma.districtMaster.upsert({
            where: { districtId: 2 },
            update: {},
            create: {
                districtName: 'Amritsar',
                stateId: punjab.stateId,
                zoneId: northZone.zoneId,
            },
        });

        const gurugramDistrict = await prisma.districtMaster.upsert({
            where: { districtId: 3 },
            update: {},
            create: {
                districtName: 'Gurugram',
                stateId: haryana.stateId,
                zoneId: northZone.zoneId,
            },
        });

        const bangaloreDistrict = await prisma.districtMaster.upsert({
            where: { districtId: 4 },
            update: {},
            create: {
                districtName: 'Bangalore Urban',
                stateId: karnataka.stateId,
                zoneId: southZone.zoneId,
            },
        });

        const chennaiDistrict = await prisma.districtMaster.upsert({
            where: { districtId: 5 },
            update: {},
            create: {
                districtName: 'Chennai',
                stateId: tamilNadu.stateId,
                zoneId: southZone.zoneId,
            },
        });

        console.log('✅ Districts created');

        // Create Organizations
        console.log('Creating organizations...');

        await prisma.orgMaster.upsert({
            where: { orgId: 1 },
            update: {},
            create: {
                orgName: 'Punjab Agricultural University',
                districtId: ludhianaDistrict.districtId,
            },
        });

        await prisma.orgMaster.upsert({
            where: { orgId: 2 },
            update: {},
            create: {
                orgName: 'CCS Haryana Agricultural University',
                districtId: gurugramDistrict.districtId,
            },
        });

        await prisma.orgMaster.upsert({
            where: { orgId: 3 },
            update: {},
            create: {
                orgName: 'University of Agricultural Sciences, Bangalore',
                districtId: bangaloreDistrict.districtId,
            },
        });

        await prisma.orgMaster.upsert({
            where: { orgId: 4 },
            update: {},
            create: {
                orgName: 'Tamil Nadu Agricultural University',
                districtId: chennaiDistrict.districtId,
            },
        });

        console.log('✅ Organizations created');

        console.log('🎉 Master data seeding completed successfully!');
        console.log('\nSummary:');
        console.log(`- Zones: 4`);
        console.log(`- States: 4`);
        console.log(`- Districts: 5`);
        console.log(`- Organizations: 4`);
    } catch (error) {
        console.error('❌ Error seeding master data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedMasterData()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
