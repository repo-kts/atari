require('dotenv').config({ path: 'backend/.env' });
const prisma = require('./backend/config/prisma');

const NARI_NUTRITION_GARDEN_TYPES = [
  'Backyard/Kitchen Garden', 'Community level', 'Terrace Garden', 'Vertical Garden'
];

const NARI_CROP_CATEGORIES = [
  'Fruits', 'Vegetables', 'Pulses', 'Oilseeds', 'Cereals', 'Other'
];

async function main() {
    console.log('🌱 Adding NARI-specific labels only...');
    try {
        for (const name of NARI_NUTRITION_GARDEN_TYPES) {
            await prisma.nutritionGardenType.upsert({
                where: { name },
                update: {},
                create: { name }
            });
            console.log(`   Added Garden Type: ${name}`);
        }

        for (const name of NARI_CROP_CATEGORIES) {
            await prisma.cropCategory.upsert({
                where: { name },
                update: {},
                create: { name }
            });
            console.log(`   Added Crop Category: ${name}`);
        }
        console.log('✅ NARI labels added successfully.');
    } catch (err) {
        console.error('❌ Error adding NARI labels:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
