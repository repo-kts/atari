const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { ENTITY_CONFIG } = require('../repositories/all-masters/otherMastersRepository.js');
const repository = require('../repositories/all-masters/otherMastersRepository.js');
const agriDroneRepository = require('../repositories/all-masters/agriDroneDemonstrationsOnRepository.js');
const prisma = require('../config/prisma.js');

test('discipline master permits the isOther flag to be persisted', () => {
    assert.deepEqual(ENTITY_CONFIG.discipline.extraFields, ['isOther']);
});

test('generic other-master updates persist isOther even without a legacy extraFields allowlist', async () => {
    const original = prisma.staffCategoryMaster.update;
    let captured;
    prisma.staffCategoryMaster.update = async (args) => {
        captured = args;
        return args.data;
    };

    try {
        await repository.update('staff-category', 1, { categoryName: 'Other', isOther: true });
        assert.equal(captured.data.isOther, true);
    } finally {
        prisma.staffCategoryMaster.update = original;
    }
});

test('specialized Agri Drone updates persist isOther', async () => {
    const original = prisma.agriDroneDemonstrationsOnMaster.update;
    let captured;
    prisma.agriDroneDemonstrationsOnMaster.update = async (args) => {
        captured = args;
        return { agriDroneDemonstrationsOnId: 1, ...args.data };
    };

    try {
        await agriDroneRepository.update(1, { demonstrationsOnName: 'Other', isOther: true });
        assert.equal(captured.data.isOther, true);
    } finally {
        prisma.agriDroneDemonstrationsOnMaster.update = original;
    }
});
