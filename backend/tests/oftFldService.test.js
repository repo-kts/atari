const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const repository = require('../repositories/all-masters/oftFldRepository.js');
const service = require('../services/all-masters/oftFldService.js');

test('OFT thematic-area updates scope duplicate checks to the selected subject', async () => {
    const originals = {
        findById: repository.findById,
        nameExists: repository.nameExists,
        validateReferences: repository.validateReferences,
        update: repository.update,
    };

    let duplicateCheck;

    repository.findById = async () => ({
        oftThematicAreaId: 18,
        thematicAreaName: 'Others',
        oftSubjectId: 2,
    });
    repository.nameExists = async (...args) => {
        duplicateCheck = args;
        return false;
    };
    repository.validateReferences = async () => true;
    repository.update = async (_entityName, id, data) => ({
        oftThematicAreaId: Number(id),
        ...data,
    });

    try {
        await service.update('oft-thematic-areas', '18', {
            oftSubjectId: 2,
            thematicAreaName: 'Others',
            isOther: true,
        });

        assert.deepEqual(duplicateCheck, [
            'oft-thematic-areas',
            'Others',
            '18',
            { oftSubjectId: 2 },
        ]);
    } finally {
        Object.assign(repository, originals);
    }
});

test('dependent FLD and CFLD updates scope duplicate checks to their stored parents', async () => {
    const originals = {
        findById: repository.findById,
        nameExists: repository.nameExists,
        validateReferences: repository.validateReferences,
        update: repository.update,
    };

    const cases = [
        {
            entityName: 'fld-thematic-areas',
            id: '11',
            nameField: 'thematicAreaName',
            name: 'Others',
            existing: { thematicAreaId: 11, thematicAreaName: 'Others', sectorId: 6 },
            scope: { sectorId: 6 },
        },
        {
            entityName: 'fld-categories',
            id: '12',
            nameField: 'categoryName',
            name: 'Others',
            existing: { categoryId: 12, categoryName: 'Others', sectorId: 6 },
            scope: { sectorId: 6 },
        },
        {
            entityName: 'fld-subcategories',
            id: '13',
            nameField: 'subCategoryName',
            name: 'Others',
            existing: { subCategoryId: 13, subCategoryName: 'Others', categoryId: 1, sectorId: 6 },
            scope: { categoryId: 1, sectorId: 6 },
        },
        {
            entityName: 'cfld-crops',
            id: '14',
            nameField: 'cropName',
            name: 'Other',
            existing: { cfldId: 14, cropName: 'Other', seasonId: 1, typeId: 2 },
            scope: { seasonId: 1, typeId: 2 },
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
            repository.update = async (_entityName, id, data) => ({ id: Number(id), ...data });

            await service.update(testCase.entityName, testCase.id, {
                [testCase.nameField]: testCase.name,
                isOther: true,
            });

            assert.deepEqual(duplicateCheck, [
                testCase.entityName,
                testCase.name,
                testCase.id,
                testCase.scope,
            ]);
        }
    } finally {
        Object.assign(repository, originals);
    }
});
