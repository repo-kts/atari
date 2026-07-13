const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const repository = require('../repositories/all-masters/otherMastersRepository.js');
const service = require('../services/all-masters/otherMastersService.js');
const prisma = require('../config/prisma.js');

const SCOPED_CASES = [
    {
        entityName: 'equipment-master',
        id: '31',
        nameField: 'name',
        name: 'Other',
        parentField: 'equipmentTypeId',
        parentId: 3,
        existing: { equipmentMasterId: 31, name: 'Other', equipmentTypeId: 3 },
    },
    {
        entityName: 'nicra-sub-category',
        id: '32',
        nameField: 'subCategoryName',
        name: 'Other',
        parentField: 'nicraCategoryId',
        parentId: 5,
        existing: { nicraSubCategoryId: 32, subCategoryName: 'Other', nicraCategoryId: 5 },
    },
];

test('other-master creates scope duplicate checks only for configured dependent masters', async () => {
    const originals = {
        nameExists: repository.nameExists,
        validateReferences: repository.validateReferences,
        create: repository.create,
    };

    try {
        for (const testCase of SCOPED_CASES) {
            let duplicateCheck;
            repository.nameExists = async (...args) => {
                duplicateCheck = args;
                return false;
            };
            repository.validateReferences = async () => true;
            repository.create = async (_entityName, data) => data;

            await service.create(testCase.entityName, {
                [testCase.nameField]: testCase.name,
                [testCase.parentField]: testCase.parentId,
            });

            assert.deepEqual(duplicateCheck, [
                testCase.entityName,
                testCase.name,
                null,
                { [testCase.parentField]: testCase.parentId },
            ]);
        }
    } finally {
        Object.assign(repository, originals);
    }
});

test('other-master partial updates retain stored parent scope and keep financial projects global', async () => {
    const originals = {
        findById: repository.findById,
        nameExists: repository.nameExists,
        validateReferences: repository.validateReferences,
        update: repository.update,
    };

    const cases = [
        ...SCOPED_CASES,
        {
            entityName: 'financial-project',
            id: '33',
            nameField: 'projectName',
            name: 'National Project',
            existing: { financialProjectId: 33, projectName: 'National Project', fundingSourceId: 7 },
            expectedScope: {},
        },
    ];

    try {
        for (const testCase of cases) {
            let duplicateCheck;
            repository.findById = async () => testCase.existing;
            repository.nameExists = async (...args) => {
                duplicateCheck = args;
                return false;
            };
            repository.validateReferences = async () => true;
            repository.update = async (_entityName, _id, data) => data;

            await service.update(testCase.entityName, testCase.id, {
                [testCase.nameField]: testCase.name,
                isOther: true,
            });

            const expectedScope = testCase.expectedScope || { [testCase.parentField]: testCase.parentId };
            assert.deepEqual(duplicateCheck, [
                testCase.entityName,
                testCase.name,
                testCase.id,
                expectedScope,
            ]);
        }
    } finally {
        Object.assign(repository, originals);
    }
});

test('other-master repository includes parent scope and excludes current ID in its Prisma query', async () => {
    const originalCount = prisma.equipmentMaster.count;
    let capturedWhere;
    prisma.equipmentMaster.count = async ({ where }) => {
        capturedWhere = where;
        return 0;
    };

    try {
        const exists = await repository.nameExists(
            'equipment-master',
            'Other',
            '31',
            { equipmentTypeId: 3 },
        );

        assert.equal(exists, false);
        assert.deepEqual(capturedWhere, {
            name: { equals: 'Other', mode: 'insensitive' },
            equipmentTypeId: 3,
            equipmentMasterId: { not: 31 },
        });
    } finally {
        prisma.equipmentMaster.count = originalCount;
    }
});
