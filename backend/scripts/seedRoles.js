require('dotenv').config();
const prisma = require('../config/prisma');

/**
 * Seed initial roles in the database
 * Roles: super_admin, zone_admin, state_admin, district_admin, org_admin, kvk
 */
async function seedRoles() {
  console.log('🌱 Starting role seeding...\n');

  const roles = [
    {
      roleName: 'super_admin',
      description: 'Super Administrator - Full system access, can create users at all hierarchy levels',
    },
    {
      roleName: 'zone_admin',
      description: 'Zone Administrator - Manages users and data within assigned zone',
    },
    {
      roleName: 'state_admin',
      description: 'State Administrator - Manages users and data within assigned state',
    },
    {
      roleName: 'district_admin',
      description: 'District Administrator - Manages users and data within assigned district',
    },
    {
      roleName: 'org_admin',
      description: 'Organization Administrator - Manages users and data within assigned organization',
    },
    {
      roleName: 'kvk',
      description: 'KVK User - Can view and edit own KVK data (custom permissions)',
    },
    {
      roleName: 'state_user',
      description: 'State-level user - No admin rights; access by custom permissions only, scoped to state',
    },
    {
      roleName: 'district_user',
      description: 'District-level user - No admin rights; access by custom permissions only, scoped to district',
    },
    {
      roleName: 'org_user',
      description: 'Organization-level user - No admin rights; access by custom permissions only, scoped to org',
    },
  ];

  try {
    for (const role of roles) {
      // Check if role already exists
      const existingRole = await prisma.role.findFirst({
        where: { roleName: role.roleName },
      });

      if (existingRole) {
        console.log(`⏭️  Role "${role.roleName}" already exists, skipping...`);
      } else {
        const created = await prisma.role.create({
          data: role,
        });
        console.log(`✅ Created role: ${created.roleName} (ID: ${created.roleId})`);
      }
    }

    console.log('\n✨ Role seeding completed successfully!\n');

    // Display all roles
    const allRoles = await prisma.role.findMany({
      orderBy: { roleId: 'asc' },
    });

    console.log('📋 Current roles in database:');
    console.log('─'.repeat(60));
    allRoles.forEach((role) => {
      console.log(`  ${role.roleId}. ${role.roleName} - ${role.description || 'No description'}`);
    });
    console.log('─'.repeat(60));
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedRoles()
  .then(() => {
    console.log('\n🎉 Seed script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
