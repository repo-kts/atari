#!/usr/bin/env node
/**
 * Run all seeds in order: roles → permissions → users → seed-data.
 * Usage: node scripts/seed.js   or   npm run seed
 */
require('dotenv').config();
const prisma = require('../config/prisma');
const { run: seedRoles } = require('./roles.js');
const { run: seedPermissions } = require('./permissions.js');
const { run: seedUsers } = require('./users.js');
const { run: seedData } = require('./seed-data.js');

async function run() {
  console.log('\n🌱 Seed (all)\n');
  await seedRoles();
  await seedPermissions();
  await seedUsers();
  await seedData();
  console.log('✅ Seed completed.\n');
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
