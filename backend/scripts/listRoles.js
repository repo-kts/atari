const prisma = require('../config/prisma.js');

async function main() {
    try {
        const roles = await prisma.role.findMany();
        const names = roles.map(r => r.roleName);
        console.log('Role Names in DB:', names.join(', '));
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
