const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'backend/.env' });

const prisma = new PrismaClient();

async function main() {
    try {
        const types = await prisma.nutritionGardenType.findMany();
        console.log('NutritionGardenTypes:', JSON.stringify(types, null, 2));
        
        const categories = await prisma.cropCategory.findMany();
        console.log('CropCategories:', JSON.stringify(categories, null, 2));
        
        const activities = await prisma.fldActivity.findMany({ take: 5 });
        console.log('FldActivities (Sample):', JSON.stringify(activities, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
