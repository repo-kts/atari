require('dotenv').config();
const prisma = require('../config/prisma');

/**
 * Seed hierarchy data (Zone, States, Districts, Organizations)
 * Based on ATARI Zone IV - Patna coverage
 */
async function seedHierarchy() {
  console.log('🌱 Starting hierarchy seeding...\n');

  try {
    // 1. Create Zone
    console.log('📍 Seeding Zones...');
    const zone = await prisma.zone.upsert({
      where: { zoneName: 'Zone IV - Patna' },
      update: {},
      create: {
        zoneName: 'Zone IV - Patna',
      },
    });
    console.log(`✅ Zone: ${zone.zoneName} (ID: ${zone.zoneId})\n`);

    // 2. Create States under Zone IV
    console.log('🗺️  Seeding States...');
    const statesData = [
      { stateName: 'Bihar', zoneId: zone.zoneId },
      { stateName: 'Jharkhand', zoneId: zone.zoneId },
      { stateName: 'Andaman & Nicobar Islands', zoneId: zone.zoneId },
      { stateName: 'Odisha', zoneId: zone.zoneId },
      { stateName: 'West Bengal', zoneId: zone.zoneId },
    ];

    const states = [];
    for (const stateData of statesData) {
      const state = await prisma.stateMaster.upsert({
        where: { 
          stateId: await findStateByName(stateData.stateName) || 0 
        },
        update: {},
        create: stateData,
      });
      states.push(state);
      console.log(`  ✅ ${state.stateName} (ID: ${state.stateId})`);
    }
    console.log();

    // 3. Create Districts
    console.log('🏘️  Seeding Districts...');
    const districtData = [
      // Bihar districts
      { districtName: 'Patna', stateId: states[0].stateId, zoneId: zone.zoneId },
      { districtName: 'Gaya', stateId: states[0].stateId, zoneId: zone.zoneId },
      { districtName: 'Muzaffarpur', stateId: states[0].stateId, zoneId: zone.zoneId },
      { districtName: 'Bhagalpur', stateId: states[0].stateId, zoneId: zone.zoneId },
      { districtName: 'Nalanda', stateId: states[0].stateId, zoneId: zone.zoneId },
      
      // Jharkhand districts
      { districtName: 'Ranchi', stateId: states[1].stateId, zoneId: zone.zoneId },
      { districtName: 'Jamshedpur', stateId: states[1].stateId, zoneId: zone.zoneId },
      { districtName: 'Dhanbad', stateId: states[1].stateId, zoneId: zone.zoneId },
      
      // Andaman & Nicobar districts
      { districtName: 'South Andaman', stateId: states[2].stateId, zoneId: zone.zoneId },
      { districtName: 'North and Middle Andaman', stateId: states[2].stateId, zoneId: zone.zoneId },
      
      // Odisha districts
      { districtName: 'Bhubaneswar', stateId: states[3].stateId, zoneId: zone.zoneId },
      { districtName: 'Cuttack', stateId: states[3].stateId, zoneId: zone.zoneId },
      
      // West Bengal districts
      { districtName: 'Kolkata', stateId: states[4].stateId, zoneId: zone.zoneId },
      { districtName: 'Howrah', stateId: states[4].stateId, zoneId: zone.zoneId },
    ];

    for (const district of districtData) {
      const created = await prisma.districtMaster.upsert({
        where: {
          districtId: await findDistrictByName(district.districtName) || 0,
        },
        update: {},
        create: district,
      });
      console.log(`  ✅ ${created.districtName} (ID: ${created.districtId})`);
    }
    console.log();

    // 4. Create Organizations (Universities/Agricultural Institutions)
    console.log('🏛️  Seeding Organizations...');
    const orgsData = [
      // Bihar
      { uniName: 'Rajendra Agricultural University, Pusa', stateId: states[0].stateId },
      { uniName: 'Bihar Agricultural University, Sabour', stateId: states[0].stateId },
      { uniName: 'Dr. Rajendra Prasad Central Agricultural University, Pusa', stateId: states[0].stateId },
      
      // Jharkhand
      { uniName: 'Birsa Agricultural University, Ranchi', stateId: states[1].stateId },
      
      // Andaman & Nicobar
      { uniName: 'Central Agricultural Research Institute, Port Blair', stateId: states[2].stateId },
      
      // Odisha
      { uniName: 'Odisha University of Agriculture and Technology, Bhubaneswar', stateId: states[3].stateId },
      
      // West Bengal
      { uniName: 'Bidhan Chandra Krishi Viswavidyalaya, Nadia', stateId: states[4].stateId },
      { uniName: 'Uttar Banga Krishi Viswavidyalaya, Cooch Behar', stateId: states[4].stateId },
    ];

    for (const org of orgsData) {
      const created = await prisma.orgMaster.upsert({
        where: {
          orgId: await findOrgByName(org.uniName) || 0,
        },
        update: {},
        create: org,
      });
      console.log(`  ✅ ${created.uniName} (ID: ${created.orgId})`);
    }
    console.log();

    console.log('✨ Hierarchy seeding completed successfully!\n');

    // Display summary
    const zoneCounts = await prisma.zone.count();
    const stateCounts = await prisma.stateMaster.count();
    const districtCounts = await prisma.districtMaster.count();
    const orgCounts = await prisma.orgMaster.count();

    console.log('📊 Summary:');
    console.log('─'.repeat(60));
    console.log(`  Zones: ${zoneCounts}`);
    console.log(`  States: ${stateCounts}`);
    console.log(`  Districts: ${districtCounts}`);
    console.log(`  Organizations: ${orgCounts}`);
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding hierarchy:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions to find existing records
async function findStateByName(stateName) {
  const state = await prisma.stateMaster.findFirst({
    where: { stateName },
  });
  return state?.stateId;
}

async function findDistrictByName(districtName) {
  const district = await prisma.districtMaster.findFirst({
    where: { districtName },
  });
  return district?.districtId;
}

async function findOrgByName(uniName) {
  const org = await prisma.orgMaster.findFirst({
    where: { uniName },
  });
  return org?.orgId;
}

// Run the seed function
seedHierarchy()
  .then(() => {
    console.log('\n🎉 Seed script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
