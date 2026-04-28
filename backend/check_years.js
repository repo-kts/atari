const prisma = require('./config/prisma.js');

async function main() {
    try {
        const years = await prisma.yearMaster.findMany();
        console.log('Years in DB:', JSON.stringify(years, null, 2));
    } catch (err) {
        console.error('Error fetching years:', err);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
