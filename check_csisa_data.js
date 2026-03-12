const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const records = await prisma.csisa.findMany({
            include: {
                kvk: { select: { kvkName: true } },
                season: { select: { seasonName: true } }
            }
        });
        console.log(`CSISA records count: ${records.length}`);
        if (records.length > 0) {
            console.log('Sample record (first one):');
            console.log(JSON.stringify(records[0], null, 2));
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
