const prisma = require('../config/prisma.js');

async function main() {
    try {
        const s_columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'scientist_award';
    `);
        const f_columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'farmer_award';
    `);
        console.log('Columns in scientist_award:', JSON.stringify(s_columns, null, 2));
        console.log('Columns in farmer_award:', JSON.stringify(f_columns, null, 2));
    } catch (error) {
        console.error('Error fetching columns:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
