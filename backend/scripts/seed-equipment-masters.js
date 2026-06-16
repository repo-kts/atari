#!/usr/bin/env node
/**
 * Seed equipment_type_master, equipment_master AND the migration-only
 * equipment_model_master. Wipes all three first, then re-seeds from the
 * generated 3-tuple list in constants/equipmentRaw.js.
 *
 *   RAW row = [equipmentType, equipmentName, companyBrandModel]
 *     equipmentType     → equipment_type_master.name
 *     equipmentName     → equipment_master.name (curated, under its type)
 *     companyBrandModel → equipment_model_master.name (old-site raw name;
 *                         migration-only reverse-lookup key)
 *
 * Regenerate RAW from the CSV first if it changed:
 *   node scripts/gen-equipment-raw.js
 * Then run from backend/: node scripts/seed-equipment-masters.js
 */
require('dotenv').config();
const prisma = require('../config/prisma.js');
const { RAW } = require('../constants/equipmentRaw.js');

async function main() {
    console.log('Wiping equipment_model_master, equipment_master and equipment_type_master...');
    // Child-first: model -> master -> type (FK order).
    await prisma.equipmentModelMaster.deleteMany({});
    await prisma.equipmentMaster.deleteMany({});
    await prisma.equipmentTypeMaster.deleteMany({});
    console.log('  Wiped.');

    // 1. Types (col0, distinct).
    const typeNames = [...new Set(RAW.map(([t]) => t))].sort();
    await prisma.equipmentTypeMaster.createMany({
        data: typeNames.map((name) => ({ name, isOther: name === 'Other' })),
    });
    const types = await prisma.equipmentTypeMaster.findMany({ select: { equipmentTypeId: true, name: true } });
    const typeMap = Object.fromEntries(types.map((t) => [t.name, t.equipmentTypeId]));
    console.log(`Types seeded: ${types.length}`);

    // 2. Equipment master (col0+col1, deduped within type).
    const seenEquip = new Set();
    const equipRows = [];
    for (const [typeName, name] of RAW) {
        const typeId = typeMap[typeName];
        const key = `${typeId}|${name.toLowerCase()}`;
        if (seenEquip.has(key)) continue;
        seenEquip.add(key);
        equipRows.push({ equipmentTypeId: typeId, name });
    }
    await prisma.equipmentMaster.createMany({ data: equipRows, skipDuplicates: true });
    const masters = await prisma.equipmentMaster.findMany({
        select: { equipmentMasterId: true, equipmentTypeId: true, name: true },
    });
    // Key parent equipment by `${typeId}|${lowercased name}`.
    const masterMap = Object.fromEntries(
        masters.map((m) => [`${m.equipmentTypeId}|${m.name.toLowerCase()}`, m.equipmentMasterId]),
    );
    console.log(`Equipment master seeded: ${masters.length}`);

    // 3. Model master (col2, the old-site raw name -> parent equipment master).
    const seenModel = new Set();
    const modelRows = [];
    let skippedModels = 0;
    for (const [typeName, name, model] of RAW) {
        if (!model) { skippedModels += 1; continue; }
        const typeId = typeMap[typeName];
        const masterId = masterMap[`${typeId}|${name.toLowerCase()}`];
        if (!masterId) { skippedModels += 1; continue; }
        const key = `${masterId}|${model.toLowerCase()}`;
        if (seenModel.has(key)) continue;
        seenModel.add(key);
        modelRows.push({ equipmentMasterId: masterId, name: model });
    }
    const { count } = await prisma.equipmentModelMaster.createMany({ data: modelRows, skipDuplicates: true });
    console.log(`Equipment model master seeded: ${count} (${RAW.length - count} raw rows collapsed/skipped, ${skippedModels} without a model/parent).`);

    console.log('Done.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
