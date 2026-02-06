require('dotenv').config();
const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');

async function seedTestUser() {
    console.log('🌱 Seeding test user...');

    try {
        const role = await prisma.role.findFirst({
            where: { roleName: 'kvk' }
        });

        if (!role) {
            console.log('KVK role not found. Run npm run seed:roles first.');
            return;
        }

        const email = 'user@atari.com';
        const password = 'User@123';
        const passwordHash = await hashPassword(password);

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                name: 'Test User',
                email,
                passwordHash,
                roleId: role.roleId,
            },
        });

        console.log(`✅ User created/updated:`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: ${role.roleName}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestUser();
