const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const {
    buildPayloadFromRecords,
} = require('../repositories/reports/trainingCapacityReport/trainingCapacityReportRepository.js');
const {
    renderTrainingCapacityReportSection,
} = require('../services/reports/formsTemplate/achievementTemplates/trainingCapacityReportTemplate.js');
const { parseSectionHtml } = require('../utils/htmlReportTableParser.js');

function mockRecord(overrides) {
    return {
        trainingAchievementId: overrides.trainingAchievementId,
        kvkId: 1,
        stateName: 'Karnataka',
        trainingTypeId: 1,
        trainingTypeName: 'Farmers and Farm Women',
        trainingAreaId: 10,
        trainingAreaName: 'Crop Production',
        thematicAreaId: 100,
        thematicAreaName: 'Weed Management',
        generalM: 1,
        generalF: 2,
        obcM: 3,
        obcF: 4,
        scM: 5,
        scF: 6,
        stM: 7,
        stF: 8,
        ...overrides,
    };
}

function sumRows(rows, field) {
    return rows.reduce((sum, row) => sum + row[field], 0);
}

test('training capacity payload hides unspecified areas and orders thematic rows by master id', () => {
    const payload = buildPayloadFromRecords([
        mockRecord({
            trainingAchievementId: 1,
            thematicAreaId: 101,
            thematicAreaName: 'Weed Management',
        }),
        mockRecord({
            trainingAchievementId: 2,
            thematicAreaId: 99,
            thematicAreaName: 'Any Others (If Any)',
        }),
        mockRecord({
            trainingAchievementId: 3,
            thematicAreaId: null,
            thematicAreaName: 'Other ad hoc topic',
        }),
        mockRecord({
            trainingAchievementId: 4,
            trainingAreaId: null,
            trainingAreaName: 'Not specified',
            thematicAreaId: 500,
            thematicAreaName: 'Should not render',
            generalM: 100,
            generalF: 100,
            obcM: 100,
            obcF: 100,
            scM: 100,
            scF: 100,
            stM: 100,
            stF: 100,
        }),
    ], { reportingYear: '2025-04-01' });

    assert.equal(payload.sections.length, 1);
    const section = payload.sections[0];

    assert.deepEqual(
        section.trainingAreaSummary.map((row) => row.trainingAreaName),
        ['Crop Production'],
    );
    assert.equal(section.trainingAreaSummaryGrand.courses, sumRows(section.trainingAreaSummary, 'courses'));
    assert.equal(section.trainingAreaSummaryGrand.grandT, sumRows(section.trainingAreaSummary, 'grandT'));

    assert.equal(section.stateGrandTotal.courses, 4);
    assert.equal(payload.stateSummary.grandTotal.courses, 4);

    assert.equal(section.thematicDetailBlocks.length, 1);
    assert.equal(section.thematicDetailBlocks[0].trainingAreaName, 'Crop Production');
    assert.deepEqual(
        section.thematicDetailBlocks[0].rows.map((row) => row.thematicAreaName),
        ['Weed Management', 'Any Others (If Any)', 'Other ad hoc topic'],
    );

    const html = renderTrainingCapacityReportSection.call(
        { _escapeHtml: (value) => String(value) },
        { id: '2.4', title: 'Achievements on Training' },
        { payload },
        'section-2-4',
        true,
    );
    const parsed = parseSectionHtml(html);

    assert.equal(parsed.tables.length, 3);
    assert.equal(parsed.tables[1].rows[0][0].text, 'Training Area');
    assert.equal(parsed.tables[2].rows[0][0].text, 'Thematic Area');
});
