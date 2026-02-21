#!/usr/bin/env node
/**
 * Seed role definitions only.
 * Run: node scripts/roles.js   or   npm run seed:roles
 */
require('dotenv').config();
const prisma = require('../config/prisma');

const ROLES = [
  { roleName: 'super_admin', description: 'Super Administrator - Full system access' },
  { roleName: 'zone_admin', description: 'Zone Administrator' },
  { roleName: 'state_admin', description: 'State Administrator' },
  { roleName: 'district_admin', description: 'District Administrator' },
  { roleName: 'org_admin', description: 'Organization Administrator' },
  { roleName: 'kvk_admin', description: 'KVK Administrator' },
  { roleName: 'kvk_user', description: 'KVK User - Access by custom permissions only' },
  { roleName: 'state_user', description: 'State-level user' },
  { roleName: 'district_user', description: 'District-level user' },
  { roleName: 'org_user', description: 'Organization-level user' },
];

async function run() {
  console.log('🌱 Roles\n');
  for (const role of ROLES) {
    const existing = await prisma.role.findFirst({ where: { roleName: role.roleName } });
    if (!existing) {
      await prisma.role.create({ data: role });
      console.log(`   ✅ ${role.roleName}`);
    }
  }
  console.log('');
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = { run };
}
