#!/usr/bin/env node
/**
 * Run all seeds in order: roles → permissions → users → seed-data → masters → years.
 * Usage: node scripts/seed.js   or   npm run seed
 */
require('dotenv').config();
const prisma = require('../config/prisma.js');
const { run: seedRoles } = require('./roles.js');
const { run: seedPermissions } = require('./permissions.js');
const { run: seedUsers } = require('./users.js');
const { run: seedData } = require('./seed-data.js');
const { run: seedMasters } = require('./seed-masters.js');
const { run: seedYears } = require('./seed-years.js');

async function run() {
  console.log('\n🌱 Seed (all masters and basic data)\n');
  await seedRoles();
  await seedPermissions();
  await seedUsers();
  await seedData();
  await seedMasters();
  await seedYears();
  console.log('✅ Seed completed.\n');
}

run()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
