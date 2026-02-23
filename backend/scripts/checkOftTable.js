const prisma = require('../config/prisma.js');

async function main() {
    try {
        const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'kvk_oft';
    `);
        console.log('Columns in kvk_oft:', JSON.stringify(columns, null, 2));
    } catch (error) {
        console.error('Error fetching columns:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
