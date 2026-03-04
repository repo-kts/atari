#!/usr/bin/env node
/**
 * Run ALL seeds including forms data for all KVKs.
 * This is a comprehensive seed that populates everything.
 * 
 * Usage: 
 *   node scripts/seed-all.js
 *   node scripts/seed-all.js <kvkId1> <kvkId2> ...  (seed forms for specific KVKs)
 *   KVK_IDS=1,2,3 node scripts/seed-all.js
 *   npm run seed:all
 */
require('dotenv').config();
const prisma = require('../config/prisma');
const { run: seedRoles } = require('./roles.js');
const { run: seedPermissions } = require('./permissions.js');
const { run: seedUsers } = require('./users.js');
const { run: seedData } = require('./seed-data.js');
const { run: seedMasters } = require('./seed-masters.js');
const { run: seedYears } = require('./seed-years.js');
const {
  seedInfrastructure,
  seedVehicles,
  seedEquipment,
  seedFarmImplements,
  seedStaff,
  seedBankAccounts,
  seedTrainings,
  seedExtensionActivities,
  seedOtherExtensionActivities,
  seedImportantDayCelebrations,
  seedFarmerAwards,
} = require('./seed-forms-data.js');

async function run() {
  console.log('\n🌱🌱🌱 COMPREHENSIVE SEED - ALL DATA 🌱🌱🌱\n');
  
  // Step 1: Core setup (roles, permissions, users)
  console.log('📋 Step 1/6: Core setup (roles, permissions, users)...\n');
  await seedRoles();
  await seedPermissions();
  await seedUsers();
  
  // Step 2: Basic master data (hierarchy, seasons, disciplines, etc.)
  console.log('\n📋 Step 2/6: Basic master data...\n');
  await seedData();
  
  // Step 3: Additional masters (staff, training, extension, products, etc.)
  console.log('\n📋 Step 3/6: Additional masters...\n');
  await seedMasters();
  
  // Step 4: Years
  console.log('\n📋 Step 4/6: Years...\n');
  await seedYears();
  
  // Step 5: Forms data (requires KVK IDs)
  console.log('\n📋 Step 5/6: Forms data...\n');
  
  // Get KVK IDs from command line, environment, or all existing KVKs
  let kvkIds = [];
  
  if (process.argv.length > 2) {
    kvkIds = process.argv.slice(2).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  } else if (process.env.KVK_IDS) {
    kvkIds = process.env.KVK_IDS.split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));
  } else {
    // Get all existing KVKs
    const allKvks = await prisma.kvk.findMany({
      select: { kvkId: true },
    });
    kvkIds = allKvks.map(k => k.kvkId);
    
    if (kvkIds.length === 0) {
      console.log('⚠️  No KVKs found. Creating a sample KVK...\n');
      
      // Create a sample KVK
      const zones = await prisma.zone.findMany({ take: 1 });
      const states = await prisma.stateMaster.findMany({ take: 1 });
      const districts = await prisma.districtMaster.findMany({ take: 1 });
      const orgs = await prisma.orgMaster.findMany({ take: 1 });
      
      if (zones.length > 0 && states.length > 0 && districts.length > 0 && orgs.length > 0) {
        const sampleKvk = await prisma.kvk.create({
          data: {
            kvkName: 'Sample KVK',
            zoneId: zones[0].zoneId,
            stateId: states[0].stateId,
            districtId: districts[0].districtId,
            orgId: orgs[0].orgId,
            hostOrg: 'Sample Host Organization',
            mobile: '9876543210',
            email: 'sample@kvk.gov.in',
            address: 'Sample Address',
            yearOfSanction: 2024,
          },
        });
        kvkIds = [sampleKvk.kvkId];
        console.log(`✅ Created sample KVK with ID: ${sampleKvk.kvkId}\n`);
      } else {
        console.log('⚠️  Cannot create sample KVK - missing required data. Skipping forms seed.\n');
      }
    }
  }
  
  if (kvkIds.length > 0) {
    // Verify all KVKs exist
    const existingKvks = await prisma.kvk.findMany({
      where: { kvkId: { in: kvkIds } },
      select: { kvkId: true, kvkName: true },
    });

    const existingIds = existingKvks.map(k => k.kvkId);
    const missingIds = kvkIds.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
      console.log(`⚠️  Warning: KVK IDs not found: ${missingIds.join(', ')}`);
      console.log(`   Proceeding with existing KVKs: ${existingIds.join(', ')}\n`);
    }

    if (existingIds.length > 0) {
      console.log(`   Seeding forms for KVK IDs: ${existingIds.join(', ')}\n`);
      
      // Seed all form types
      await seedInfrastructure(existingIds);
      await seedVehicles(existingIds);
      await seedEquipment(existingIds);
      await seedFarmImplements(existingIds);
      await seedStaff(existingIds);
      await seedBankAccounts(existingIds);
      await seedTrainings(existingIds);
      await seedExtensionActivities(existingIds);
      await seedOtherExtensionActivities(existingIds);
      await seedImportantDayCelebrations(existingIds);
      await seedFarmerAwards(existingIds);
      
      console.log('   ✅ All forms seeded successfully!\n');
    } else {
      console.log('⚠️  No valid KVKs found for forms seeding. Skipping...\n');
    }
  } else {
    console.log('⚠️  No KVKs available for forms seeding. Skipping...\n');
  }
  
  // Step 6: Summary
  console.log('\n📋 Step 6/6: Summary\n');
  const counts = {
    roles: await prisma.role.count(),
    users: await prisma.user.count(),
    zones: await prisma.zone.count(),
    states: await prisma.stateMaster.count(),
    districts: await prisma.districtMaster.count(),
    orgs: await prisma.orgMaster.count(),
    kvks: await prisma.kvk.count(),
    trainings: await prisma.trainingAchievement.count(),
    extensionActivities: await prisma.kvkExtensionActivity.count(),
    staff: await prisma.kvkStaff.count(),
    vehicles: await prisma.kvkVehicle.count(),
    equipment: await prisma.kvkEquipment.count(),
  };
  
  console.log('📊 Database Summary:');
  console.log(`   Roles: ${counts.roles}`);
  console.log(`   Users: ${counts.users}`);
  console.log(`   Zones: ${counts.zones}`);
  console.log(`   States: ${counts.states}`);
  console.log(`   Districts: ${counts.districts}`);
  console.log(`   Organizations: ${counts.orgs}`);
  console.log(`   KVKs: ${counts.kvks}`);
  console.log(`   Trainings: ${counts.trainings}`);
  console.log(`   Extension Activities: ${counts.extensionActivities}`);
  console.log(`   Staff: ${counts.staff}`);
  console.log(`   Vehicles: ${counts.vehicles}`);
  console.log(`   Equipment: ${counts.equipment}`);
  
  console.log('\n✅✅✅ COMPREHENSIVE SEED COMPLETED! ✅✅✅\n');
}

run()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    console.error(e.stack);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
