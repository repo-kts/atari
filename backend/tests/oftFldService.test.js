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
