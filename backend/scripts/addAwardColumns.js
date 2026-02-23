const prisma = require('../config/prisma.js');

async function main() {
    try {
        console.log('Adding columns to kvk_award...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE kvk_award ADD COLUMN IF NOT EXISTS reporting_year INTEGER;
    `);

        console.log('Adding columns to scientist_award...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE scientist_award ADD COLUMN IF NOT EXISTS reporting_year INTEGER;
      ALTER TABLE scientist_award ADD COLUMN IF NOT EXISTS head_scientist TEXT;
    `);

        console.log('Adding columns to farmer_award...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE farmer_award ADD COLUMN IF NOT EXISTS reporting_year INTEGER;
      ALTER TABLE farmer_award ADD COLUMN IF NOT EXISTS image TEXT;
    `);

        console.log('All columns added successfully!');
    } catch (error) {
        console.error('Error adding columns:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
