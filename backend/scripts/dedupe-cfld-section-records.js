/**
 * De-dupe CFLD section records so we can enforce @@unique([cfldTechId])
 * without using raw SQL.
 *
 * Strategy: for each section table, keep the most recently updated record
 * per cfldTechId and delete the rest.
 */

const prisma = require('../config/prisma.js');

async function dedupeTable({ model, idField }) {
  const rows = await prisma[model].findMany({
    select: { [idField]: true, cfldTechId: true, updatedAt: true, createdAt: true },
    orderBy: [{ cfldTechId: 'asc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
  });

  const keepByTech = new Map();
  const toDelete = [];

  for (const row of rows) {
    if (!keepByTech.has(row.cfldTechId)) {
      keepByTech.set(row.cfldTechId, row[idField]);
    } else {
      toDelete.push(row[idField]);
    }
  }

  if (toDelete.length > 0) {
    await prisma[model].deleteMany({
      where: { [idField]: { in: toDelete } },
    });
  }

  return { model, kept: keepByTech.size, deleted: toDelete.length };
}

async function main() {
  const results = [];
  results.push(await dedupeTable({ model: 'cfldSocioEconomicParameters', idField: 'cfldSocioEconomicId' }));
  results.push(await dedupeTable({ model: 'cfldFarmersPerceptionParameters', idField: 'cfldPerceptionId' }));
  console.log(JSON.stringify({ success: true, results }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

