require('dotenv').config();
const prisma = require('../config/prisma');

const GLOBAL_MODULE_CODE = 'USER_SCOPE';
const PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];

/**
 * Seed the "global" module and four Permission rows (VIEW, ADD, EDIT, DELETE)
 * used for granular user-level permissions when admins create users.
 */
async function seedGlobalPermissions() {
  console.log('🌱 Seeding global module and permissions...\n');

  try {
    // 1. Create or get the global module
    let module = await prisma.module.findUnique({
      where: { moduleCode: GLOBAL_MODULE_CODE },
    });

    if (!module) {
      module = await prisma.module.create({
        data: {
          menuName: 'User scope',
          subMenuName: 'Granular permissions',
          moduleCode: GLOBAL_MODULE_CODE,
        },
      });
      console.log(`✅ Created module: ${module.moduleCode} (ID: ${module.moduleId})`);
    } else {
      console.log(`⏭️  Module "${GLOBAL_MODULE_CODE}" already exists (ID: ${module.moduleId})`);
    }

    // 2. Create the four Permission rows (VIEW, ADD, EDIT, DELETE) for this module
    for (const action of PERMISSION_ACTIONS) {
      const existing = await prisma.permission.findFirst({
        where: {
          moduleId: module.moduleId,
          action,
        },
      });

      if (existing) {
        console.log(`⏭️  Permission ${action} for ${GLOBAL_MODULE_CODE} already exists (ID: ${existing.permissionId})`);
      } else {
        const created = await prisma.permission.create({
          data: {
            moduleId: module.moduleId,
            action,
          },
        });
        console.log(`✅ Created permission: ${action} (ID: ${created.permissionId})`);
      }
    }

    console.log('\n✨ Global permissions seeding completed.\n');
  } catch (error) {
    console.error('❌ Error seeding global permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGlobalPermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
