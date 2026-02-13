require('dotenv').config();
const prisma = require('../config/prisma');

/**
 * Fix state_admin permissions - ensure they have USER_SCOPE permissions
 * This script is safe to run multiple times (uses upsert)
 */
async function fixStateAdminPermissions() {
  console.log('🔧 Fixing state_admin permissions for USER_SCOPE...\n');

  try {
    // 1. Check if state_admin role exists
    const stateAdminRole = await prisma.role.findFirst({
      where: { roleName: 'state_admin' },
    });

    if (!stateAdminRole) {
      console.error('❌ state_admin role not found in database!');
      console.log('💡 Please run: npm run seed:roles\n');
      process.exit(1);
    }

    console.log(`✅ Found state_admin role (ID: ${stateAdminRole.roleId})`);

    // 2. Check if USER_SCOPE module exists, create if not
    let userScopeModule = await prisma.module.findUnique({
      where: { moduleCode: 'USER_SCOPE' },
    });

    if (!userScopeModule) {
      console.log('📦 USER_SCOPE module not found, creating...');
      userScopeModule = await prisma.module.create({
        data: {
          menuName: 'User scope',
          subMenuName: 'Granular permissions',
          moduleCode: 'USER_SCOPE',
        },
      });
      console.log(`✅ Created USER_SCOPE module (ID: ${userScopeModule.moduleId})`);
    } else {
      console.log(`✅ USER_SCOPE module exists (ID: ${userScopeModule.moduleId})`);
    }

    // 3. Create permissions for USER_SCOPE if they don't exist
    const actions = ['VIEW', 'ADD', 'EDIT', 'DELETE'];
    const permissionIds = [];

    for (const action of actions) {
      // Check if permission already exists
      let permission = await prisma.permission.findFirst({
        where: {
          moduleId: userScopeModule.moduleId,
          action: action,
        },
      });

      // Create if it doesn't exist
      if (!permission) {
        permission = await prisma.permission.create({
          data: {
            moduleId: userScopeModule.moduleId,
            action: action,
          },
        });
        console.log(`✅ Created permission ${action} (ID: ${permission.permissionId})`);
      } else {
        console.log(`✅ Permission ${action} already exists (ID: ${permission.permissionId})`);
      }

      permissionIds.push(permission.permissionId);
    }

    // 4. Check current permissions for state_admin
    console.log('\n📋 Checking current state_admin permissions for USER_SCOPE...');
    const currentPermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: stateAdminRole.roleId,
        permission: {
          moduleId: userScopeModule.moduleId,
        },
      },
      include: {
        permission: true,
      },
    });

    console.log(`   Currently has ${currentPermissions.length} permissions`);
    if (currentPermissions.length > 0) {
      currentPermissions.forEach((rp) => {
        console.log(`   - ${rp.permission.action}`);
      });
    }

    // 5. Grant all USER_SCOPE permissions to state_admin
    console.log('\n🔐 Granting USER_SCOPE permissions to state_admin...');
    let grantedCount = 0;

    for (const permissionId of permissionIds) {
      const result = await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: stateAdminRole.roleId,
            permissionId: permissionId,
          },
        },
        update: {},
        create: {
          roleId: stateAdminRole.roleId,
          permissionId: permissionId,
        },
      });
      grantedCount++;
    }

    console.log(`✅ Granted ${grantedCount} permissions to state_admin`);

    // 6. Verify the fix
    console.log('\n✨ Verifying permissions...');
    const verifyPermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: stateAdminRole.roleId,
        permission: {
          moduleId: userScopeModule.moduleId,
        },
      },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          action: 'asc',
        },
      },
    });

    console.log('\n📊 state_admin now has the following USER_SCOPE permissions:');
    console.log('─'.repeat(60));
    verifyPermissions.forEach((rp) => {
      console.log(`   ✓ ${rp.permission.action}`);
    });
    console.log('─'.repeat(60));

    // 7. Also grant to other admin roles if needed
    console.log('\n🔄 Checking other admin roles...');
    const adminRoleNames = ['zone_admin', 'district_admin', 'org_admin'];
    
    for (const roleName of adminRoleNames) {
      const role = await prisma.role.findFirst({
        where: { roleName },
      });

      if (role) {
        for (const permissionId of permissionIds) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.roleId,
                permissionId: permissionId,
              },
            },
            update: {},
            create: {
              roleId: role.roleId,
              permissionId: permissionId,
            },
          });
        }
        console.log(`   ✅ ${roleName} permissions updated`);
      }
    }

    console.log('\n✅ All done! state_admin can now access /api/admin/users and /api/admin/roles');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server if it\'s running');
    console.log('   2. Clear any cached tokens (logout and login again)');
    console.log('   3. Test accessing the User Management page\n');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixStateAdminPermissions()
  .then(() => {
    console.log('🎉 Fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });
