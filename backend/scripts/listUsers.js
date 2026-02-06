require('dotenv').config();
const prisma = require('../config/prisma');

async function main() {
    try {
        const users = await prisma.user.findMany({
            include: { role: true }
        });
        console.log('\n--- SYSTEM USERS ---');
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            users.forEach(u => {
                console.log(`\nUser: ${u.name}`);
                console.log(`Email: ${u.email}`);
                console.log(`Role: ${u.role?.roleName}`);
            });
        }
        console.log('\n--------------------\n');
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
