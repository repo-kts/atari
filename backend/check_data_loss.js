const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const trainingStatuses = await prisma.$queryRawUnsafe(`SELECT "status" FROM "nari_training_programme" WHERE "status" IS NOT NULL`);
    const valueAdditionStatuses = await prisma.$queryRawUnsafe(`SELECT "status" FROM "nari_value_addition" WHERE "status" IS NOT NULL`);
    
    console.log('Training Program Statuses (Current):', trainingStatuses);
    console.log('Value Addition Statuses (Current):', valueAdditionStatuses);
    
  } catch (error) {
    console.error('Error fetching current data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
