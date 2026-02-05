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
    const permissionIds = {};
    for (const action of PERMISSION_ACTIONS) {
      const existing = await prisma.permission.findFirst({
        where: {
          moduleId: module.moduleId,
          action,
        },
      });

      if (existing) {
        console.log(`⏭️  Permission ${action} for ${GLOBAL_MODULE_CODE} already exists (ID: ${existing.permissionId})`);
        permissionIds[action] = existing.permissionId;
      } else {
        const created = await prisma.permission.create({
          data: {
            moduleId: module.moduleId,
            action,
          },
        });
        console.log(`✅ Created permission: ${action} (ID: ${created.permissionId})`);
        permissionIds[action] = created.permissionId;
      }
    }

    // 3. Assign USER_SCOPE permissions to admin roles (for requirePermission role fallback)
    const adminRoleNames = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];
    const adminRoles = await prisma.role.findMany({
      where: { roleName: { in: adminRoleNames } },
      select: { roleId: true, roleName: true },
    });

    const foundRoleNames = adminRoles.map((r) => r.roleName);
    const missingRoles = adminRoleNames.filter((name) => !foundRoleNames.includes(name));

    if (missingRoles.length > 0) {
      console.warn(
        `⚠️  The following admin roles were not found in the database and will not receive USER_SCOPE permissions: ${missingRoles.join(
          ', ',
        )}`,
      );
      // Uncomment the next line if you prefer to fail hard instead of warning:
      // throw new Error(`Missing required admin roles: ${missingRoles.join(', ')}`);
    }

    for (const role of adminRoles) {
      for (const action of PERMISSION_ACTIONS) {
        const permissionId = permissionIds[action];
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.roleId, permissionId },
          },
          create: { roleId: role.roleId, permissionId },
          update: {},
        });
      }
      console.log(`✅ Assigned USER_SCOPE (VIEW, ADD, EDIT, DELETE) to role: ${role.roleName}`);
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
