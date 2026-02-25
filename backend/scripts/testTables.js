const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const tables = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log(tables.map(t => t.table_name));
}

check().catch(console.error).finally(() => prisma.$disconnect());
