const prisma = require('../config/prisma.js');

async function main() {
    try {
        const records = await prisma.$queryRawUnsafe(`
        SELECT reporting_year FROM kvk_oft LIMIT 5;
    `);
        console.log('Reporting years in kvk_oft:', JSON.stringify(records, null, 2));
    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
