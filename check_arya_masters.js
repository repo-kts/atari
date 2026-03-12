const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const enterprises = await prisma.enterprise.count();
        console.log(`ARYA Enterprises count: ${enterprises}`);
        
        const seasons = await prisma.season.count();
        console.log(`Seasons count: ${seasons}`);
        
        const years = await prisma.yearMaster.count();
        console.log(`Years count: ${years}`);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
