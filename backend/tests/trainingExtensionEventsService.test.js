const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const repository = require('../repositories/all-masters/trainingExtensionEventsRepository.js');
const service = require('../services/all-masters/trainingExtensionEventsService.js');

const CASES = [
    {
        entityName: 'training-areas',
        id: '21',
        nameField: 'trainingAreaName',
        name: 'Other',
        parentField: 'trainingTypeId',
        parentId: 2,
        existing: { trainingAreaId: 21, trainingAreaName: 'Other', trainingTypeId: 2 },
    },
    {
        entityName: 'training-thematic-areas',
        id: '22',
        nameField: 'trainingThematicAreaName',
        name: 'Any Other',
        parentField: 'trainingAreaId',
        parentId: 4,
        existing: { trainingThematicAreaId: 22, trainingThematicAreaName: 'Any Other', trainingAreaId: 4 },
    },
];

test('training creates scope duplicate checks to the selected parent', async () => {
    const originals = {
        nameExists: repository.nameExists,
        validateReferences: repository.validateReferences,
        create: repository.create,
    };

    try {
        for (const testCase of CASES) {
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

test('training partial updates retain stored parent scope for duplicate checks', async () => {
    const originals = {
        findById: repository.findById,
        nameExists: repository.nameExists,
        validateReferences: repository.validateReferences,
        update: repository.update,
    };

    try {
        for (const testCase of CASES) {
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

            assert.deepEqual(duplicateCheck, [
                testCase.entityName,
                testCase.name,
                testCase.id,
                { [testCase.parentField]: testCase.parentId },
            ]);
        }
    } finally {
        Object.assign(repository, originals);
    }
});
