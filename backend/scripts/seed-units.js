/**
 * Seeds the Unit master with common units of measure. Idempotent (upsert by the
 * unique unitName) — safe to re-run.
 *
 *   node scripts/seed-units.js
 */
const prisma = require('../config/prisma.js');

const UNITS = [
    'Kg',
    'Quintal',
    'Ton',
    'Number',
    'Nos',
    'Hectare',
    'Acre',
    'Litre',
    'Gram',
    'Packet',
];

async function main() {
    for (const unitName of UNITS) {
        await prisma.unit.upsert({
            where: { unitName },
            update: {},
            create: { unitName, isOther: false },
        });
    }
    // "Other" sentinel so forms can offer a free-text specify.
    await prisma.unit.upsert({
        where: { unitName: 'Other' },
        update: { isOther: true },
        create: { unitName: 'Other', isOther: true },
    });
    console.log(`Seeded ${UNITS.length + 1} units.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
