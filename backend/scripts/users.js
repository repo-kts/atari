#!/usr/bin/env node
/**
 * Seed users: Super Admin and optional KVK user.
 * Env: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME (optional)
 * Run: node scripts/users.js   or   npm run seed:users
 */
require('dotenv').config();
const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');

async function seedSuperAdmin() {
  console.log('🌱 Super Admin user...');
  const superAdminRole = await prisma.role.findFirst({ where: { roleName: 'super_admin' } });
  if (!superAdminRole) throw new Error('super_admin role not found. Run scripts/roles.js first.');
  const existing = await prisma.user.findFirst({ where: { roleId: superAdminRole.roleId, deletedAt: null } });
  if (existing) {
    console.log(`   ⏭️  Already exists: ${existing.email}\n`);
    return;
  }
  const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@atari.gov.in').toLowerCase().trim();
  const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const name = process.env.SUPER_ADMIN_NAME || 'Super Administrator';
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error(`User with email ${email} already exists. Use different SUPER_ADMIN_EMAIL.`);
  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, roleId: superAdminRole.roleId, zoneId: null, stateId: null, districtId: null, orgId: null, kvkId: null },
  });
  console.log(`   ✅ Created: ${email}\n`);
}

async function seedKvkUser() {
  console.log('🌱 KVK user (sample)...');
  const kvkRole = await prisma.role.findFirst({ where: { roleName: 'kvk_admin' } });
  if (!kvkRole) { console.log('   ⏭️  kvk_admin role not found, skipping.\n'); return; }

  let zone = await prisma.zone.findFirst({ where: { zoneName: 'Test Zone' } });
  if (!zone) zone = await prisma.zone.create({ data: { zoneName: 'Test Zone' } });

  let state = await prisma.stateMaster.findFirst({ where: { stateName: 'Test State', zoneId: zone.zoneId } });
  if (!state) state = await prisma.stateMaster.create({ data: { stateName: 'Test State', zoneId: zone.zoneId } });

  let district = await prisma.districtMaster.findFirst({ where: { districtName: 'Test District', stateId: state.stateId } });
  if (!district) district = await prisma.districtMaster.create({ data: { districtName: 'Test District', stateId: state.stateId, zoneId: zone.zoneId } });

  let org = await prisma.orgMaster.findFirst({ where: { orgName: 'Test University', districtId: district.districtId } });
  if (!org) org = await prisma.orgMaster.create({ data: { orgName: 'Test University', districtId: district.districtId } });

  const kvkName = 'Test KVK 1';
  let kvk = await prisma.kvk.findFirst({ where: { kvkName } });
  if (!kvk) {
    kvk = await prisma.kvk.create({
      data: {
        kvkName, zoneId: zone.zoneId, stateId: state.stateId, districtId: district.districtId, orgId: org.orgId,
        hostOrg: 'Test Host Org', mobile: '9876543210', email: 'testkvk@atari.gov.in', address: 'Test Address', yearOfSanction: 2024,
      },
    });
  }

  const userEmail = 'kvkuser@atari.gov.in';
  const existingUser = await prisma.user.findUnique({ where: { email: userEmail }, include: { role: true } });
  if (existingUser) {
    if (existingUser.kvkId !== kvk.kvkId) {
      const roleName = existingUser.role?.roleName || 'unknown';
      console.log(`   ⚠️  User ${userEmail} (role: ${roleName}) is linked to kvkId=${existingUser.kvkId}, expected kvkId=${kvk.kvkId}.`);
      if (process.env.FORCE_RELINK === 'true') {
        await prisma.user.update({ where: { userId: existingUser.userId }, data: { kvkId: kvk.kvkId } });
        console.log('   ✅ User relinked to Test KVK.');
      } else {
        console.log('   ⏭️  Skipped relink. Set FORCE_RELINK=true to override.');
      }
    } else console.log('   ⏭️  Already exists: ' + userEmail);
    console.log('');
    return;
  }

  const passwordHash = await hashPassword('KvkUser@123');
  await prisma.user.create({
    data: {
      name: 'Test KVK User', email: userEmail, passwordHash, roleId: kvkRole.roleId, kvkId: kvk.kvkId,
      zoneId: zone.zoneId, stateId: state.stateId, districtId: district.districtId, orgId: org.orgId,
    },
  });
  console.log(`   ✅ Created: ${userEmail}\n`);
}

async function run() {
  console.log('🌱 Users\n');
  await seedSuperAdmin();
  await seedKvkUser();
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = { run };
}
