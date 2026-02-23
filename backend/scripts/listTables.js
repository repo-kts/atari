const prisma = require('../config/prisma.js');

async function main() {
    try {
        const tables = await prisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    `);
        console.log('Tables in DB:', JSON.stringify(tables, null, 2));
    } catch (error) {
        console.error('Error fetching tables:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
