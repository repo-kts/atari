const prisma = require('../config/prisma');
async function main() {
    const users = await prisma.user.findMany({
        select: { userId: true, email: true, name: true, kvkId: true, roleId: true },
        orderBy: { kvkId: 'asc' },
    });
    console.log('\n=== ALL USERS & KVK ASSOCIATIONS ===');
    users.forEach(u => console.log(`  Email: ${u.email} | Name: ${u.name} | kvkId: ${u.kvkId} | roleId: ${u.roleId}`));

    const kvks = await prisma.kvk.findMany({
        select: { kvkId: true, kvkName: true },
        orderBy: { kvkId: 'asc' },
    });
    console.log('\n=== ALL KVKs ===');
    kvks.forEach(k => console.log(`  kvkId: ${k.kvkId} | ${k.kvkName}`));

    const roles = await prisma.role.findMany({
        select: { roleId: true, roleName: true, description: true },
        orderBy: { roleId: 'asc' },
    });
    console.log('\n=== ALL ROLES ===');
    roles.forEach(r => console.log(`  roleId: ${r.roleId} | ${r.roleName} | ${r.description}`));

    await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
