#!/usr/bin/env node
/**
 * Seed application data: hierarchy (zone, states, districts, orgs), seasons, crop types,
 * discipline, infrastructure master, sanctioned posts.
 * Run: node scripts/seed-data.js   or   npm run seed:data
 */
require('dotenv').config();
const prisma = require('../config/prisma');

const HIERARCHY = {
  zoneName: 'Zone IV - Patna',
  states: ['Bihar', 'Jharkhand', 'Andaman & Nicobar Islands', 'Odisha', 'West Bengal'],
  districts: [
    { stateName: 'Bihar', districtName: 'Patna' }, { stateName: 'Bihar', districtName: 'Gaya' }, { stateName: 'Bihar', districtName: 'Muzaffarpur' }, { stateName: 'Bihar', districtName: 'Bhagalpur' }, { stateName: 'Bihar', districtName: 'Nalanda' },
    { stateName: 'Jharkhand', districtName: 'Ranchi' }, { stateName: 'Jharkhand', districtName: 'Jamshedpur' }, { stateName: 'Jharkhand', districtName: 'Dhanbad' },
    { stateName: 'Andaman & Nicobar Islands', districtName: 'South Andaman' }, { stateName: 'Andaman & Nicobar Islands', districtName: 'North and Middle Andaman' },
    { stateName: 'Odisha', districtName: 'Bhubaneswar' }, { stateName: 'Odisha', districtName: 'Cuttack' },
    { stateName: 'West Bengal', districtName: 'Kolkata' }, { stateName: 'West Bengal', districtName: 'Howrah' },
  ],
  orgs: [{ districtName: 'Patna', orgName: 'ICAR' }],
};

const SEASONS = ['Rabi', 'Kharif', 'Summer'];
const CROP_TYPES = ['Pulses', 'Oilseed'];

const DISCIPLINES = [
  { disciplineId: 1, disciplineName: 'Agronomy' }, { disciplineId: 2, disciplineName: 'Soil Science' }, { disciplineId: 3, disciplineName: 'Horticulture' },
  { disciplineId: 4, disciplineName: 'Plant breeding' }, { disciplineId: 5, disciplineName: 'Plant Protection' }, { disciplineId: 6, disciplineName: 'Entomology' },
  { disciplineId: 7, disciplineName: 'Plant Pathology' }, { disciplineId: 8, disciplineName: 'Home Science' }, { disciplineId: 9, disciplineName: 'Agricultural Engineering' },
  { disciplineId: 10, disciplineName: 'Agricultural Extension' }, { disciplineId: 11, disciplineName: 'Animal Science' }, { disciplineId: 12, disciplineName: 'Fisheries' },
  { disciplineId: 13, disciplineName: 'Other' },
];

const INFRA_MASTERS = [
  { infraMasterId: 1, name: 'Admin Building' }, { infraMasterId: 2, name: 'Farmers Hostel' }, { infraMasterId: 3, name: 'Staff Quarters' },
  { infraMasterId: 4, name: 'Piggery unit' }, { infraMasterId: 5, name: 'Fencing' }, { infraMasterId: 6, name: 'Rain Water harvesting structure' },
  { infraMasterId: 7, name: 'Threshing floor' }, { infraMasterId: 8, name: 'Farm godown' }, { infraMasterId: 9, name: 'Dairy unit' },
  { infraMasterId: 10, name: 'Poultry unit' }, { infraMasterId: 11, name: 'Goatery unit' }, { infraMasterId: 12, name: 'Mushroom Lab' },
  { infraMasterId: 13, name: 'Shade house' }, { infraMasterId: 14, name: 'Soil test Lab' }, { infraMasterId: 15, name: 'Others' },
];

const SANCTION_POSTS = [
  { sanctionedPostId: 1, postName: 'Senior Scientist & Head' }, { sanctionedPostId: 2, postName: 'SMS (Subject Matter Specialist)' },
  { sanctionedPostId: 3, postName: 'Programme Assistant (Lab Technician)' }, { sanctionedPostId: 4, postName: 'Programme Assistant (Computer)' },
  { sanctionedPostId: 5, postName: 'Farm Manager' }, { sanctionedPostId: 6, postName: 'Assistant' }, { sanctionedPostId: 7, postName: 'Stenographer' },
  { sanctionedPostId: 8, postName: 'Driver' }, { sanctionedPostId: 9, postName: 'Supporting staff' },
];

const SOIL_WATER_ANALYSIS = [
  'Soil', 'Water', 'Plant', 'Fertilizers', 'Manures', 'Food', 'Others (if any)'
];

const ARYA_ENTERPRISES = [
  "Pig Farming", "Banana Fibre Extraction", "Goat Farming", "Food Processing",
  "Lac Farming", "Mushroom Production", "Poultry Farming", "Quail Farming",
  "Duck Farming", "Fish Farming", "Bee keeping", "Processing and Value Addition(Product Name)",
  "Nursery Management", "Seed Production", "Others"
];

async function seedHierarchy() {
  console.log('🌱 Hierarchy (zone, states, districts, orgs)...');
  const zone = await prisma.zone.upsert({
    where: { zoneName: HIERARCHY.zoneName },
    update: {},
    create: { zoneName: HIERARCHY.zoneName },
  });
  const stateMap = {};
  for (const stateName of HIERARCHY.states) {
    let state = await prisma.stateMaster.findFirst({ where: { stateName, zoneId: zone.zoneId } });
    if (!state) state = await prisma.stateMaster.create({ data: { stateName, zoneId: zone.zoneId } });
    stateMap[stateName] = state;
  }
  for (const { stateName, districtName } of HIERARCHY.districts) {
    const state = stateMap[stateName];
    if (!state) continue;
    const existing = await prisma.districtMaster.findFirst({ where: { districtName, stateId: state.stateId } });
    if (!existing) await prisma.districtMaster.create({ data: { districtName, stateId: state.stateId, zoneId: zone.zoneId } });
  }
  for (const { districtName, orgName } of HIERARCHY.orgs) {
    const district = await prisma.districtMaster.findFirst({ where: { districtName } });
    if (!district) continue;
    const existing = await prisma.orgMaster.findFirst({ where: { orgName, districtId: district.districtId } });
    if (!existing) await prisma.orgMaster.create({ data: { orgName, districtId: district.districtId } });
  }
  console.log('   ✅ Done\n');
}

async function seedSeasonsAndCropTypes() {
  console.log('🌱 Seasons & crop types...');
  for (const seasonName of SEASONS) {
    await prisma.season.upsert({ where: { seasonName }, update: {}, create: { seasonName } });
  }
  for (const typeName of CROP_TYPES) {
    await prisma.cropType.upsert({ where: { typeName }, update: {}, create: { typeName } });
  }
  console.log('   ✅ Done\n');
}

async function seedDisciplines() {
  console.log('🌱 Disciplines...');
  for (const item of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { disciplineId: item.disciplineId },
      update: { disciplineName: item.disciplineName },
      create: { disciplineId: item.disciplineId, disciplineName: item.disciplineName },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedInfraMasters() {
  console.log('🌱 Infrastructure masters...');
  for (const item of INFRA_MASTERS) {
    await prisma.kvkInfrastructureMaster.upsert({
      where: { infraMasterId: item.infraMasterId },
      update: { name: item.name },
      create: { infraMasterId: item.infraMasterId, name: item.name },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedSanctionPosts() {
  console.log('🌱 Sanctioned posts...');
  for (const post of SANCTION_POSTS) {
    await prisma.sanctionedPost.upsert({
      where: { sanctionedPostId: post.sanctionedPostId },
      update: { postName: post.postName },
      create: { sanctionedPostId: post.sanctionedPostId, postName: post.postName },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedSoilWaterAnalysis() {
  console.log('🌱 Soil water analysis masters...');
  for (const name of SOIL_WATER_ANALYSIS) {
    // Note: upsert requires a unique field. analysisName is unique in the schema.
    await prisma.soilWaterAnalysis.upsert({
      where: { analysisName: name },
      update: {},
      create: { analysisName: name },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedAryaEnterprises() {
  console.log('🌱 ARYA enterprises...');
  for (const name of ARYA_ENTERPRISES) {
    try {
      const result = await prisma.$queryRaw`SELECT enterprise_id FROM enterprise_master WHERE enterprise_name = ${name}`;
      if (result.length === 0) {
        await prisma.$executeRaw`INSERT INTO enterprise_master (enterprise_name) VALUES (${name})`;
      }
    } catch (e) {
      try {
        await prisma.aryaEnterprise.upsert({
          where: { enterpriseName: name },
          update: {},
          create: { enterpriseName: name }
        });
      } catch (err) { }
    }
  }
  console.log('   ✅ Done\n');
}

async function run() {
  console.log('🌱 Seed data\n');
  await seedHierarchy();
  await seedSeasonsAndCropTypes();
  await seedDisciplines();
  await seedInfraMasters();
  await seedSanctionPosts();
  await seedSoilWaterAnalysis();
  await seedAryaEnterprises();
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = { run };
}
