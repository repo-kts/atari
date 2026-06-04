require('dotenv').config();
const prisma = require('../config/prisma.js');

const PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];
const NEW_MODULES = [
  { menuName: 'All Masters', subMenuName: 'Impact Specific Area Master', moduleCode: 'all_masters_impact_area_master' },
  { menuName: 'All Masters', subMenuName: 'Enterprise Type Master', moduleCode: 'all_masters_enterprise_type_master' },
  { menuName: 'All Masters', subMenuName: 'Account Type Master', moduleCode: 'all_masters_account_type_master' },
  { menuName: 'All Masters', subMenuName: 'Programme Type Master', moduleCode: 'all_masters_programme_type_master' },
  { menuName: 'All Masters', subMenuName: 'PPV & FRA Training Type Master', moduleCode: 'all_masters_ppv_fra_training_type_master' },
  { menuName: 'All Masters', subMenuName: 'Dignitary Type Master', moduleCode: 'all_masters_dignitary_type_master' }
];

async function run() {
  console.log('Adding specific target modules fast...');
  
  let newModuleIds = [];
  
  // 1. Create missing modules
  for (const mod of NEW_MODULES) {
    let m = await prisma.module.findUnique({ where: { moduleCode: mod.moduleCode } });
    if (!m) {
      m = await prisma.module.create({ data: mod });
      console.log('Created module', mod.moduleCode);
    }
    
    // Create permissions
    for (const action of PERMISSION_ACTIONS) {
      const existing = await prisma.permission.findFirst({ where: { moduleId: m.moduleId, action } });
      if (!existing) {
        await prisma.permission.create({ data: { moduleId: m.moduleId, action } });
      }
    }
  }

  // 2. Grant them to zone_admin, state_admin, kvk_admin, kvk_user
  const roles = await prisma.role.findMany({
    where: { roleName: { in: ['super_admin', 'zone_admin', 'state_admin', 'kvk_admin', 'kvk_user'] } }
  });
  
  const perms = await prisma.permission.findMany({
    where: { module: { moduleCode: { in: NEW_MODULES.map(m => m.moduleCode) } } }
  });
  
  const permissionIds = perms.map(p => p.permissionId);
  
  console.log(`Giving ${permissionIds.length} permissions to roles...`);
  
  for (const role of roles) {
    // skip super_admin if we want or just add it
    for (const pid of permissionIds) {
      const existingRP = await prisma.rolePermission.findFirst({
        where: { roleId: role.roleId, permissionId: pid }
      });
      if (!existingRP) {
        await prisma.rolePermission.create({
          data: { roleId: role.roleId, permissionId: pid }
        });
      }
    }
    console.log(`Added permissions for ${role.roleName}`);
  }
  
  console.log('Done!');
}

run().finally(() => prisma.$disconnect());
