const prisma = require('./config/prisma.js');

async function main() {
  try {
    const types = await prisma.nutritionGardenType.findMany();
    console.log('NutritionGardenTypes in DB:', JSON.stringify(types, null, 2));

    const categories = await prisma.cropCategory.findMany();
    console.log('CropCategories in DB:', JSON.stringify(categories, null, 2));
  } catch (err) {
    console.error('Error:', err);
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
