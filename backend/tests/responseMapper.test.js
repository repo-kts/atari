const test = require('node:test');
const assert = require('node:assert/strict');

const { mapCommonRelations } = require('../utils/responseMapper.js');

test('mapCommonRelations maps reportingYear relation object with IDs', () => {
    const mapped = mapCommonRelations(
        {
            reportingYearId: 5,
            reportingYear: { yearId: 5, yearName: '2024-25' },
        },
        { includeYear: true }
    );

    assert.equal(mapped.reportingYearId, 5);
    assert.equal(mapped.yearId, 5);
    assert.equal(mapped.reportingYear, '2024-25');
});

test('mapCommonRelations maps date-like reportingYear strings safely', () => {
    const mapped = mapCommonRelations(
        {
            reportingYearId: 7,
            reportingYear: '2024-04-01T00:00:00.000Z',
        },
        { includeYear: true }
    );

    assert.equal(mapped.reportingYearId, 7);
    assert.equal(mapped.yearId, 7);
    assert.equal(mapped.reportingYear, '2024');
});
