const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const productionSupplyRepository = require('../repositories/forms/productionSupplyRepository.js');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function productionSupplyRecord(data) {
    return {
        productionSupplyId: '6eb1198c-632e-4ae9-b3f5-3d7d2580d140',
        farmersGeneralM: 0,
        farmersGeneralF: 0,
        farmersObcM: 0,
        farmersObcF: 0,
        farmersScM: 0,
        farmersScF: 0,
        farmersStM: 0,
        farmersStF: 0,
        ...data,
    };
}

test('production supply create accepts an omitted species name and stores null', async () => {
    const originalKvkFindUnique = prisma.kvk.findUnique;
    const originalCreate = prisma.kvkProductionSupply.create;
    let captured;

    prisma.kvk.findUnique = async () => ({ kvkId: 1 });
    prisma.kvkProductionSupply.create = async (args) => {
        captured = args.data;
        return productionSupplyRecord(args.data);
    };

    try {
        await productionSupplyRepository.create({
            kvkId: 1,
            reportingYear: '2026-01-01',
            quantity: 1,
            value: 100,
        });

        assert.equal(captured.speciesName, null);
    } finally {
        prisma.kvk.findUnique = originalKvkFindUnique;
        prisma.kvkProductionSupply.create = originalCreate;
    }
});

test('production supply update converts a blank species name to null', async () => {
    const originalFindFirst = prisma.kvkProductionSupply.findFirst;
    const originalUpdate = prisma.kvkProductionSupply.update;
    let captured;

    prisma.kvkProductionSupply.findFirst = async () => ({
        productionSupplyId: '6eb1198c-632e-4ae9-b3f5-3d7d2580d140',
        kvkId: 1,
    });
    prisma.kvkProductionSupply.update = async (args) => {
        captured = args.data;
        return productionSupplyRecord(args.data);
    };

    try {
        await productionSupplyRepository.update(
            '6eb1198c-632e-4ae9-b3f5-3d7d2580d140',
            { speciesName: '   ' },
        );

        assert.equal(captured.speciesName, null);
    } finally {
        prisma.kvkProductionSupply.findFirst = originalFindFirst;
        prisma.kvkProductionSupply.update = originalUpdate;
    }
});

test('production supply optional species contract is reflected in schema and form', () => {
    const schema = read('prisma/kvk/achievements/production_supply_schema.prisma');
    const form = read('../frontend/src/pages/dashboard/shared/forms/ProductionProjectForms.tsx');

    assert.match(schema, /^\s*speciesName\s+String\?\s+@map\("species_name"\)/m);
    assert.match(
        form,
        /label="Species \/ Breed \/ Variety"\s+value=/,
    );
});
