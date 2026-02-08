require('dotenv').config();
const prisma = require('../config/prisma');

/**
 * Assigns ALL permissions to the Super Admin role.
 * Super Admin should have full system access.
 */
async function seedSuperAdminPermissions() {
  console.log('🌱 Assigning all permissions to Super Admin...\n');

  try {
    // 1. Find super_admin role
    const superAdminRole = await prisma.role.findFirst({
      where: { roleName: 'super_admin' },
    });

    if (!superAdminRole) {
      console.error('❌ Super Admin role not found. Please run seed roles first.');
      process.exit(1);
    }

    console.log(`✅ Found Super Admin role (ID: ${superAdminRole.roleId})\n`);

    // 2. Get all permission IDs
    const allPermissions = await prisma.permission.findMany({
      select: { permissionId: true },
    });

    console.log(`📋 Found ${allPermissions.length} total permissions in the system\n`);

    // 3. Delete existing super_admin permissions (clean slate)
    await prisma.rolePermission.deleteMany({
      where: { roleId: superAdminRole.roleId },
    });

    console.log('🧹 Cleared existing Super Admin permissions\n');

    // 4. Assign all permissions to super_admin
    const data = allPermissions.map((p) => ({
      roleId: superAdminRole.roleId,
      permissionId: p.permissionId,
    }));

    const result = await prisma.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });

    console.log(`✨ Assigned ${result.count} permissions to Super Admin\n`);
    console.log('✅ Super Admin now has full system access!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdminPermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
