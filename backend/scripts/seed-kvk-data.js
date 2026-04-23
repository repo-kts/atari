#!/usr/bin/env node
/**
 * Comprehensive KVK Data Seeding Script
 * 
 * Seeds all KVK-related tables including:
 * - KVK records with master data
 * - Staff, Bank Accounts, Equipment, Vehicles, Infrastructure
 * - Achievements (OFT, CSISA, FLD, etc.) with nested relationships
 * - Multiple users mapped to different KVKs
 * 
 * Run: node scripts/seed-kvk-data.js   or   npm run seed:kvk
 */
require('dotenv').config();
const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');

// Helper function to get or create master data
async function getOrCreateZone(name) {
  let zone = await prisma.zone.findFirst({ where: { zoneName: name } });
  if (!zone) {
    zone = await prisma.zone.create({ data: { zoneName: name } });
  }
  return zone;
}

async function getOrCreateState(zoneId, name) {
  let state = await prisma.stateMaster.findFirst({
    where: { stateName: name, zoneId }
  });
  if (!state) {
    state = await prisma.stateMaster.create({
      data: { stateName: name, zoneId }
    });
  }
  return state;
}

async function getOrCreateDistrict(stateId, zoneId, name) {
  let district = await prisma.districtMaster.findFirst({
    where: { districtName: name, stateId }
  });
  if (!district) {
    district = await prisma.districtMaster.create({
      data: { districtName: name, stateId, zoneId }
    });
  }
  return district;
}

async function getOrCreateOrg(name) {
  let org = await prisma.orgMaster.findFirst({ where: { orgName: name } });
  if (!org) {
    org = await prisma.orgMaster.create({ data: { orgName: name } });
  }
  return org;
}

async function getOrCreateUniversity(name, orgId, hostOrg = null) {
  const resolvedHostOrg = (hostOrg || name || '').trim();
  let university = await prisma.universityMaster.findFirst({
    where: { universityName: name }
  });
  if (!university) {
    university = await prisma.universityMaster.create({
      data: {
        universityName: name,
        hostOrg: resolvedHostOrg,
        organization: { connect: { orgId } }
      }
    });
  }
  return university;
}

async function getOrCreateSeason(name) {
  let season = await prisma.season.findFirst({ where: { seasonName: name } });
  if (!season) {
    season = await prisma.season.create({ data: { seasonName: name } });
  }
  return season;
}

async function getOrCreateDiscipline(name) {
  let discipline = await prisma.discipline.findFirst({
    where: { disciplineName: name }
  });
  if (!discipline) {
    discipline = await prisma.discipline.create({
      data: { disciplineName: name }
    });
  }
  return discipline;
}

async function getOrCreateSanctionedPost(name) {
  let post = await prisma.sanctionedPost.findFirst({
    where: { postName: name }
  });
  if (!post) {
    // Try to find any existing post and use it
    const existingPosts = await prisma.sanctionedPost.findMany({ take: 2 });
    if (existingPosts.length > 0) {
      // Use existing posts
      post = existingPosts[0];
    } else {
      // If no posts exist, try to find by partial match or use first available
      const anyPost = await prisma.sanctionedPost.findFirst();
      if (anyPost) {
        post = anyPost;
      } else {
        throw new Error(`No sanctioned posts found. Please run seed-masters.js first to create master data.`);
      }
    }
  }
  return post;
}

async function getOrCreateOftSubject(name) {
  let subject = await prisma.oftSubject.findFirst({
    where: { subjectName: name }
  });
  if (!subject) {
    subject = await prisma.oftSubject.create({
      data: { subjectName: name }
    });
  }
  return subject;
}

async function getOrCreateOftThematicArea(name, oftSubjectId) {
  let area = await prisma.oftThematicArea.findFirst({
    where: { thematicAreaName: name, oftSubjectId },
  });
  if (!area) {
    area = await prisma.oftThematicArea.create({
      data: {
        thematicAreaName: name,
        subject: { connect: { oftSubjectId } },
      },
    });
  }
  return area;
}

async function getOrCreateOftTechnologyType(name) {
  let type = await prisma.oftTechnologyType.findFirst({
    where: { name }
  });
  if (!type) {
    type = await prisma.oftTechnologyType.create({ data: { name } });
  }
  return type;
}

async function getOrCreateInfraMaster(name) {
  let infra = await prisma.kvkInfrastructureMaster.findFirst({
    where: { name }
  });
  if (!infra) {
    // Use existing infrastructure master if available
    const existing = await prisma.kvkInfrastructureMaster.findFirst();
    if (existing) {
      infra = existing;
    } else {
      throw new Error(`No infrastructure masters found. Please run seed-masters.js first.`);
    }
  }
  return infra;
}

async function getOrCreateBudgetItem(name) {
  return prisma.budgetItem.upsert({
    where: { itemName: name },
    update: {},
    create: { itemName: name },
  });
}

async function getOrCreateFldCrop(name) {
  let crop = await prisma.fldCrop.findFirst({ where: { cropName: name } });
  if (!crop) {
    // Use existing crop if available
    const existing = await prisma.fldCrop.findFirst();
    if (existing) {
      crop = existing;
    } else {
      throw new Error(`No FLD crops found. Please run seed-masters.js first.`);
    }
  }
  return crop;
}

async function getOrCreateRole(name) {
  let role = await prisma.role.findFirst({ where: { roleName: name } });
  if (!role) {
    role = await prisma.role.create({
      data: { roleName: name, description: `${name} role` }
    });
  }
  return role;
}

// Create KVKs with all related data
async function seedKvks() {
  console.log('\n🌱 Seeding KVKs and related data...\n');

  // Create master data
  const zone1 = await getOrCreateZone('North Zone');
  const zone2 = await getOrCreateZone('South Zone');

  const state1 = await getOrCreateState(zone1.zoneId, 'Punjab');
  const state2 = await getOrCreateState(zone1.zoneId, 'Haryana');
  const state3 = await getOrCreateState(zone2.zoneId, 'Karnataka');

  const district1 = await getOrCreateDistrict(state1.stateId, zone1.zoneId, 'Ludhiana');
  const district2 = await getOrCreateDistrict(state2.stateId, zone1.zoneId, 'Karnal');
  const district3 = await getOrCreateDistrict(state3.stateId, zone2.zoneId, 'Bangalore');

  const org1 = await getOrCreateOrg('ICAR');
  const org2 = await getOrCreateOrg('State Agricultural University');

  const university1 = await getOrCreateUniversity('Punjab Agricultural University', org1.orgId, 'PAU');
  const university2 = await getOrCreateUniversity('Karnataka State Agricultural University', org2.orgId, 'UAS Bangalore');

  // Zone IV - Patna / Bihar / Patna / ICAR / Patna University (demo KVK kvkpatna; aligns with seed-data.js hierarchy)
  const zonePatna = await getOrCreateZone('Zone IV - Patna');
  const stateBihar = await getOrCreateState(zonePatna.zoneId, 'Bihar');
  const districtPatna = await getOrCreateDistrict(stateBihar.stateId, zonePatna.zoneId, 'Patna');
  let orgIcarPatna = await prisma.orgMaster.findFirst({
    where: { orgName: 'ICAR', districtId: districtPatna.districtId },
  });
  if (!orgIcarPatna) {
    orgIcarPatna = await prisma.orgMaster.create({
      data: { orgName: 'ICAR', districtId: districtPatna.districtId },
    });
  }
  let universityPatna = await prisma.universityMaster.findFirst({
    where: { universityName: 'Patna University' },
  });
  if (!universityPatna) {
    universityPatna = await getOrCreateUniversity(
      'Patna University',
      orgIcarPatna.orgId,
      'Patna University'
    );
  }
  universityPatna = await prisma.universityMaster.update({
    where: { universityId: universityPatna.universityId },
    data: {
      orgId: orgIcarPatna.orgId,
      hostOrg: 'Patna University',
      hostMobile: '9826123456',
      hostLandline: '0612-2670001',
      hostFax: null,
      hostEmail: 'registrar@patnauniversity.ac.in',
      hostAddress: 'Patna University, Ashok Rajpath, Patna - 800005, Bihar',
    },
  });

  const season1 = await getOrCreateSeason('Kharif');
  const season2 = await getOrCreateSeason('Rabi');

  const discipline1 = await getOrCreateDiscipline('Agronomy');
  const discipline2 = await getOrCreateDiscipline('Horticulture');
  const discipline3 = await getOrCreateDiscipline('Animal Science');

  const post1 = await getOrCreateSanctionedPost('Programme Coordinator');
  const post2 = await getOrCreateSanctionedPost('Subject Matter Specialist');

  const oftSubject1 = await getOrCreateOftSubject(
    'Technologies Assessed under Various Crops by KVKs (Crop Production)'
  );
  const oftThematicArea1 = await getOrCreateOftThematicArea(
    'Integrated Nutrient Management',
    oftSubject1.oftSubjectId
  );

  const techType1 = await getOrCreateOftTechnologyType('Variety Testing');
  const techType2 = await getOrCreateOftTechnologyType('Nutrient Management');

  const infra1 = await getOrCreateInfraMaster('Office Building');
  const infra2 = await getOrCreateInfraMaster('Laboratory');

  const budgetItem1 = await getOrCreateBudgetItem('Critical Input');
  const budgetItem2 = await getOrCreateBudgetItem('TA/DA');

  // Use existing FLD crops if available
  const existingFldCrops = await prisma.fldCrop.findMany({ take: 2 });
  const fldCrop1 = existingFldCrops[0];
  const fldCrop2 = existingFldCrops[1] || existingFldCrops[0];

  // Create KVKs
  const kvkData = [
    {
      kvkName: 'KVK Ludhiana',
      zoneId: zone1.zoneId,
      stateId: state1.stateId,
      districtId: district1.districtId,
      orgId: org1.orgId,
      universityId: university1.universityId,
      hostOrg: 'PAU',
      mobile: '9876543210',
      email: 'kvk.ludhiana@atari.gov.in',
      address: 'Ludhiana, Punjab',
      yearOfSanction: 2010,
    },
    {
      kvkName: 'KVK Karnal',
      zoneId: zone1.zoneId,
      stateId: state2.stateId,
      districtId: district2.districtId,
      orgId: org1.orgId,
      universityId: university1.universityId,
      hostOrg: 'CCSHAU',
      mobile: '9876543211',
      email: 'kvk.karnal@atari.gov.in',
      address: 'Karnal, Haryana',
      yearOfSanction: 2012,
    },
    {
      kvkName: 'KVK Bangalore',
      zoneId: zone2.zoneId,
      stateId: state3.stateId,
      districtId: district3.districtId,
      orgId: org2.orgId,
      universityId: university2.universityId,
      hostOrg: 'UAS Bangalore',
      mobile: '9876543212',
      email: 'kvk.bangalore@atari.gov.in',
      address: 'Bangalore, Karnataka',
      yearOfSanction: 2015,
    },
    {
      kvkName: 'kvkpatna',
      zoneId: zonePatna.zoneId,
      stateId: stateBihar.stateId,
      districtId: districtPatna.districtId,
      orgId: orgIcarPatna.orgId,
      universityId: universityPatna.universityId,
      hostOrg: 'Patna University',
      mobile: '9876501234',
      landline: '0612-2500123',
      fax: null,
      email: 'kvk.patna@icar.gov.in',
      address: 'Krishi Vigyan Kendra, Patna, Bihar - 800001',
      hostMobile: '9826123456',
      hostLandline: '0612-2670001',
      hostFax: null,
      hostEmail: 'registrar@patnauniversity.ac.in',
      hostAddress: 'Patna University, Ashok Rajpath, Patna - 800005, Bihar',
      yearOfSanction: 2018,
    },
  ];

  // Older runs created this KVK as "KVK Patna"; canonical name is kvkpatna
  const legacyPatnaName = await prisma.kvk.findFirst({ where: { kvkName: 'KVK Patna' } });
  const hasKvkpatna = await prisma.kvk.findFirst({ where: { kvkName: 'kvkpatna' } });
  if (legacyPatnaName && !hasKvkpatna) {
    await prisma.kvk.update({
      where: { kvkId: legacyPatnaName.kvkId },
      data: { kvkName: 'kvkpatna' },
    });
    console.log('   ✅ Renamed legacy KVK Patna → kvkpatna');
  }

  const kvks = [];
  for (const data of kvkData) {
    let kvk = await prisma.kvk.findFirst({
      where: { kvkName: data.kvkName }
    });
    if (!kvk) {
      kvk = await prisma.kvk.create({ data });
      console.log(`   ✅ Created KVK: ${kvk.kvkName}`);
    } else if (data.kvkName === 'kvkpatna') {
      await prisma.kvk.update({
        where: { kvkId: kvk.kvkId },
        data,
      });
      kvk = await prisma.kvk.findUnique({ where: { kvkId: kvk.kvkId } });
      console.log(`   ✅ Updated KVK: ${kvk.kvkName}`);
    } else {
      console.log(`   ⏭️  KVK already exists: ${kvk.kvkName}`);
    }
    kvks.push(kvk);
  }

  // Seed Staff for each KVK
  console.log('\n   📋 Seeding Staff...');
  for (const kvk of kvks) {
    const staffData = [
      {
        kvkId: kvk.kvkId,
        staffName: `Staff 1 - ${kvk.kvkName}`,
        email: `staff1.${kvk.kvkId}@kvk.test`,
        mobile: `9876543${kvk.kvkId}00`,
        dateOfBirth: new Date('1980-01-15'),
        sanctionedPostId: post1.sanctionedPostId,
        positionOrder: 1,
        disciplineId: discipline1.disciplineId,
        payScale: 'Level 10',
        dateOfJoining: new Date('2015-06-01'),
        jobType: 'PERMANENT',
        transferStatus: 'ACTIVE',
      },
      {
        kvkId: kvk.kvkId,
        staffName: `Staff 2 - ${kvk.kvkName}`,
        email: `staff2.${kvk.kvkId}@kvk.test`,
        mobile: `9876543${kvk.kvkId}01`,
        dateOfBirth: new Date('1985-05-20'),
        sanctionedPostId: post2.sanctionedPostId,
        positionOrder: 2,
        disciplineId: discipline2.disciplineId,
        payScale: 'Level 11',
        dateOfJoining: new Date('2018-03-15'),
        jobType: 'PERMANENT',
        transferStatus: 'ACTIVE',
      },
    ];

    for (const data of staffData) {
      const existing = await prisma.kvkStaff.findFirst({
        where: { email: data.email },
      });
      if (!existing) {
        await prisma.kvkStaff.create({ data });
        console.log(`      ✅ Created staff: ${data.staffName}`);
      }
    }
  }

  // Seed Bank Accounts
  console.log('\n   💰 Seeding Bank Accounts...');
  for (const kvk of kvks) {
    const bankAccounts = [
      {
        kvkId: kvk.kvkId,
        accountType: 'KVK',
        accountName: `${kvk.kvkName} Main Account`,
        bankName: 'State Bank of India',
        location: kvk.address,
        accountNumber: `SB${kvk.kvkId}001`,
      },
      {
        kvkId: kvk.kvkId,
        accountType: 'REVOLVING_FUND',
        accountName: `${kvk.kvkName} Revolving Fund`,
        bankName: 'Punjab National Bank',
        location: kvk.address,
        accountNumber: `PNB${kvk.kvkId}002`,
      },
    ];

    for (const data of bankAccounts) {
      const existing = await prisma.kvkBankAccount.findFirst({
        where: {
          kvkId: data.kvkId,
          accountNumber: data.accountNumber
        },
      });
      if (!existing) {
        await prisma.kvkBankAccount.create({ data });
        console.log(`      ✅ Created bank account: ${data.accountName}`);
      }
    }
  }

  // Seed Equipment
  console.log('\n   🔧 Seeding Equipment...');
  for (const kvk of kvks) {
    const equipment = [
      {
        kvkId: kvk.kvkId,
        equipmentName: 'Tractor',
        yearOfPurchase: 2020,
        totalCost: 500000,
        sourceOfFunding: 'ICAR',
        type: 'EQUIPMENT',
      },
      {
        kvkId: kvk.kvkId,
        equipmentName: 'Harvester',
        yearOfPurchase: 2021,
        totalCost: 800000,
        sourceOfFunding: 'State Government',
        type: 'EQUIPMENT',
      },
    ];

    for (const data of equipment) {
      const existing = await prisma.kvkEquipment.findFirst({
        where: {
          kvkId: data.kvkId,
          equipmentName: data.equipmentName,
          yearOfPurchase: data.yearOfPurchase,
        },
      });
      if (!existing) {
        await prisma.kvkEquipment.create({ data });
        console.log(`      ✅ Created equipment: ${data.equipmentName}`);
      }
    }
  }

  // Seed Infrastructure
  console.log('\n   🏢 Seeding Infrastructure...');
  for (const kvk of kvks) {
    const infrastructures = [
      {
        kvkId: kvk.kvkId,
        infraMasterId: infra1.infraMasterId,
        notYetStarted: false,
        completedPlinthLevel: true,
        completedLintelLevel: true,
        completedRoofLevel: true,
        totallyCompleted: true,
        plinthAreaSqM: 500,
        underUse: true,
        sourceOfFunding: 'ICAR',
      },
      {
        kvkId: kvk.kvkId,
        infraMasterId: infra2.infraMasterId,
        notYetStarted: false,
        completedPlinthLevel: true,
        completedLintelLevel: true,
        completedRoofLevel: true,
        totallyCompleted: true,
        plinthAreaSqM: 200,
        underUse: true,
        sourceOfFunding: 'State Government',
      },
    ];

    for (const data of infrastructures) {
      const existing = await prisma.kvkInfrastructure.findFirst({
        where: {
          kvkId: data.kvkId,
          infraMasterId: data.infraMasterId
        },
      });
      if (!existing) {
        await prisma.kvkInfrastructure.create({ data });
        console.log(`      ✅ Created infrastructure for KVK ${kvk.kvkId}`);
      }
    }
  }

  // Seed Vehicles
  console.log('\n   🚗 Seeding Vehicles...');
  for (const kvk of kvks) {
    const vehicles = [
      {
        kvkId: kvk.kvkId,
        vehicleName: 'Mahindra Bolero',
        registrationNo: `PB${kvk.kvkId}1234`,
        yearOfPurchase: 2020,
        totalCost: 800000,
      },
    ];

    for (const data of vehicles) {
      const existing = await prisma.kvkVehicle.findFirst({
        where: {
          kvkId: data.kvkId,
          registrationNo: data.registrationNo
        },
      });
      if (!existing) {
        await prisma.kvkVehicle.create({ data });
        console.log(`      ✅ Created vehicle: ${data.registrationNo}`);
      }
    }
  }

  // Seed CSISA with nested Crop Details
  console.log('\n   🌾 Seeding CSISA with Crop Details...');
  for (const kvk of kvks) {
    const csisaData = {
      kvkId: kvk.kvkId,
      reportingYear: new Date('2024-01-01'),
      seasonId: season1.seasonId,
      villagesCovered: 10,
      blocksCovered: 2,
      districtsCovered: 1,
      respondents: 50,
      trialName: `CSISA Trial - ${kvk.kvkName}`,
      areaCoveredHa: 25.5,
      cropDetails: {
        create: [
          {
            cropName: 'Wheat',
            technologyOption: 'Zero Tillage',
            varietyName: 'HD-3086',
            durationDays: 120,
            sowingDate: new Date('2024-11-15'),
            harvestingDate: new Date('2025-03-15'),
            daysOfMaturity: 120,
            grainYieldQPerHa: 45.5,
            costOfCultivation: 25000,
            grossReturn: 90000,
            netReturn: 65000,
            bcr: 3.6,
          },
          {
            cropName: 'Rice',
            technologyOption: 'Direct Seeded Rice',
            varietyName: 'PR-126',
            durationDays: 110,
            sowingDate: new Date('2024-06-01'),
            harvestingDate: new Date('2024-09-20'),
            daysOfMaturity: 110,
            grainYieldQPerHa: 55.0,
            costOfCultivation: 30000,
            grossReturn: 110000,
            netReturn: 80000,
            bcr: 3.67,
          },
        ],
      },
    };

    const existing = await prisma.csisa.findFirst({
      where: {
        kvkId: kvk.kvkId,
        reportingYear: new Date('2024-01-01'),
        seasonId: season1.seasonId,
      },
    });
    if (!existing) {
      await prisma.csisa.create({ data: csisaData });
      console.log(`      ✅ Created CSISA with crop details for KVK ${kvk.kvkId}`);
    }
  }

  // Seed OFT with nested Technologies
  console.log('\n   🔬 Seeding OFT with Technologies...');
  for (const kvk of kvks) {
    const staff = await prisma.kvkStaff.findFirst({
      where: { kvkId: kvk.kvkId },
    });
    if (!staff) continue;

    const oftData = {
      kvkId: kvk.kvkId,
      expectedCompletionDate: new Date('2024-12-31'),
      seasonId: season1.seasonId,
      staffId: staff.kvkStaffId,
      oftSubjectId: oftSubject1.oftSubjectId,
      oftThematicAreaId: oftThematicArea1.oftThematicAreaId,
      disciplineId: discipline1.disciplineId,
      title: `OFT - ${kvk.kvkName}`,
      problemDiagnosed: 'Low yield due to improper nutrient management',
      sourceOfTechnology: 'ICAR Research',
      productionSystem: 'Cereal Production',
      performanceIndicators: 'Yield, Cost, BCR',
      quantity: 1.0,
      numberOfLocation: 3,
      numberOfTrialReplication: 3,
      oftStartDate: new Date('2024-06-01'),
      criticalInput: 'Fertilizer, Seeds',
      costOfOft: 50000,
      farmersGeneralM: 10,
      farmersGeneralF: 5,
      farmersObcM: 8,
      farmersObcF: 4,
      farmersScM: 5,
      farmersScF: 2,
      farmersStM: 3,
      farmersStF: 1,
      technologies: {
        create: [
          {
            oftTechnologyTypeId: techType1.oftTechnologyTypeId,
            optionKey: `tech-${techType1.oftTechnologyTypeId}`,
            optionName: techType1.name,
            details: 'Testing new wheat variety HD-3086',
          },
          {
            oftTechnologyTypeId: techType2.oftTechnologyTypeId,
            optionKey: `tech-${techType2.oftTechnologyTypeId}`,
            optionName: techType2.name,
            details: 'Integrated nutrient management practices',
          },
        ],
      },
    };

    const existing = await prisma.kvkoft.findFirst({
      where: {
        kvkId: kvk.kvkId,
        expectedCompletionDate: new Date('2024-12-31'),
        seasonId: season1.seasonId,
      },
    });
    if (!existing) {
      await prisma.kvkoft.create({ data: oftData });
      console.log(`      ✅ Created OFT with technologies for KVK ${kvk.kvkId}`);
    }
  }

  // Seed Budget Utilization with nested Items
  console.log('\n   💵 Seeding Budget Utilization with Items...');
  if (!fldCrop1) {
    console.log('      ⏭️  Skipping Budget Utilization seeding - no FLD crops found.');
  } else {
    for (const kvk of kvks) {
      const budgetData = {
        kvkId: kvk.kvkId,
        year: 2024,
        seasonId: season1.seasonId,
        cropId: fldCrop1.cropId,
        overallFundAllocation: 500000,
        areaAllotted: 10.0,
        areaAchieved: 9.5,
        items: {
          create: [
            {
              budgetItemId: budgetItem1.budgetItemId,
              budgetReceived: 200000,
              budgetUtilized: 180000,
            },
            {
              budgetItemId: budgetItem2.budgetItemId,
              budgetReceived: 300000,
              budgetUtilized: 280000,
            },
          ],
        },
      };

      const existing = await prisma.kvkBudgetUtilization.findFirst({
        where: {
          kvkId: kvk.kvkId,
          year: 2024,
          seasonId: season1.seasonId,
        },
      });
      if (!existing) {
        await prisma.kvkBudgetUtilization.create({ data: budgetData });
        console.log(`      ✅ Created budget utilization with items for KVK ${kvk.kvkId}`);
      }
    }
  }

  // Seed FLD with nested Extensions and Technical Feedbacks
  console.log('\n   🌱 Seeding FLD with Extensions and Feedbacks...');
  if (!fldCrop1) {
    console.log('      ⏭️  Skipping FLD seeding - no FLD crops found. Run seed-masters.js first.');
  } else {
    // Check if required FLD master data exists
    const sector = await prisma.sector.findFirst();
    const thematicArea = await prisma.fldThematicArea.findFirst();
    const category = await prisma.fldCategory.findFirst();
    const subCategory = await prisma.fldSubcategory.findFirst();

    if (!sector || !thematicArea || !category || !subCategory) {
      console.log('      ⏭️  Skipping FLD seeding - required FLD master data not found. Run seed-masters.js first.');
    } else {
      for (const kvk of kvks) {
        const staff = await prisma.kvkStaff.findFirst({
          where: { kvkId: kvk.kvkId },
        });
        if (!staff) continue;

        const fldData = {
          kvkId: kvk.kvkId,
          kvkStaffId: staff.kvkStaffId,
          seasonId: season1.seasonId,
          sectorId: sector.sectorId,
          thematicAreaId: thematicArea.thematicAreaId,
          categoryId: category.categoryId,
          subCategoryId: subCategory.subCategoryId,
          cropId: fldCrop1.cropId,
          fldName: `FLD - ${kvk.kvkName}`,
          noOfDemonstration: 5,
          areaHa: 2.5,
          startDate: new Date('2024-06-01'),
          generalM: 20,
          generalF: 10,
          obcM: 15,
          obcF: 8,
          scM: 10,
          scF: 5,
          stM: 5,
          stF: 2,
        };

        const existingFld = await prisma.kvkFldIntroduction.findFirst({
          where: {
            kvkId: kvk.kvkId,
            seasonId: season1.seasonId,
            cropId: fldCrop1.cropId,
          },
        });

        if (!existingFld) {
          const fld = await prisma.kvkFldIntroduction.create({ data: fldData });

          // Create extension activities
          const activity = await prisma.fldActivity.findFirst({
            where: { activityName: 'Field Day' }
          }) || await prisma.fldActivity.create({
            data: { activityName: 'Field Day' }
          });

          await prisma.fldExtension.create({
            data: {
              kvkId: kvk.kvkId,
              fldId: fld.kvkFldId,
              activityId: activity.activityId,
              reportingYear: new Date('2024-01-01'),
              activityDate: new Date('2024-08-15'),
              numberOfActivities: 2,
              remarks: 'Successful field day',
              generalM: 15,
              generalF: 8,
              obcM: 10,
              obcF: 5,
              scM: 8,
              scF: 4,
              stM: 3,
              stF: 1,
            },
          });

          await prisma.fldTechnicalFeedback.create({
            data: {
              kvkId: kvk.kvkId,
              fldId: fld.kvkFldId,
              cropId: fldCrop1.cropId,
              reportingYear: new Date('2024-01-01'),
              feedback: 'Excellent performance of the demonstrated technology',
            },
          });

          console.log(`      ✅ Created FLD with extensions and feedbacks for KVK ${kvk.kvkId}`);
        }
      }
    }
  }

  // Seed DRMR Activity with nested Components
  console.log('\n   📊 Seeding DRMR Activity with Components...');
  for (const kvk of kvks) {
      const drmrData = {
        kvkId: kvk.kvkId,
        reportingYear: new Date('2024-01-01'),
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        totalBudgetUtilized: 200000,
        components: {
          create: [
            {
              activityType: 'TRAINING',
              quantity: 10,
              unit: 'Sessions',
              generalM: 50,
              generalF: 30,
              obcM: 40,
              obcF: 20,
              scM: 25,
              scF: 15,
              stM: 15,
              stF: 10,
            },
            {
              activityType: 'FRONTLINE_DEMONSTRATION',
              quantity: 5,
              unit: 'Demonstrations',
              generalM: 30,
              generalF: 20,
              obcM: 25,
              obcF: 15,
              scM: 15,
              scF: 10,
              stM: 10,
              stF: 5,
            },
          ],
        },
      };

      const existing = await prisma.drmrActivity.findFirst({
        where: {
          kvkId: kvk.kvkId,
          reportingYear: new Date('2024-01-01'),
        },
      });
      if (!existing) {
        await prisma.drmrActivity.create({ data: drmrData });
        console.log(`      ✅ Created DRMR activity with components for KVK ${kvk.kvkId}`);
      }
    }

  console.log('\n✅ KVK data seeding completed!\n');
  return kvks;
}

// Create users mapped to KVKs
async function seedKvkUsers(kvks) {
    console.log('\n👥 Seeding KVK Users...\n');

    const kvkRole = await getOrCreateRole('kvk_admin');
    const password = process.env.KVK_USER_PASSWORD || 'Kvk@123';
    const passwordHash = await hashPassword(password);

    const users = [];
    for (let i = 0; i < kvks.length; i++) {
      const kvk = kvks[i];
      if (kvk.kvkName === 'kvkpatna') continue;
      const userData = {
        name: `KVK Admin - ${kvk.kvkName}`,
        email: `admin.${kvk.kvkId}@kvk.test`,
        passwordHash,
        roleId: kvkRole.roleId,
        zoneId: kvk.zoneId,
        stateId: kvk.stateId,
        districtId: kvk.districtId,
        orgId: kvk.orgId,
        universityId: kvk.universityId,
        kvkId: kvk.kvkId,
        phoneNumber: `9876543${kvk.kvkId}99`,
      };

      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existing) {
        const user = await prisma.user.create({ data: userData });
        users.push(user);
        console.log(`   ✅ Created user: ${user.email} (mapped to ${kvk.kvkName})`);
      } else {
        console.log(`   ⏭️  User already exists: ${userData.email}`);
        users.push(existing);
      }
    }

    // Create additional users for testing
    const additionalUsers = [
      {
        name: 'KVK Staff User 1',
        email: 'staff1@kvk.test',
        kvkId: kvks[0]?.kvkId,
        roleName: 'kvk_staff',
      },
      {
        name: 'KVK Staff User 2',
        email: 'staff2@kvk.test',
        kvkId: kvks[1]?.kvkId,
        roleName: 'kvk_staff',
      },
      {
        name: 'KVK Viewer User',
        email: 'viewer@kvk.test',
        kvkId: kvks[2]?.kvkId,
        roleName: 'kvk_viewer',
      },
    ];

    for (const userData of additionalUsers) {
      if (!userData.kvkId) continue;

      const role = await getOrCreateRole(userData.roleName);
      const kvk = kvks.find(k => k.kvkId === userData.kvkId);

      const data = {
        name: userData.name,
        email: userData.email,
        passwordHash,
        roleId: role.roleId,
        zoneId: kvk?.zoneId,
        stateId: kvk?.stateId,
        districtId: kvk?.districtId,
        orgId: kvk?.orgId,
        universityId: kvk?.universityId,
        kvkId: userData.kvkId,
        phoneNumber: `9876543${userData.kvkId}88`,
      };

      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!existing) {
        const user = await prisma.user.create({ data });
        users.push(user);
        console.log(`   ✅ Created user: ${user.email} (mapped to KVK ${userData.kvkId})`);
      } else {
        console.log(`   ⏭️  User already exists: ${data.email}`);
      }
    }

    const kvkPatna = kvks.find((k) => k.kvkName === 'kvkpatna');
    if (kvkPatna) {
      const patnaPasswordHash = await hashPassword('Atari@123');
      const patnaEmail = 'kvkpatna@atari.gov.in';
      await prisma.user.upsert({
        where: { email: patnaEmail },
        create: {
          name: 'KVK Patna Admin',
          email: patnaEmail,
          passwordHash: patnaPasswordHash,
          roleId: kvkRole.roleId,
          zoneId: kvkPatna.zoneId,
          stateId: kvkPatna.stateId,
          districtId: kvkPatna.districtId,
          orgId: kvkPatna.orgId,
          universityId: kvkPatna.universityId,
          kvkId: kvkPatna.kvkId,
          phoneNumber: kvkPatna.mobile,
        },
        update: {
          passwordHash: patnaPasswordHash,
          roleId: kvkRole.roleId,
          zoneId: kvkPatna.zoneId,
          stateId: kvkPatna.stateId,
          districtId: kvkPatna.districtId,
          orgId: kvkPatna.orgId,
          universityId: kvkPatna.universityId,
          kvkId: kvkPatna.kvkId,
          phoneNumber: kvkPatna.mobile,
        },
      });
      console.log(`   ✅ Upserted user: ${patnaEmail} (kvk_admin → kvkpatna)`);
    }

  console.log(`\n✅ Created ${users.length} users mapped to KVKs\n`);
  return users;
}

// Main function
async function run() {
    try {
      console.log('\n🚀 Starting KVK Data Seeding...\n');

      // Check if master data exists
      const zones = await prisma.zone.findMany({ take: 1 });
      if (zones.length === 0) {
        console.log('⚠️  Warning: No zones found. Please run seed-masters.js first.\n');
      }

      // Seed KVKs and all related data
      const kvks = await seedKvks();

      // Seed users mapped to KVKs
      await seedKvkUsers(kvks);

      console.log('\n✅ All KVK data seeding completed successfully!\n');
      console.log('📝 Summary:');
      console.log(`   - ${kvks.length} KVKs created`);
      console.log(`   - Staff, Bank Accounts, Equipment, Vehicles, Infrastructure seeded`);
      console.log(`   - CSISA with Crop Details seeded`);
      console.log(`   - OFT with Technologies seeded`);
      console.log(`   - Budget Utilization with Items seeded`);
      console.log(`   - FLD with Extensions and Feedbacks seeded`);
      console.log(`   - DRMR Activity with Components seeded`);
      console.log(`   - Multiple users mapped to KVKs\n`);

    } catch (error) {
      console.error('\n❌ Seeding failed:', error);
      throw error;
    }
  }

// Run if called directly
if (require.main === module) {
  run()
    .catch((e) => {
      console.error('\n❌ Seed failed:', e.message);
      console.error(e.stack);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { run };
