const prisma = require('./config/prisma.js');

async function test() {
    try {
        const roles = await prisma.role.findMany();
        roles.forEach(r => console.log(`ID: ${r.roleId}, Name: ${r.roleName}`));
    } finally {
        await prisma.$disconnect();
    }
}

test();
