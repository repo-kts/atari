require('dotenv').config();
const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');
const readline = require('readline');

/**
 * Seed super admin user
 * This script creates the first super admin user in the database
 * 
 * Usage:
 *   node scripts/seedSuperAdmin.js
 *   SUPER_ADMIN_EMAIL=admin@example.com SUPER_ADMIN_PASSWORD=SecurePass123 node scripts/seedSuperAdmin.js
 */
async function seedSuperAdmin() {
  console.log('🌱 Starting super admin seeding...\n');

  // Get configuration from environment or use defaults
<<<<<<< HEAD
=======
  // user@atari.com
  // User@123
>>>>>>> my-merged-work
  const defaultEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@atari.gov.in';
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const defaultName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

  try {
    // Check if super_admin role exists
    const superAdminRole = await prisma.role.findFirst({
      where: { roleName: 'super_admin' },
    });

    if (!superAdminRole) {
      console.error('❌ Error: super_admin role does not exist!');
      console.log('💡 Please run "npm run seed:roles" first to create roles.\n');
      process.exit(1);
    }

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        roleId: superAdminRole.roleId,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (existingSuperAdmin) {
      console.log('⏭️  Super admin user already exists:');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   User ID: ${existingSuperAdmin.userId}\n`);
<<<<<<< HEAD
      
=======

>>>>>>> my-merged-work
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve, reject) => {
        rl.question('Do you want to create another super admin? (y/N): ', async (answer) => {
          rl.close();
<<<<<<< HEAD
          
=======

>>>>>>> my-merged-work
          if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('✨ Skipping super admin creation.\n');
            resolve();
            return;
          }

          // Continue with creation
          try {
            await createSuperAdmin(defaultEmail, defaultPassword, defaultName, superAdminRole.roleId);
            resolve()
<<<<<<< HEAD
          } catch(err) {
=======
          } catch (err) {
>>>>>>> my-merged-work
            reject(err)
          }
        });
      });
    }

    // No super admin exists, create one
    await createSuperAdmin(defaultEmail, defaultPassword, defaultName, superAdminRole.roleId);

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Create super admin user
 */
async function createSuperAdmin(email, password, name, roleId) {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`❌ Error: User with email "${email}" already exists!`);
      console.log('💡 Please use a different email or delete the existing user.\n');
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        roleId,
        // Super admin doesn't need hierarchy assignment
        zoneId: null,
        stateId: null,
        districtId: null,
        orgId: null,
        kvkId: null,
      },
      include: {
        role: true,
      },
    });

    console.log('\n✅ Super admin created successfully!');
    console.log('─'.repeat(60));
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role.roleName}`);
    console.log('─'.repeat(60));
    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

// Run the seed function
seedSuperAdmin()
  .then(() => {
    console.log('🎉 Seed script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
