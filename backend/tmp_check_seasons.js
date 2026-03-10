const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const seasons = await prisma.season.findMany();
    console.log('Seasons:', JSON.stringify(seasons, null, 2));
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
