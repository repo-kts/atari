#!/usr/bin/env node
/**
 * Seed form data for KVK: infrastructure, vehicles, equipment, and farm implementation forms.
 * 
 * Usage:
 *   node scripts/seed-forms-data.js <kvkId1> <kvkId2> ...
 *   or
 *   KVK_IDS=1,2,3 node scripts/seed-forms-data.js
 * 
 * Run: node scripts/seed-forms-data.js <kvkId>   or   npm run seed:forms
 */
require('dotenv').config();
const prisma = require('../config/prisma');

// Sample data generators
const generateInfrastructureData = (kvkId, infraMasterId) => ({
  kvkId,
  infraMasterId,
  notYetStarted: false,
  completedPlinthLevel: true,
  completedLintelLevel: true,
  completedRoofLevel: true,
  totallyCompleted: true,
  plinthAreaSqM: Math.floor(Math.random() * 500) + 100, // 100-600 sqm
  underUse: true,
  sourceOfFunding: ['ICAR', 'State Government', 'Central Government', 'KVK Funds'][Math.floor(Math.random() * 4)],
});

const generateVehicleData = (kvkId, index) => {
  const vehicleTypes = ['Tractor', 'Car', 'Jeep', 'Motorcycle', 'Van', 'Pickup Truck'];
  const vehicleType = vehicleTypes[index % vehicleTypes.length];
  const year = 2020 + (index % 5); // Years between 2020-2024

  return {
    kvkId,
    vehicleName: `${vehicleType} ${year}`,
    registrationNo: `BR${Math.floor(Math.random() * 100)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10000)}`,
    yearOfPurchase: year,
    totalCost: Math.floor(Math.random() * 500000) + 200000, // 200k-700k
    totalRun: `${Math.floor(Math.random() * 50000) + 10000} km`,
    presentStatus: ['WORKING', 'GOOD_CONDITION', 'NEW'][Math.floor(Math.random() * 3)],
    reportingYear: new Date('2024-01-01'),
    sourceOfFunding: ['ICAR', 'State Government', 'KVK Funds'][Math.floor(Math.random() * 3)],
    repairingCost: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 5000 : null,
  };
};

const generateEquipmentData = (kvkId, index) => {
  const equipmentTypes = [
    'Computer System', 'Printer', 'Projector', 'Soil Testing Kit', 'Moisture Meter',
    'pH Meter', 'Microscope', 'Weighing Scale', 'Generator', 'Water Pump'
  ];
  const equipmentName = equipmentTypes[index % equipmentTypes.length];
  const year = 2020 + (index % 5);

  return {
    kvkId,
    equipmentName,
    yearOfPurchase: year,
    totalCost: Math.floor(Math.random() * 200000) + 10000, // 10k-210k
    presentStatus: ['WORKING', 'NOT_WORKING', 'CONDEMED', 'AUCTION'][Math.floor(Math.random() * 4)],
    sourceOfFunding: ['ICAR', 'State Government', 'KVK Funds', 'Donation'][Math.floor(Math.random() * 4)],
    reportingYear: new Date('2024-01-01'),
    type: 'EQUIPMENT',
  };
};

const generateFarmImplementData = (kvkId, index) => {
  const implementTypes = [
    'Plough', 'Harrow', 'Cultivator', 'Seed Drill', 'Rotavator',
    'Thresher', 'Harvester', 'Sprayer', 'Weeder', 'Ridger'
  ];
  const implementName = implementTypes[index % implementTypes.length];
  const year = 2020 + (index % 5);

  return {
    kvkId,
    implementName,
    yearOfPurchase: year,
    totalCost: Math.floor(Math.random() * 300000) + 50000, // 50k-350k
    presentStatus: ['WORKING', 'GOOD_CONDITION', 'NEW', 'REPAIRABLE', 'NOT_WORKING'][Math.floor(Math.random() * 5)],
    sourceOfFund: ['ICAR', 'State Government', 'KVK Funds', 'Central Government'][Math.floor(Math.random() * 4)],
  };
};

/**
 * Seed infrastructure data for given KVK IDs
 */
async function seedInfrastructure(kvkIds) {
  console.log('🌱 Seeding infrastructure data...');

  // Get available infrastructure masters
  const infraMasters = await prisma.kvkInfrastructureMaster.findMany({
    orderBy: { infraMasterId: 'asc' },
  });

  if (infraMasters.length === 0) {
    console.log('   ⚠️  No infrastructure masters found. Run scripts/seed-data.js first.\n');
    return;
  }

  let totalCreated = 0;
  for (const kvkId of kvkIds) {
    // Verify KVK exists
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) {
      console.log(`   ⚠️  KVK with ID ${kvkId} not found, skipping...`);
      continue;
    }

    // Seed 3-5 infrastructure items per KVK
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 items
    const selectedMasters = infraMasters.slice(0, Math.min(count, infraMasters.length));

    for (const master of selectedMasters) {
      // Check if already exists
      const existing = await prisma.kvkInfrastructure.findFirst({
        where: { kvkId, infraMasterId: master.infraMasterId },
      });

      if (!existing) {
        await prisma.kvkInfrastructure.create({
          data: generateInfrastructureData(kvkId, master.infraMasterId),
        });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${selectedMasters.length} infrastructure items`);
  }
  console.log(`   ✅ Total: ${totalCreated} infrastructure items created\n`);
}

/**
 * Seed vehicles data for given KVK IDs
 */
async function seedVehicles(kvkIds) {
  console.log('🌱 Seeding vehicles data...');

  let totalCreated = 0;
  for (const kvkId of kvkIds) {
    // Verify KVK exists
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) {
      console.log(`   ⚠️  KVK with ID ${kvkId} not found, skipping...`);
      continue;
    }

    // Seed 2-4 vehicles per KVK
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 vehicles

    for (let i = 0; i < count; i++) {
      const vehicleData = generateVehicleData(kvkId, i);

      // Check if vehicle with same registration already exists
      const existing = await prisma.kvkVehicle.findFirst({
        where: { kvkId, registrationNo: vehicleData.registrationNo },
      });

      if (!existing) {
        await prisma.kvkVehicle.create({ data: vehicleData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} vehicles`);
  }
  console.log(`   ✅ Total: ${totalCreated} vehicles created\n`);
}

/**
 * Seed equipment data for given KVK IDs
 */
async function seedEquipment(kvkIds) {
  console.log('🌱 Seeding equipment data...');

  let totalCreated = 0;
  for (const kvkId of kvkIds) {
    // Verify KVK exists
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) {
      console.log(`   ⚠️  KVK with ID ${kvkId} not found, skipping...`);
      continue;
    }

    // Seed 5-8 equipment items per KVK
    const count = Math.floor(Math.random() * 4) + 5; // 5-8 items

    for (let i = 0; i < count; i++) {
      const equipmentData = generateEquipmentData(kvkId, i);

      // Check if equipment with same name and year already exists
      const existing = await prisma.kvkEquipment.findFirst({
        where: {
          kvkId,
          equipmentName: equipmentData.equipmentName,
          yearOfPurchase: equipmentData.yearOfPurchase,
        },
      });

      if (!existing) {
        await prisma.kvkEquipment.create({ data: equipmentData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} equipment items`);
  }
  console.log(`   ✅ Total: ${totalCreated} equipment items created\n`);
}

/**
 * Seed farm implementation data for given KVK IDs
 */
async function seedFarmImplements(kvkIds) {
  console.log('🌱 Seeding farm implementation data...');

  let totalCreated = 0;
  for (const kvkId of kvkIds) {
    // Verify KVK exists
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) {
      console.log(`   ⚠️  KVK with ID ${kvkId} not found, skipping...`);
      continue;
    }

    // Seed 4-7 farm implements per KVK
    const count = Math.floor(Math.random() * 4) + 4; // 4-7 items

    for (let i = 0; i < count; i++) {
      const implementData = generateFarmImplementData(kvkId, i);

      // Check if implement with same name and year already exists
      const existing = await prisma.kvkFarmImplement.findFirst({
        where: {
          kvkId,
          implementName: implementData.implementName,
          yearOfPurchase: implementData.yearOfPurchase,
        },
      });

      if (!existing) {
        await prisma.kvkFarmImplement.create({ data: implementData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} farm implements`);
  }
  console.log(`   ✅ Total: ${totalCreated} farm implements created\n`);
}

/**
 * Seed staff/employee data for given KVK IDs
 */
async function seedStaff(kvkIds) {
  console.log('🌱 Seeding staff data...');

  // Get required masters
  const sanctionedPosts = await prisma.sanctionedPost.findMany({ take: 5 });
  const disciplines = await prisma.discipline.findMany({ take: 5 });
  const staffCategories = await prisma.staffCategoryMaster.findMany({ take: 3 });
  const payLevels = await prisma.payLevelMaster.findMany({ take: 5 });

  if (sanctionedPosts.length === 0 || disciplines.length === 0) {
    console.log('   ⚠️  Required masters not found. Run seed:masters first.\n');
    return;
  }

  let totalCreated = 0;
  const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikash', 'Anjali', 'Ramesh', 'Kavita'];
  const lastNames = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Yadav', 'Das', 'Patel', 'Mishra'];

  for (const kvkId of kvkIds) {
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) continue;

    // Seed 3-6 staff members per KVK
    const count = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const staffName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@kvk${kvkId}.gov.in`;
      const mobile = `9${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      
      const existing = await prisma.kvkStaff.findFirst({
        where: { kvkId, email },
      });

      if (!existing) {
        await prisma.kvkStaff.create({
          data: {
            kvkId,
            staffName,
            email,
            mobile,
            dateOfBirth: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            sanctionedPostId: sanctionedPosts[i % sanctionedPosts.length].sanctionedPostId,
            positionOrder: i + 1,
            disciplineId: disciplines[i % disciplines.length].disciplineId,
            payScale: `₹${Math.floor(Math.random() * 50000) + 30000}-${Math.floor(Math.random() * 100000) + 80000}`,
            dateOfJoining: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            jobType: Math.random() > 0.3 ? 'PERMANENT' : 'TEMPORARY',
            transferStatus: 'ACTIVE',
            staffCategoryId: staffCategories.length > 0 ? staffCategories[i % staffCategories.length].staffCategoryId : null,
            payLevelId: payLevels.length > 0 ? payLevels[i % payLevels.length].payLevelId : null,
          },
        });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} staff members`);
  }
  console.log(`   ✅ Total: ${totalCreated} staff members created\n`);
}

/**
 * Seed bank accounts for given KVK IDs
 */
async function seedBankAccounts(kvkIds) {
  console.log('🌱 Seeding bank accounts...');

  let totalCreated = 0;
  const accountTypes = ['KVK', 'REVOLVING_FUND', 'OTHER'];
  const bankNames = ['State Bank of India', 'Punjab National Bank', 'Bank of Baroda', 'HDFC Bank', 'ICICI Bank'];

  for (const kvkId of kvkIds) {
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) continue;

    // Seed 1-3 bank accounts per KVK
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
      const accountData = {
        kvkId,
        accountType: accountTypes[i % accountTypes.length],
        accountName: `${kvk.kvkName} ${accountTypes[i % accountTypes.length]} Account`,
        bankName: bankNames[Math.floor(Math.random() * bankNames.length)],
        location: 'Patna',
        accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      };

      const existing = await prisma.kvkBankAccount.findFirst({
        where: { kvkId, accountNumber: accountData.accountNumber },
      });

      if (!existing) {
        await prisma.kvkBankAccount.create({ data: accountData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} bank accounts`);
  }
  console.log(`   ✅ Total: ${totalCreated} bank accounts created\n`);
}

/**
 * Seed training achievements for given KVK IDs
 */
async function seedTrainings(kvkIds) {
  console.log('🌱 Seeding training achievements...');

  // Get required masters
  const clienteles = await prisma.clienteleMaster.findMany({ take: 5 });
  const trainingTypes = await prisma.trainingTypeMaster.findMany({ take: 5 });
  const trainingAreas = await prisma.trainingAreaMaster.findMany({ take: 5 });
  const thematicAreas = await prisma.thematicAreaMaster.findMany({ take: 5 });
  const coordinators = await prisma.courseCoordinatorMaster.findMany({ take: 3 });
  const fundingSources = await prisma.fundingSourceMaster.findMany({ take: 3 });

  if (clienteles.length === 0 || trainingTypes.length === 0) {
    console.log('   ⚠️  Required masters not found. Run seed:masters first.\n');
    return;
  }

  let totalCreated = 0;
  const trainingTitles = [
    'Organic Farming Techniques', 'Integrated Pest Management', 'Water Conservation Methods',
    'Post-Harvest Management', 'Value Addition in Agriculture', 'Digital Agriculture',
    'Livestock Management', 'Fisheries Development', 'Agri-Entrepreneurship'
  ];

  for (const kvkId of kvkIds) {
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) continue;

    // Seed 5-10 training achievements per KVK
    const count = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < count; i++) {
      const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);

      const trainingData = {
        kvkId,
        clienteleId: clienteles[i % clienteles.length].clienteleId,
        trainingTypeId: trainingTypes[i % trainingTypes.length].trainingTypeId,
        trainingAreaId: trainingAreas[i % trainingAreas.length].trainingAreaId,
        thematicAreaId: thematicAreas[i % thematicAreas.length].thematicAreaId,
        coordinatorId: coordinators[i % coordinators.length].coordinatorId,
        fundingSourceId: fundingSources.length > 0 ? fundingSources[i % fundingSources.length].fundingSourceId : null,
        titleOfTraining: trainingTitles[i % trainingTitles.length],
        startDate,
        endDate,
        venue: `KVK ${kvk.kvkName} Campus`,
        fundingAgencyName: fundingSources.length > 0 ? fundingSources[i % fundingSources.length].name : null,
        campusType: Math.random() > 0.5 ? 'ON_CAMPUS' : 'OFF_CAMPUS',
        generalM: Math.floor(Math.random() * 20) + 5,
        generalF: Math.floor(Math.random() * 15) + 3,
        obcM: Math.floor(Math.random() * 10) + 2,
        obcF: Math.floor(Math.random() * 8) + 1,
        scM: Math.floor(Math.random() * 8) + 1,
        scF: Math.floor(Math.random() * 6) + 1,
        stM: Math.floor(Math.random() * 5) + 1,
        stF: Math.floor(Math.random() * 4) + 1,
      };

      const existing = await prisma.trainingAchievement.findFirst({
        where: {
          kvkId,
          titleOfTraining: trainingData.titleOfTraining,
          startDate: trainingData.startDate,
        },
      });

      if (!existing) {
        await prisma.trainingAchievement.create({ data: trainingData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} training achievements`);
  }
  console.log(`   ✅ Total: ${totalCreated} training achievements created\n`);
}

/**
 * Seed extension activities for given KVK IDs
 */
async function seedExtensionActivities(kvkIds) {
  console.log('🌱 Seeding extension activities...');

  // Get required masters - use ExtensionActivity (not FldActivity)
  const activities = await prisma.extensionActivity.findMany({ take: 5 });
  const staff = await prisma.kvkStaff.findMany({
    where: { kvkId: { in: kvkIds } },
    take: 10,
  });

  if (activities.length === 0) {
    console.log('   ⚠️  Required masters not found. Run seed:masters first.\n');
    return;
  }

  let totalCreated = 0;

  for (const kvkId of kvkIds) {
    const kvk = await prisma.kvk.findUnique({ where: { kvkId } });
    if (!kvk) continue;

    const kvkStaff = staff.filter(s => s.kvkId === kvkId);
    // Seed 8-15 extension activities per KVK
    const count = Math.floor(Math.random() * 8) + 8;

    for (let i = 0; i < count; i++) {
      const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3));

      const activityData = {
        kvkId,
        activityId: activities[i % activities.length].extensionActivityId,
        staffId: kvkStaff.length > 0 ? kvkStaff[i % kvkStaff.length].kvkStaffId : null,
        numberOfActivities: Math.floor(Math.random() * 5) + 1,
        startDate,
        endDate,
        farmersGeneralM: Math.floor(Math.random() * 30) + 10,
        farmersGeneralF: Math.floor(Math.random() * 25) + 8,
        farmersObcM: Math.floor(Math.random() * 15) + 5,
        farmersObcF: Math.floor(Math.random() * 12) + 3,
        farmersScM: Math.floor(Math.random() * 10) + 2,
        farmersScF: Math.floor(Math.random() * 8) + 1,
        farmersStM: Math.floor(Math.random() * 8) + 1,
        farmersStF: Math.floor(Math.random() * 6) + 1,
        officialsGeneralM: Math.floor(Math.random() * 5) + 1,
        officialsGeneralF: Math.floor(Math.random() * 4) + 1,
        officialsObcM: Math.floor(Math.random() * 3) + 1,
        officialsObcF: Math.floor(Math.random() * 2),
        officialsScM: Math.floor(Math.random() * 2),
        officialsScF: Math.floor(Math.random() * 2),
        officialsStM: Math.floor(Math.random() * 2),
        officialsStF: Math.floor(Math.random() * 2),
      };

      const existing = await prisma.kvkExtensionActivity.findFirst({
        where: {
          kvkId,
          activityId: activityData.activityId,
          startDate: activityData.startDate,
        },
      });

      if (!existing) {
        await prisma.kvkExtensionActivity.create({ data: activityData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} extension activities`);
  }
  console.log(`   ✅ Total: ${totalCreated} extension activities created\n`);
}

/**
 * Seed other extension activities for given KVK IDs
 */
async function seedOtherExtensionActivities(kvkIds) {
  console.log('🌱 Seeding other extension activities...');

  // Get required masters - use OtherExtensionActivity (not OtherExtensionActivityType)
  const activityTypes = await prisma.otherExtensionActivity.findMany({ take: 5 });
  const staff = await prisma.kvkStaff.findMany({
    where: { kvkId: { in: kvkIds } },
    take: 10,
  });

  if (activityTypes.length === 0) {
    console.log('   ⚠️  Required masters not found. Run seed:masters first.\n');
    return;
  }

  let totalCreated = 0;

  for (const kvkId of kvkIds) {
    const kvkStaff = staff.filter(s => s.kvkId === kvkId);
    // Seed 5-10 other extension activities per KVK
    const count = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < count; i++) {
      const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7));

      const activityData = {
        kvkId,
        activityTypeId: activityTypes[i % activityTypes.length].otherExtensionActivityId,
        staffId: kvkStaff.length > 0 ? kvkStaff[i % kvkStaff.length].kvkStaffId : null,
        numberOfActivities: Math.floor(Math.random() * 10) + 1,
        startDate,
        endDate,
      };

      const existing = await prisma.kvkOtherExtensionActivity.findFirst({
        where: {
          kvkId,
          activityTypeId: activityData.activityTypeId,
          startDate: activityData.startDate,
        },
      });

      if (!existing) {
        await prisma.kvkOtherExtensionActivity.create({ data: activityData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} other extension activities`);
  }
  console.log(`   ✅ Total: ${totalCreated} other extension activities created\n`);
}

/**
 * Seed important day celebrations for given KVK IDs
 */
async function seedImportantDayCelebrations(kvkIds) {
  console.log('🌱 Seeding important day celebrations...');

  const importantDays = await prisma.importantDay.findMany({ take: 10 });

  if (importantDays.length === 0) {
    console.log('   ⚠️  Required masters not found. Run seed:masters first.\n');
    return;
  }

  let totalCreated = 0;

  for (const kvkId of kvkIds) {
    // Seed 3-6 celebrations per KVK
    const count = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < count; i++) {
      const eventDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

      const celebrationData = {
        kvkId,
        importantDayId: importantDays[i % importantDays.length].importantDayId,
        eventDate,
        numberOfActivities: Math.floor(Math.random() * 5) + 1,
        farmersGeneralM: Math.floor(Math.random() * 50) + 20,
        farmersGeneralF: Math.floor(Math.random() * 40) + 15,
        farmersObcM: Math.floor(Math.random() * 25) + 10,
        farmersObcF: Math.floor(Math.random() * 20) + 8,
        farmersScM: Math.floor(Math.random() * 15) + 5,
        farmersScF: Math.floor(Math.random() * 12) + 4,
        farmersStM: Math.floor(Math.random() * 10) + 3,
        farmersStF: Math.floor(Math.random() * 8) + 2,
        officialsGeneralM: Math.floor(Math.random() * 10) + 2,
        officialsGeneralF: Math.floor(Math.random() * 8) + 1,
        officialsObcM: Math.floor(Math.random() * 5) + 1,
        officialsObcF: Math.floor(Math.random() * 4) + 1,
        officialsScM: Math.floor(Math.random() * 3) + 1,
        officialsScF: Math.floor(Math.random() * 2),
        officialsStM: Math.floor(Math.random() * 2),
        officialsStF: Math.floor(Math.random() * 2),
      };

      const existing = await prisma.kvkImportantDayCelebration.findFirst({
        where: {
          kvkId,
          importantDayId: celebrationData.importantDayId,
          eventDate: celebrationData.eventDate,
        },
      });

      if (!existing) {
        await prisma.kvkImportantDayCelebration.create({ data: celebrationData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} important day celebrations`);
  }
  console.log(`   ✅ Total: ${totalCreated} important day celebrations created\n`);
}

/**
 * Seed farmer awards for given KVK IDs
 */
async function seedFarmerAwards(kvkIds) {
  console.log('🌱 Seeding farmer awards...');

  let totalCreated = 0;
  const firstNames = ['Ram', 'Shyam', 'Gita', 'Sita', 'Mohan', 'Geeta', 'Ravi', 'Kavita'];
  const lastNames = ['Kumar', 'Singh', 'Yadav', 'Das', 'Sharma', 'Verma'];
  const awardNames = ['Best Farmer Award', 'Innovative Farmer Award', 'Organic Farmer Award', 'Progressive Farmer Award'];
  const achievements = [
    'Excellence in organic farming', 'Innovation in crop production', 'Outstanding contribution to agriculture',
    'Best practices in water management', 'Excellence in livestock management'
  ];

  for (const kvkId of kvkIds) {
    // Seed 2-5 farmer awards per KVK
    const count = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < count; i++) {
      const farmerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const awardData = {
        kvkId,
        farmerName,
        contactNumber: `9${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: `Village ${i + 1}, District, State`,
        awardName: awardNames[i % awardNames.length],
        amount: Math.floor(Math.random() * 50000) + 10000,
        achievement: achievements[i % achievements.length],
        conferringAuthority: ['ICAR', 'State Government', 'KVK', 'District Administration'][Math.floor(Math.random() * 4)],
      };

      const existing = await prisma.farmerAward.findFirst({
        where: {
          kvkId,
          farmerName: awardData.farmerName,
          awardName: awardData.awardName,
        },
      });

      if (!existing) {
        await prisma.farmerAward.create({ data: awardData });
        totalCreated++;
      }
    }
    console.log(`   ✅ KVK ${kvkId}: ${count} farmer awards`);
  }
  console.log(`   ✅ Total: ${totalCreated} farmer awards created\n`);
}

/**
 * Main function to seed all form data
 */
async function run() {
  // Get KVK IDs from command line arguments or environment variable
  let kvkIds = [];

  if (process.argv.length > 2) {
    // Get from command line arguments
    kvkIds = process.argv.slice(2).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  } else if (process.env.KVK_IDS) {
    // Get from environment variable (comma-separated)
    kvkIds = process.env.KVK_IDS.split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));
  }

  if (kvkIds.length === 0) {
    console.error('❌ Error: No KVK IDs provided.');
    console.error('Usage: node scripts/seed-forms-data.js <kvkId1> <kvkId2> ...');
    console.error('   or: KVK_IDS=1,2,3 node scripts/seed-forms-data.js');
    process.exit(1);
  }

  console.log(`🌱 Seeding form data for KVK IDs: ${kvkIds.join(', ')}\n`);

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

  if (existingIds.length === 0) {
    console.error('❌ Error: No valid KVK IDs found.');
    process.exit(1);
  }

  // Seed data for each form type
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

  console.log('✅ All form data seeded successfully!');
}

if (require.main === module) {
  run()
    .catch((e) => {
      console.error('❌ Error:', e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = {
    run,
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
  };
}
