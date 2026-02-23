const prisma = require('../config/prisma.js');

async function main() {
    try {
        const years = await prisma.$queryRawUnsafe(`
        SELECT * FROM year_master;
    `);
        console.log('Years in year_master:', JSON.stringify(years, null, 2));
    } catch (error) {
        console.error('Error fetching years:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
