require('dotenv').config({ path: 'backend/.env' });
const prisma = require('./backend/config/prisma');

async function main() {
    try {
        const types = await prisma.nutritionGardenType.findMany();
        console.log('NutritionGardenTypes:', JSON.stringify(types, null, 2));
        
        const categories = await prisma.cropCategory.findMany();
        console.log('CropCategories:', JSON.stringify(categories, null, 2));
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
