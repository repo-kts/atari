#!/usr/bin/env node
/**
 * Seed ONLY the CFLD budget item master (table: budget_item).
 * Idempotent upsert — safe to re-run, does not touch other data.
 * Run: node scripts/seed-cfld-budget-items.js   or   npm run seed:budget-items
 */
require('dotenv').config();
const prisma = require('../config/prisma.js');

const CFLD_BUDGET_ITEM_MASTER = [
    'Critical Input',
    'TA/DA',
    'Extension Activities',
    'Publication',
];

async function main() {
    console.log('🌱 Seeding CFLD budget item master...');
    for (const itemName of CFLD_BUDGET_ITEM_MASTER) {
        await prisma.budgetItem.upsert({
            where: { itemName },
            update: {},
            create: { itemName },
        });
        console.log(`   ✅ ${itemName}`);
    }
    const count = await prisma.budgetItem.count();
    console.log(`   Done. budget_item rows: ${count}\n`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
