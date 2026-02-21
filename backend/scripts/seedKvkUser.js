require('dotenv').config();
const prisma = require('../config/prisma.js');
const { hashPassword } = require('../utils/password');

/**
 * Seed KVK User
 * This script ensures necessary hierarchy exists (Zone -> State -> District -> Org -> KVK)
 * and creates a KVK user assigned to that KVK.
 * 
 * Usage:
 *   node scripts/seedKvkUser.js
 */

async function seedKvkUser() {
    console.log('🌱 Starting KVK User seeding...\n');

    try {
        // 1. Get KVK Role
        const kvkRole = await prisma.role.findFirst({
            where: { roleName: 'kvk' },
        });

        if (!kvkRole) {
            console.error('❌ Error: "kvk" role does not exist!');
            console.log('💡 Please run "npm run seed:roles" first.\n');
            process.exit(1);
        }

        // 2. Ensure Hierarchy Exists (Zone -> State -> District -> Org)
        console.log('🏗️  Verifying hierarchy data...');

        // Zone
        let zone = await prisma.zone.findFirst({ where: { zoneName: 'Test Zone' } });
        if (!zone) {
            zone = await prisma.zone.create({ data: { zoneName: 'Test Zone' } });
            console.log(`   ✅ Created Test Zone (ID: ${zone.zoneId})`);
        } else {
            console.log(`   ℹ️  Using existing Test Zone (ID: ${zone.zoneId})`);
        }

        // State (Linked to Zone)
        let state = await prisma.stateMaster.findFirst({
            where: { stateName: 'Test State', zoneId: zone.zoneId }
        });
        if (!state) {
            state = await prisma.stateMaster.create({
                data: { stateName: 'Test State', zoneId: zone.zoneId }
            });
            console.log(`   ✅ Created Test State (ID: ${state.stateId})`);
        } else {
            console.log(`   ℹ️  Using existing Test State (ID: ${state.stateId})`);
        }

        // District (Linked to State & Zone)
        let district = await prisma.districtMaster.findFirst({
            where: { districtName: 'Test District', stateId: state.stateId }
        });
        if (!district) {
            district = await prisma.districtMaster.create({
                data: {
                    districtName: 'Test District',
                    stateId: state.stateId,
                    zoneId: zone.zoneId
                }
            });
            console.log(`   ✅ Created Test District (ID: ${district.districtId})`);
        } else {
            console.log(`   ℹ️  Using existing Test District (ID: ${district.districtId})`);
        }

        // Organization (Linked to District)
        let org = await prisma.orgMaster.findFirst({
            where: { orgName: 'Test University', districtId: district.districtId }
        });
        if (!org) {
            org = await prisma.orgMaster.create({
                data: {
                    orgName: 'Test University',
                    districtId: district.districtId,
                }
            });
            console.log(`   ✅ Created Test Organization (ID: ${org.orgId})`);
        } else {
            console.log(`   ℹ️  Using existing Test Organization (ID: ${org.orgId})`);
        }

        // 3. Ensure KVK Exists
        const kvkName = 'Test KVK 1';
        let kvk = await prisma.kvk.findFirst({ where: { kvkName } });

        if (!kvk) {
            kvk = await prisma.kvk.create({
                data: {
                    kvkName,
                    zoneId: zone.zoneId,
                    stateId: state.stateId,
                    districtId: district.districtId,
                    orgId: org.orgId,
                    hostOrg: 'Test Host Org',
                    mobile: '9876543210',
                    email: 'testkvk@atari.gov.in',
                    address: 'Test Address, Test District',
                    yearOfSanction: 2024
                }
            });
            console.log(`   ✅ Created Test KVK (ID: ${kvk.kvkId})`);
        } else {
            console.log(`   ℹ️  Using existing Test KVK (ID: ${kvk.kvkId})`);
        }

        // 4. Create KVK User
        // CREDNTIALS
        const userEmail = 'kvkuser@atari.gov.in';
        const userPassword = 'KvkUser@123';
        const userName = 'Test KVK User';

        const existingUser = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { role: true }
        });

        if (existingUser) {
            console.log('\nusers already exists:');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Role: ${existingUser.role.roleName}`);
            // If exists, checks if it is linked to KVK.
            if (existingUser.kvkId !== kvk.kvkId) {
                console.log(`   ⚠️  User exists but linked to different KVK (ID: ${existingUser.kvkId}). Updating...`);
            }

            // Allow password reset if already exists (for dev convenience)
            const passwordHash = await hashPassword(userPassword);
            await prisma.user.update({
                where: { userId: existingUser.userId },
                data: {
                    kvkId: kvk.kvkId,
                    passwordHash: passwordHash
                }
            });
            console.log(`   ✅ User updated/relinked to Test KVK with fresh password.`);
            return;
        }

        console.log('\n👤 Creating KVK User...');
        const passwordHash = await hashPassword(userPassword);

        const newUser = await prisma.user.create({
            data: {
                name: userName,
                email: userEmail,
                passwordHash,
                roleId: kvkRole.roleId,
                kvkId: kvk.kvkId, // Link to KVK
                // Denormalized hierarchy fields if needed by application logic, though often inferred from KVK
                // Usually user model might duplicate them for easier queries, or rely on kvk linkage.
                // Checking seedSuperAdmin.js: `kvkId: null` etc.
                // Zone, State, District, Org fields on User model?
                // `zone_schema.prisma` shows `users User[]`.
                // So User has `zoneId`, `stateId` etc.
                // It is good practice to populate them for KVK user to match the KVK's location.
                zoneId: zone.zoneId,
                stateId: state.stateId,
                districtId: district.districtId,
                orgId: org.orgId,
            },
            include: {
                role: true
            }
        });

        console.log('\n✅ KVK User created successfully!');
        console.log('─'.repeat(40));
        console.log(`   Name: ${newUser.name}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Role: ${newUser.role.roleName}`);
        console.log(`   KVK ID: ${newUser.kvkId}`);
        console.log('─'.repeat(40));
        console.log('\n📝 Login Credentials:');
        console.log(`   Email: ${userEmail}`);
        console.log(`   Password: ${userPassword}`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error seeding KVK user:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedKvkUser();
